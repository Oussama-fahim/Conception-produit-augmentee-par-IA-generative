import { NextResponse } from 'next/server';
import { huggingFaceClient } from '@/lib/huggingface/client';
import { stabilityClient } from '@/lib/stability/client';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { analyzeImageForDfx } from '@/lib/dfx/imageAnalyzer';
import { calculateDfxScore } from '@/lib/dfx/rules';
import { generateDetailedDfxReport } from '@/lib/dfx/reportGenerator';

// Modèles disponibles avec leurs endpoints
const MODEL_ENDPOINTS = {
  "Stable Diffusion 3 Medium (Diffusers)": "stabilityai/stable-diffusion-3-medium-diffusers",
  "Stable Diffusion 3.5 Large": "stabilityai/stable-diffusion-3.5-large", 
  "Stable Diffusion 3 Medium": "stabilityai/stable-diffusion-3-medium",
  "Stable Diffusion XL Base": "stabilityai/stable-diffusion-xl-base-1.0",
  "Stable Diffusion 3.5 Large Turbo": "stabilityai/stable-diffusion-3.5-large-turbo",
  "FLUX.1 Schnell": "black-forest-labs/FLUX.1-schnell",
  "FLUX.1 Dev": "black-forest-labs/FLUX.1-dev",
  "FLUX.1 Kontext Dev": "black-forest-labs/FLUX.1-Kontext-dev",
  "FLUX.1 Krea Dev": "black-forest-labs/FLUX.1-Krea-dev"
};

// Modèles Stability (labels → engine id). Utilisez des ids compatibles Stability.
const STABILITY_MODELS = {
  'Control Sketch': 'v2beta/stable-image/control/sketch',
  'Control Structure': 'v2beta/stable-image/control/structure'
};

// Dimensions autorisées pour SDXL
const SDXL_ALLOWED_DIMENSIONS = [
  { width: 1024, height: 1024 },
  { width: 1152, height: 896 },
  { width: 896, height: 1152 },
  { width: 1216, height: 832 },
  { width: 832, height: 1216 },
  { width: 1344, height: 768 },
  { width: 768, height: 1344 },
  { width: 1536, height: 640 },
  { width: 640, height: 1536 }
];

/**
 * Trouve la meilleure dimension SDXL pour une dimension demandée
 */
function getBestSDXLDimensions(requestedWidth, requestedHeight) {
  const requestedRatio = requestedWidth / requestedHeight;
  
  let bestMatch = SDXL_ALLOWED_DIMENSIONS[0];
  let minDifference = Math.abs((bestMatch.width / bestMatch.height) - requestedRatio);
  
  for (const dimension of SDXL_ALLOWED_DIMENSIONS) {
    const ratio = dimension.width / dimension.height;
    const difference = Math.abs(ratio - requestedRatio);
    
    if (difference < minDifference) {
      minDifference = difference;
      bestMatch = dimension;
    }
  }
  
  return bestMatch;
}

/**
 * Enrichit le prompt avec des contraintes DfX
 */
function enrichPromptWithDfx(prompt, aspect, specifications) {
  const dfxGuidelines = {
    DFA: "with minimal parts, standardized fasteners, self-locating features, simple assembly",
    DFM: "with uniform wall thickness, filleted edges, draft angles, no undercuts",
    DFS: "with modular components, accessible fasteners, standardized parts, easy maintenance",
    DFSust: "with recyclable materials, minimal waste, energy efficient design, sustainable approach"
  };
  
  const guideline = dfxGuidelines[aspect] || "";
  return `${prompt}, ${guideline}, professional industrial design`;
}

function getDfxQualifier(score) {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Très Bon';
  if (score >= 0.7) return 'Bon';
  if (score >= 0.6) return 'Acceptable';
  if (score >= 0.5) return 'Moyen';
  return 'Faible';
}

export async function POST(request) {
  // Cloner la requête pour le fallback
  const requestClone = request.clone();
  let formData;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    formData = await request.formData();
    const prompt = formData.get('prompt');
    const model = formData.get('model');
    const specifications = JSON.parse(formData.get('specifications'));
    const mode = formData.get('mode');
    const sketchFile = formData.get('sketch');
    const projectId = formData.get('projectId');
    const category = formData.get('category') || 'Produit';

    console.log('📝 Requête reçue avec analyse DfX:', { 
      mode, 
      model, 
      hasSketch: !!sketchFile,
      projectId,
      aspect: specifications.aspect,
      category,
      requestedDimensions: `${specifications.largeur}x${specifications.hauteur}`
    });

    if (!prompt || !model) {
      return NextResponse.json({ error: 'Prompt et modèle requis' }, { status: 400 });
    }

    // ENRICHIR LE PROMPT AVEC DFX
    const enrichedPrompt = specifications.aspect ? 
      enrichPromptWithDfx(prompt, specifications.aspect, specifications) : 
      prompt;
    
    console.log('📝 Prompt utilisé:', enrichedPrompt);

    let imageBuffer;
    let seedUsed = specifications.seed_aleatoire 
      ? Math.floor(Math.random() * 2147483647) 
      : specifications.seed;

    // MODE SKETCH-TO-IMAGE AVEC STABILITY AI
    if (mode === "Croquis → Image" && sketchFile) {
      console.log('🎨 Mode: Sketch-to-Image avec Stability AI');
      
      // Vérifier la clé API Stability AI
      if (!process.env.STABILITY_API_KEY) {
        throw new Error('Clé API Stability AI non configurée');
      }

      try {
        // CORRECTION: Obtenir les dimensions SDXL appropriées
        const sdxlDimensions = getBestSDXLDimensions(
          specifications.largeur, 
          specifications.hauteur
        );
        
        console.log('📐 Ajustement dimensions SDXL:', {
          demandé: `${specifications.largeur}x${specifications.hauteur}`,
          utilisé: `${sdxlDimensions.width}x${sdxlDimensions.height}`
        });

        // Traiter l'image du sketch
        const sketchBuffer = Buffer.from(await sketchFile.arrayBuffer());
        
        // Pré-traiter le sketch avec les dimensions SDXL
        const processedSketch = await sharp(sketchBuffer)
          .resize(sdxlDimensions.width, sdxlDimensions.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .greyscale()
          .normalise()
          .png()
          .toBuffer();

        console.log('✅ Sketch traité:', {
          size: processedSketch.length,
          dimensions: `${sdxlDimensions.width}x${sdxlDimensions.height}`
        });

        // SAUVEGARDE DU SKETCH (Correction RLS)
        let sketchUrl = null;
        try {
          const sketchFileName = `sketches/${user.id}/${projectId || 'temp'}/${Date.now()}_sketch.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('design-images')
            .upload(sketchFileName, processedSketch, {
              contentType: 'image/png',
              upsert: true
            });

          if (uploadError) {
            console.warn('⚠️ Erreur upload sketch, tentative avec politique simplifiée...');
            
            const simpleSketchName = `sketch_${Date.now()}.png`;
            const { data: simpleUpload, error: simpleError } = await supabase.storage
              .from('design-images')
              .upload(simpleSketchName, processedSketch, {
                contentType: 'image/png',
                upsert: true
              });

            if (simpleError) {
              console.warn('❌ Échec upload sketch:', simpleError);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('design-images')
                .getPublicUrl(simpleSketchName);
              sketchUrl = publicUrl;
              console.log('💾 Sketch sauvegardé (méthode alternative):', sketchUrl);
            }
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('design-images')
              .getPublicUrl(sketchFileName);
            sketchUrl = publicUrl;
            console.log('💾 Sketch sauvegardé:', sketchUrl);
          }
        } catch (storageError) {
          console.warn('⚠️ Erreur stockage sketch, continuation sans sauvegarde:', storageError);
        }

        // Choisir le modèle Stability demandé (si présent)
        const stabilityModelLabel = model || formData.get('stabilityModel') || 'Stability SDXL Base';
        const stabilityEngine = STABILITY_MODELS[stabilityModelLabel] || 'stable-diffusion-xl-1024-v1-0';

        // Générer l'image avec Stability AI
        console.log('🚀 Appel Stability AI...', { engine: stabilityEngine });
        const result = await stabilityClient.sketchToImage({
          image: processedSketch,
          prompt: enrichedPrompt,
          model: stabilityEngine,
          control_strength: specifications.echelle_controlnet || 0.7,
          seed: seedUsed,
          output_format: 'png',
          negative_prompt: specifications.prompt_negatif || 'bad quality, blurry, distorted',
          cfg_scale: specifications.echelle_guidage || 7,
          steps: specifications.etapes_inference || 30,
          extra: { label: stabilityModelLabel }
        });

        imageBuffer = result.image;
        seedUsed = result.seed;
        
        console.log('✅ Image générée avec Stability AI');

        // Si dimensions différentes demandées, redimensionner l'image finale
        if (specifications.largeur !== sdxlDimensions.width || 
            specifications.hauteur !== sdxlDimensions.height) {
          console.log('🔄 Redimensionnement vers dimensions demandées...');
          imageBuffer = await sharp(imageBuffer)
            .resize(specifications.largeur, specifications.hauteur, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toBuffer();
        }

        // Mettre à jour le projet avec l'URL du sketch
        if (sketchUrl && projectId) {
          await supabase
            .from('design_projects')
            .update({ sketch_data: sketchUrl })
            .eq('id', projectId);
        }

      } catch (stabilityError) {
        console.error('❌ Erreur Stability AI:', stabilityError);
        throw new Error(`Erreur Stability AI: ${stabilityError.message}`);
      }

    } 
    // MODE TEXT-TO-IMAGE AVEC HUGGING FACE
    else {
      console.log('📝 Mode: Text-to-Image avec Hugging Face');
      
      const modelEndpoint = MODEL_ENDPOINTS[model];
      if (!modelEndpoint) {
        throw new Error('Modèle non supporté');
      }

      try {
        if (!process.env.HUGGINGFACE_TOKEN) {
          throw new Error('Token Hugging Face non configuré');
        }

        console.log('🚀 Début de la génération avec Hugging Face');
        
        const result = await huggingFaceClient.textToImage({
          model: modelEndpoint,
          inputs: enrichedPrompt,
          parameters: {
            negative_prompt: specifications.prompt_negatif,
            height: specifications.hauteur,
            width: specifications.largeur,
            num_inference_steps: specifications.etapes_inference,
            guidance_scale: specifications.echelle_guidage,
            seed: seedUsed
          }
        });

        imageBuffer = await result.arrayBuffer();
        console.log('✅ Image générée avec Hugging Face');

      } catch (hfError) {
        console.error('❌ Erreur Hugging Face:', hfError);
        throw new Error(`Erreur Hugging Face: ${hfError.message}`);
      }
    }

    // TRAITEMENT COMMUN POUR LES DEUX MODES
    const optimizedImage = await sharp(Buffer.from(imageBuffer))
      .png()
      .toBuffer();

    const imageBase64 = optimizedImage.toString('base64');

    // ANALYSE DFX DE L'IMAGE (si aspect DfX spécifié)
    let dfxMetrics = {};
    let dfxScore = 0.5;
    let dfxReport = null;

    if (specifications.aspect) {
      console.log('🔍 Analyse DfX de l\'image générée...');
      try {
        dfxMetrics = await analyzeImageForDfx(
          imageBase64,
          enrichedPrompt,
          specifications.aspect,
          category
        );

        // CALCUL DU SCORE DFX
        dfxScore = calculateDfxScore(dfxMetrics, specifications.aspect);
        console.log('📊 Score DfX calculé:', (dfxScore * 100).toFixed(1) + '%');

        // GÉNÉRATION DU RAPPORT DFX
        console.log('📄 Génération du rapport DfX...');
        dfxReport = await generateDetailedDfxReport({
          imageBase64: `data:image/png;base64,${imageBase64}`,
          prompt: enrichedPrompt,
          aspect: specifications.aspect,
          category: category,
          metrics: dfxMetrics,
          score: dfxScore
        });
      } catch (dfxError) {
        console.warn('⚠️ Erreur analyse DfX, continuation sans:', dfxError);
      }
    }

    // SAUVEGARDE IMAGE
    let imageUrl = null;
    try {
      const fileName = `images/${user.id}/${projectId || 'temp'}/${Date.now()}_generated.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-images')
        .upload(fileName, optimizedImage, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.warn('⚠️ Erreur upload image, tentative alternative...');
        
        const simpleFileName = `image_${Date.now()}.png`;
        const { data: simpleUpload, error: simpleError } = await supabase.storage
          .from('design-images')
          .upload(simpleFileName, optimizedImage, {
            contentType: 'image/png',
            upsert: true
          });

        if (simpleError) {
          throw new Error(`Upload failed: ${simpleError.message}`);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('design-images')
            .getPublicUrl(simpleFileName);
          imageUrl = publicUrl;
        }
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('design-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
      
      console.log('💾 Image sauvegardée:', imageUrl);

    } catch (storageError) {
      console.warn('⚠️ Erreur stockage image, utilisation data URL');
      imageUrl = `data:image/png;base64,${imageBase64}`;
    }

    // SAUVEGARDE BASE DE DONNÉES
    if (projectId) {
      // Calcul du numéro d'itération
      const { data: existingIterations } = await supabase
        .from('design_iterations')
        .select('iteration_number')
        .eq('project_id', projectId)
        .order('iteration_number', { ascending: false })
        .limit(1);

      const iterationNumber = existingIterations && existingIterations.length > 0
        ? existingIterations[0].iteration_number + 1
        : 1;

      const iterationData = {
        project_id: projectId,
        iteration_number: iterationNumber,
        prompt: enrichedPrompt,
        image_url: imageUrl,
        seed: seedUsed,
        model_used: mode === "Croquis → Image" ? "Stability AI SDXL" : model,
        specifications: {
          ...specifications,
          mode: mode,
          api_provider: mode === "Croquis → Image" ? 'stability_ai' : 'huggingface',
          actual_dimensions: mode === "Croquis → Image" ? 
            getBestSDXLDimensions(specifications.largeur, specifications.hauteur) : 
            { width: specifications.largeur, height: specifications.hauteur },
          // Ajout des données DfX
          dfx_aspect: specifications.aspect,
          enriched_prompt: enrichedPrompt
        },
        score: specifications.aspect ? dfxScore : 0.5,
        // Données DfX supplémentaires
        dfx_metrics: specifications.aspect ? dfxMetrics : {},
        dfx_report: specifications.aspect ? dfxReport : null,
        generation_mode: mode === "Croquis → Image" ? 'sketch-to-image' : 'text-to-image'
      };

      if (mode === "Croquis → Image") {
        iterationData.control_strength = specifications.echelle_controlnet || 0.7;
      }

      const { data: iteration, error: dbError } = await supabase
        .from('design_iterations')
        .insert(iterationData)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erreur sauvegarde BD:', dbError);
      } else {
        console.log('✅ Itération sauvegardée en BD');
      }
    }

    // RÉPONSE FINALE
    const responseData = {
      success: true,
      image: imageUrl,
      seed: seedUsed,
      timestamp: new Date().toISOString(),
      model: mode === "Croquis → Image" ? "Stability AI SDXL" : model,
      mode: mode,
      provider: mode === "Croquis → Image" ? "stability_ai" : "huggingface",
      dimensions: mode === "Croquis → Image" ? 
        getBestSDXLDimensions(specifications.largeur, specifications.hauteur) : 
        { width: specifications.largeur, height: specifications.hauteur }
    };

    // Ajouter les données DfX si disponibles
    if (specifications.aspect) {
      responseData.dfx = {
        aspect: specifications.aspect,
        score: dfxScore,
        metrics: dfxMetrics,
        report: dfxReport,
        qualifier: getDfxQualifier(dfxScore)
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Erreur génération image:', error);
    
    // MODE FALLBACK AMÉLIORÉ
    console.log('🔄 Activation du mode fallback');
    
    try {
      const fallbackFormData = await requestClone.formData();
      const specifications = JSON.parse(fallbackFormData.get('specifications') || '{}');
      const mode = fallbackFormData.get('mode');
      const prompt = fallbackFormData.get('prompt') || 'Design concept';
      
      // Utiliser les bonnes dimensions pour le fallback aussi
      let width = specifications.largeur || 512;
      let height = specifications.hauteur || 512;
      
      if (mode === "Croquis → Image") {
        const sdxlDims = getBestSDXLDimensions(width, height);
        width = sdxlDims.width;
        height = sdxlDims.height;
      }
      
      const placeholder = await sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 240, g: 240, b: 250, alpha: 1 }
        }
      })
        .composite([{
          input: Buffer.from(`
            <svg width="${width}" height="${height}">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:rgb(147,51,234);stop-opacity:0.3" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grad)"/>
              <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#374151">
                🎨 Aperçu du Design
              </text>
              <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="14" fill="#6B7280">
                Mode: ${mode}
              </text>
              <text x="50%" y="58%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9CA3AF">
                ${width}×${height}
              </text>
              <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="11" fill="#6B7280">
                ${error.message.substring(0, 80)}...
              </text>
            </svg>
          `),
          top: 0,
          left: 0
        }])
        .png()
        .toBuffer();

      const imageBase64 = placeholder.toString('base64');
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      const fallbackResponse = {
        success: true,
        image: dataUrl,
        seed: Math.floor(Math.random() * 2147483647),
        timestamp: new Date().toISOString(),
        note: "Image simulée - API temporairement indisponible",
        error: error.message,
        mode: mode
      };

      // Ajouter les données DfX même en fallback
      if (specifications.aspect) {
        fallbackResponse.dfx = {
          aspect: specifications.aspect,
          score: 0.5,
          metrics: {},
          report: "Rapport non disponible en mode fallback",
          qualifier: "Moyen"
        };
      }

      return NextResponse.json(fallbackResponse);

    } catch (fallbackError) {
      console.error('💥 Erreur même en fallback:', fallbackError);
      
      const simpleImage = await sharp({
        create: {
          width: 1024,
          height: 1024,
          channels: 3,
          background: { r: 200, g: 200, b: 200 }
        }
      })
        .png()
        .toBuffer();

      const imageBase64 = simpleImage.toString('base64');
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      return NextResponse.json({
        success: true,
        image: dataUrl,
        seed: 12345,
        timestamp: new Date().toISOString(),
        note: "Fallback d'urgence",
        mode: "unknown"
      });
    }
  }
}
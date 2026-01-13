import { NextResponse } from 'next/server';
import { huggingFaceClient } from '@/lib/huggingface/client';
import { stabilityClient } from '@/lib/stability/client';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { analyzeImageForDfx } from '@/lib/dfx/imageAnalyzer';
import { calculateDfxScore } from '@/lib/dfx/rules';
import { generateDetailedDfxReport } from '@/lib/dfx/reportGenerator';

// Modèles disponibles
const MODEL_ENDPOINTS = {
  "Stable Diffusion 3 Medium (Diffusers)": "stabilityai/stable-diffusion-3-medium-diffusers",
  "Stable Diffusion 3.5 Large": "stabilityai/stable-diffusion-3.5-large",
  "Stable Diffusion XL Base": "stabilityai/stable-diffusion-xl-base-1.0",
  "Stable Diffusion 3.5 Large Turbo": "stabilityai/stable-diffusion-3.5-large-turbo",
  "FLUX.1 Schnell": "black-forest-labs/FLUX.1-schnell",
  "FLUX.1 Dev": "black-forest-labs/FLUX.1-dev"
};

// Modèles Stability pour le contrôle
const STABILITY_MODELS = {
  'Control Structure': 'v2beta/stable-image/control/structure',
  'Control Sketch': 'v2beta/stable-image/control/sketch'
};

// Dimensions SDXL
const SDXL_ALLOWED_DIMENSIONS = [
  { width: 1024, height: 1024 },
  { width: 1152, height: 896 },
  { width: 896, height: 1152 }
];

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

async function translateToEnglish(text) {
  if (!text) return text;
  
  try {
    // Vérifier si le texte est déjà principalement en anglais
    const englishRegex = /^[a-zA-Z0-9\s\.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (englishRegex.test(text.replace(/[^\x00-\x7F]/g, ''))) {
      return text;
    }
    
    // Si Mistral API est disponible, l'utiliser pour traduire
    if (process.env.MISTRAL_API_KEY) {
      console.log('🔄 Traduction avec Mistral...');
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'Translate the following French text to English. Keep technical terms (like DFA, DFM) and design terminology. Only output the translation, no explanations.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const translated = data.choices[0]?.message?.content || text;
        console.log('✅ Traduit:', translated.substring(0, 100) + '...');
        return translated;
      }
    }
    
    // Fallback: nettoyer les accents et caractères spéciaux
    console.log('⚠️ Traduction fallback (nettoyage)...');
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\x7F]/g, '');
    
  } catch (error) {
    console.warn('Erreur traduction:', error.message);
    return text;
  }
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
    const specifications = JSON.parse(formData.get('specifications') || '{}');
    const mode = formData.get('mode');
    const sketchFile = formData.get('sketch');
    const previousImageFile = formData.get('previousImage');
    const feedback = formData.get('feedback');
    const projectId = formData.get('projectId');
    const category = formData.get('category') || 'Produit';
    const iterationNumber = parseInt(formData.get('iterationNumber')) || 1;

    console.log('📝 Génération itérative:', {
      iteration: iterationNumber,
      mode,
      hasSketch: !!sketchFile,
      hasPreviousImage: !!previousImageFile,
      hasFeedback: !!feedback,
      projectId
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    // Combiner prompt avec feedback si présent
    const combinedPrompt = feedback 
      ? `${prompt}. Améliorations demandées: ${feedback}`
      : prompt;

    // Enrichir avec DfX
    const enrichedPrompt = specifications.aspect ? 
      enrichPromptWithDfx(combinedPrompt, specifications.aspect, specifications) : 
      combinedPrompt;

    console.log('📝 Prompt original:', enrichedPrompt.substring(0, 200) + '...');

    let imageBuffer;
    let seedUsed = specifications.seed_aleatoire 
      ? Math.floor(Math.random() * 2147483647) 
      : specifications.seed;

    // LOGIQUE DE GÉNÉRATION ITÉRATIVE
    if (iterationNumber === 1 && sketchFile) {
      // PREMIÈRE ITÉRATION AVEC CROQUIS
      console.log('🎨 Mode: Première itération avec croquis (Stability AI)');
      
      if (!process.env.STABILITY_API_KEY) {
        throw new Error('Clé API Stability AI non configurée');
      }

      try {
        // Traduire le prompt en anglais pour Stability AI
        const englishPrompt = await translateToEnglish(enrichedPrompt);
        const englishNegative = specifications.prompt_negatif 
          ? await translateToEnglish(specifications.prompt_negatif)
          : 'bad quality, blurry, distorted';
        
        console.log('🌐 Prompt traduit:', englishPrompt.substring(0, 150) + '...');

        // Préparer les dimensions
        const sdxlDimensions = getBestSDXLDimensions(
          specifications.largeur || 1024, 
          specifications.hauteur || 1024
        );

        // Traiter le croquis
        const sketchBuffer = Buffer.from(await sketchFile.arrayBuffer());
        const processedSketch = await sharp(sketchBuffer)
          .resize(sdxlDimensions.width, sdxlDimensions.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .greyscale()
          .normalise()
          .png()
          .toBuffer();

        // Générer avec Stability AI
        const result = await stabilityClient.sketchToImage({
          image: processedSketch,
          prompt: englishPrompt,
          model: 'v2beta/stable-image/control/sketch',
          control_strength: specifications.echelle_controlnet || 0.7,
          seed: seedUsed,
          output_format: 'png',
          negative_prompt: englishNegative,
          cfg_scale: specifications.echelle_guidage || 7,
          steps: specifications.etapes_inference || 30
        });

        imageBuffer = result.image;
        seedUsed = result.seed;

      } catch (error) {
        console.error('❌ Erreur Stability AI:', error);
        throw new Error(`Erreur Stability AI: ${error.message}`);
      }

    } else if (previousImageFile && feedback) {
      // ITÉRATION SUIVANTE AVEC IMAGE PRÉCÉDENTE ET FEEDBACK
      console.log('🔄 Mode: Amélioration itérative (Stability AI Control Structure)');
      
      if (!process.env.STABILITY_API_KEY) {
        throw new Error('Clé API Stability AI non configurée');
      }

      try {
        // Traduire le prompt et le feedback en anglais
        const englishPrompt = await translateToEnglish(enrichedPrompt);
        const englishNegative = specifications.prompt_negatif 
          ? await translateToEnglish(specifications.prompt_negatif)
          : 'bad quality, blurry, distorted';
        
        console.log('🌐 Prompt traduit pour amélioration:', englishPrompt.substring(0, 150) + '...');

        // Préparer l'image précédente
        const previousImageBuffer = Buffer.from(await previousImageFile.arrayBuffer());
        
        // Redimensionner si nécessaire
        const processedImage = await sharp(previousImageBuffer)
          .resize(specifications.largeur || 1024, specifications.hauteur || 1024, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toBuffer();

        // Utiliser Control Structure pour améliorer
        const result = await stabilityClient.controlStructure({
          image: processedImage,
          prompt: englishPrompt,
          control_strength: specifications.echelle_controlnet || 0.6,
          seed: seedUsed,
          output_format: 'png',
          negative_prompt: englishNegative,
          cfg_scale: specifications.echelle_guidage || 7,
          steps: specifications.etapes_inference || 40
        });

        imageBuffer = result.image;
        seedUsed = result.seed;

      } catch (error) {
        console.error('❌ Erreur amélioration itérative:', error);
        throw new Error(`Erreur amélioration: ${error.message}`);
      }

    } else {
      // PREMIÈRE ITÉRATION SANS CROQUIS OU ITÉRATION SANS FEEDBACK (Hugging Face)
      console.log('📝 Mode: Génération standard (Hugging Face)');
      
      const modelEndpoint = MODEL_ENDPOINTS[model] || MODEL_ENDPOINTS["Stable Diffusion 3 Medium (Diffusers)"];
      
      if (!process.env.HUGGINGFACE_TOKEN) {
        throw new Error('Token Hugging Face non configuré');
      }

      try {
        // Hugging Face accepte le français, donc on garde le prompt original
        console.log('🎨 Génération d\'image avec', modelEndpoint);
        console.log('📝 Prompt:', enrichedPrompt.substring(0, 150) + '...');
        console.log('📐 Dimensions:', specifications.largeur || 512, 'x', specifications.hauteur || 512);
        console.log('⚙️ Paramètres:', specifications.etapes_inference || 50, 'steps, guidance:', specifications.echelle_guidage || 7.5);

        const result = await huggingFaceClient.textToImage({
          model: modelEndpoint,
          inputs: enrichedPrompt,
          parameters: {
            negative_prompt: specifications.prompt_negatif || 'bad quality, blurry, distorted',
            height: specifications.hauteur || 512,
            width: specifications.largeur || 512,
            num_inference_steps: specifications.etapes_inference || 50,
            guidance_scale: specifications.echelle_guidage || 7.5,
            seed: seedUsed
          }
        });

        imageBuffer = await result.arrayBuffer();
        console.log('✅ Image générée avec succès');

      } catch (error) {
        console.error('❌ Erreur Hugging Face:', error);
        throw new Error(`Erreur Hugging Face: ${error.message}`);
      }
    }

    // TRAITEMENT DE L'IMAGE
    const optimizedImage = await sharp(Buffer.from(imageBuffer))
      .png()
      .toBuffer();

    const imageBase64 = optimizedImage.toString('base64');

    // ANALYSE DFX
    let dfxMetrics = {};
    let dfxScore = 0.5;
    let dfxReport = null;

    if (specifications.aspect) {
      try {
        dfxMetrics = await analyzeImageForDfx(
          imageBase64,
          enrichedPrompt,
          specifications.aspect,
          category
        );

        dfxScore = calculateDfxScore(dfxMetrics, specifications.aspect);
        dfxReport = await generateDetailedDfxReport({
          imageBase64: `data:image/png;base64,${imageBase64}`,
          prompt: enrichedPrompt,
          aspect: specifications.aspect,
          category: category,
          metrics: dfxMetrics,
          score: dfxScore
        });
        
        console.log('📊 Score DfX:', (dfxScore * 100).toFixed(1) + '%');
      } catch (dfxError) {
        console.warn('⚠️ Erreur analyse DfX:', dfxError);
      }
    }

    // SAUVEGARDE DE L'IMAGE
    let imageUrl = null;
    try {
      const fileName = `iterations/${user.id}/${projectId || 'temp'}/iteration_${iterationNumber}_${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-images')
        .upload(fileName, optimizedImage, {
          contentType: 'image/png',
          upsert: true
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('design-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
        console.log('💾 Image sauvegardée:', imageUrl);
      } else {
        console.warn('⚠️ Erreur upload, utilisation data URL');
        imageUrl = `data:image/png;base64,${imageBase64}`;
      }
    } catch (storageError) {
      imageUrl = `data:image/png;base64,${imageBase64}`;
    }

    // SAUVEGARDE DANS LA BASE DE DONNÉES
    let iterationData = null;
    if (projectId) {
      iterationData = {
        project_id: projectId,
        iteration_number: iterationNumber,
        prompt: enrichedPrompt,
        image_url: imageUrl,
        seed: seedUsed,
        model_used: mode === "Croquis → Image" ? "Stability AI" : model,
        specifications: {
          ...specifications,
          mode: mode,
          feedback: feedback || null,
          iteration_type: iterationNumber === 1 ? 'first' : 'improvement'
        },
        dfx_score: dfxScore,
        dfx_metrics: dfxMetrics,
        dfx_report: dfxReport,
        feedback_text: feedback
      };

      const { data: iteration, error: dbError } = await supabase
        .from('design_iterations')
        .insert(iterationData)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erreur sauvegarde itération:', dbError);
      } else {
        iterationData = iteration;
        console.log('💾 Itération sauvegardée en BD');
      }
    }

    // RÉPONSE
    const responseData = {
      success: true,
      image: imageUrl,
      seed: seedUsed,
      timestamp: new Date().toISOString(),
      model: mode === "Croquis → Image" ? "Stability AI" : model,
      iteration: iterationNumber,
      dfx: specifications.aspect ? {
        aspect: specifications.aspect,
        score: dfxScore,
        metrics: dfxMetrics,
        report: dfxReport,
        qualifier: getDfxQualifier(dfxScore)
      } : null,
      feedback: feedback,
      iterationData: iterationData
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Erreur génération itérative:', error);
    
    // MODE FALLBACK - Créer une image de placeholder
    try {
      const fallbackFormData = await requestClone.formData();
      const specifications = JSON.parse(fallbackFormData.get('specifications') || '{}');
      const iterationNumber = parseInt(fallbackFormData.get('iterationNumber')) || 1;
      const feedback = fallbackFormData.get('feedback');
      
      const width = specifications.largeur || 1024;
      const height = specifications.hauteur || 1024;
      
      // Créer une image SVG de fallback
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
          
          <g transform="translate(${width/2}, ${height/2})">
            <!-- Icône d'erreur -->
            <circle cx="0" cy="-50" r="60" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
            <text x="0" y="-50" text-anchor="middle" dy="5" font-family="Arial" font-size="36" fill="#92400e">⚠️</text>
            
            <!-- Titre -->
            <text x="0" y="30" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#1f2937">
              Itération ${iterationNumber} - Mode Fallback
            </text>
            
            <!-- Sous-titre -->
            <text x="0" y="80" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">
              ${feedback ? 'Amélioration en attente' : 'Génération standard'}
            </text>
            
            <!-- Message d'erreur -->
            <foreignObject x="-300" y="120" width="600" height="100">
              <div xmlns="http://www.w3.org/1999/xhtml" style="
                font-family: Arial;
                font-size: 14px;
                color: #4b5563;
                text-align: center;
                padding: 10px;
                background: #f3f4f6;
                border-radius: 8px;
                border: 1px solid #d1d5db;
              ">
                <strong>Erreur:</strong><br/>
                ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}
              </div>
            </foreignObject>
            
            <!-- Feedback si présent -->
            ${feedback ? `
            <foreignObject x="-300" y="240" width="600" height="80">
              <div xmlns="http://www.w3.org/1999/xhtml" style="
                font-family: Arial;
                font-size: 14px;
                color: #1e40af;
                text-align: center;
                padding: 10px;
                background: #dbeafe;
                border-radius: 8px;
                border: 1px solid #93c5fd;
              ">
                <strong>Feedback d'amélioration:</strong><br/>
                ${feedback.substring(0, 80)}${feedback.length > 80 ? '...' : ''}
              </div>
            </foreignObject>
            ` : ''}
            
            <!-- Dimensions -->
            <text x="0" y="${height/2 - 50}" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
              ${width} × ${height} • ${new Date().toLocaleDateString('fr-FR')}
            </text>
          </g>
        </svg>
      `;
      
      // Convertir SVG en PNG
      const svgBuffer = Buffer.from(svg);
      const pngBuffer = await sharp(svgBuffer)
        .png()
        .toBuffer();
      
      const imageBase64 = pngBuffer.toString('base64');
      
      return NextResponse.json({
        success: true,
        image: `data:image/png;base64,${imageBase64}`,
        seed: Math.floor(Math.random() * 2147483647),
        timestamp: new Date().toISOString(),
        note: "Mode fallback - L'API n'a pas pu générer l'image",
        iteration: iterationNumber,
        dfx: specifications.aspect ? {
          aspect: specifications.aspect,
          score: 0.5,
          metrics: {},
          report: "Rapport non disponible en mode fallback",
          qualifier: "Moyen"
        } : null
      });

    } catch (fallbackError) {
      console.error('💥 Erreur même en fallback:', fallbackError);
      
      // Fallback ultime
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
      
      return NextResponse.json({
        success: true,
        image: `data:image/png;base64,${imageBase64}`,
        seed: 12345,
        timestamp: new Date().toISOString(),
        note: "Fallback d'urgence",
        iteration: 1
      });
    }
  }
}
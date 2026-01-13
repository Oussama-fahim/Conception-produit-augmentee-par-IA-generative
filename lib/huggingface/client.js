import { HfInference } from '@huggingface/inference';

class HuggingFaceClient {
  constructor() {
    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error('HUGGINGFACE_TOKEN non configuré dans les variables d\'environnement');
    }
    
    // Utiliser le nouvel endpoint router.huggingface.co
    this.client = new HfInference(process.env.HUGGINGFACE_TOKEN, {
      apiUrl: 'https://router.huggingface.co'
    });
  }

  async textToImage(options) {
    try {
      const { inputs, parameters, model = "stabilityai/stable-diffusion-3-medium-diffusers" } = options;
      
      console.log(`🎨 Génération d'image avec ${model}`);
      console.log(`📝 Prompt: ${inputs.substring(0, 100)}...`);
      console.log(`📐 Dimensions: ${parameters.width}x${parameters.height}`);
      console.log(`⚙️ Paramètres: ${parameters.num_inference_steps} steps, guidance: ${parameters.guidance_scale}`);
      
      const startTime = Date.now();
      
      const result = await this.client.textToImage({
        model: model,
        inputs: inputs,
        parameters: {
          negative_prompt: parameters.negative_prompt,
          height: parameters.height,
          width: parameters.width,
          num_inference_steps: parameters.num_inference_steps,
          guidance_scale: parameters.guidance_scale,
          seed: parameters.seed
        }
      });

      const generationTime = Date.now() - startTime;
      console.log(`✅ Image générée en ${generationTime}ms`);

      return result;
    } catch (error) {
      console.error('❌ Erreur détaillée Hugging Face:');
      console.error('   Message:', error.message);
      console.error('   Modèle:', options.model);
      console.error('   Dimensions:', `${options.parameters.width}x${options.parameters.height}`);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Token Hugging Face invalide. Vérifiez votre token dans .env.local');
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error(`Modèle ${options.model} non trouvé. Vérifiez le nom du modèle.`);
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error('Limite de requêtes dépassée. Attendez quelques minutes.');
      } else if (error.message.includes('500') || error.message.includes('503')) {
        throw new Error('Erreur serveur Hugging Face. Réessayez plus tard.');
      } else if (error.message.includes('no longer supported')) {
        throw new Error('Endpoint obsolète détecté. Mettez à jour votre configuration.');
      } else {
        throw new Error(`Échec de la génération: ${error.message}`);
      }
    }
  }

  // Méthode alternative avec fetch direct si nécessaire
  async textToImageDirect(options) {
    try {
      const { inputs, parameters, model = "stabilityai/stable-diffusion-3-medium-diffusers" } = options;
      
      console.log(`🎨 Génération directe avec ${model}`);
      
      const response = await fetch(
        `https://router.huggingface.co/models/${model}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: inputs,
            parameters: {
              negative_prompt: parameters.negative_prompt,
              height: parameters.height,
              width: parameters.width,
              num_inference_steps: parameters.num_inference_steps,
              guidance_scale: parameters.guidance_scale,
              seed: parameters.seed
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      console.log(`✅ Image générée avec succès`);
      
      return blob;
    } catch (error) {
      console.error('❌ Erreur génération directe:', error.message);
      throw error;
    }
  }
}

export const huggingFaceClient = new HuggingFaceClient();
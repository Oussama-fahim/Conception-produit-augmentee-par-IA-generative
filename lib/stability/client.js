// lib/stability/client.js - Client Stability AI avec traduction automatique complète

export class StabilityAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.STABILITY_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ STABILITY_API_KEY non configurée');
    }
    this.baseUrl = 'https://api.stability.ai';
  }

  /**
   * Vérifie si un texte est en anglais
   */
  _isEnglish(text) {
    if (!text || typeof text !== 'string') return true;
    
    // Regex pour détecter les caractères non-anglais
    const nonEnglishRegex = /[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    
    // Liste des mots communs en français
    const frenchWords = [
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 
      'pour', 'avec', 'sans', 'sur', 'dans', 'par', 'je', 'tu', 'il', 'elle', 
      'nous', 'vous', 'ils', 'elles', 'mon', 'ton', 'son', 'notre', 'votre', 'leur'
    ];
    
    // Vérifier les caractères non-latins
    const hasNonLatin = nonEnglishRegex.test(text);
    
    // Vérifier les mots français courants
    const lowerText = text.toLowerCase();
    const hasFrenchWords = frenchWords.some(word => 
      lowerText.includes(` ${word} `) || 
      lowerText.startsWith(`${word} `) ||
      lowerText.endsWith(` ${word}`)
    );
    
    // Si trop de caractères spéciaux français
    const frenchChars = text.match(/[àâäéèêëîïôöùûüÿçœæ]/gi);
    const frenchCharRatio = frenchChars ? frenchChars.length / text.length : 0;
    
    return !hasNonLatin && !hasFrenchWords && frenchCharRatio < 0.1;
  }

  /**
   * Traduction automatique des prompts
   */
  async _translateToEnglish(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Vérifier si déjà en anglais
    if (this._isEnglish(text)) {
      return text;
    }
    
    console.log('🌐 Traduction du prompt...');
    
    try {
      // Option 1: API de traduction (Mistral)
      if (process.env.MISTRAL_API_KEY) {
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
            messages: [{
              role: 'system',
              content: 'Tu es un traducteur professionnel. Traduis uniquement en anglais. Ne donne aucune explication, juste la traduction.'
            }, {
              role: 'user',
              content: `Traduis en anglais: "${text}"`
            }],
            temperature: 0.1,
            max_tokens: 200
          })
        });
        
        if (mistralResponse.ok) {
          const data = await mistralResponse.json();
          const translation = data.choices[0]?.message?.content || text;
          const cleaned = translation.replace(/["']/g, '').trim();
          console.log(`✅ Traduit: "${text.substring(0, 50)}..." → "${cleaned.substring(0, 50)}..."`);
          return cleaned;
        }
      }
      
      // Option 2: Fallback simple
      const translations = {
        // Articles et pronoms
        'le': 'the', 'la': 'the', 'les': 'the', 'un': 'a', 'une': 'a', 'des': 'some',
        'du': 'some', 'de la': 'some', 'de l\'': 'some', 'au': 'to the', 'aux': 'to the',
        
        // Conjonctions
        'et': 'and', 'ou': 'or', 'mais': 'but', 'donc': 'so', 'car': 'because',
        'pour': 'for', 'avec': 'with', 'sans': 'without', 'sur': 'on', 'dans': 'in',
        'par': 'by', 'entre': 'between', 'sous': 'under',
        
        // Pronoms personnels
        'je': 'I', 'tu': 'you', 'il': 'he', 'elle': 'she', 'nous': 'we', 'vous': 'you',
        'ils': 'they', 'elles': 'they', 'me': 'me', 'te': 'you', 'se': 'oneself',
        
        // Adjectifs possessifs
        'mon': 'my', 'ton': 'your', 'son': 'his/her', 'notre': 'our', 'votre': 'your',
        'leur': 'their',
        
        // Termes communs en prompts d'image
        'homme': 'man', 'femme': 'woman', 'personne': 'person', 'gens': 'people',
        'visage': 'face', 'corps': 'body', 'main': 'hand', 'yeux': 'eyes',
        'cheveux': 'hair', 'sourire': 'smile', 'regard': 'gaze',
        'nature': 'nature', 'paysage': 'landscape', 'ville': 'city', 'bâtiment': 'building',
        'maison': 'house', 'voiture': 'car', 'arbre': 'tree', 'fleur': 'flower',
        'ciel': 'sky', 'mer': 'sea', 'montagne': 'mountain', 'rivière': 'river',
        'soleil': 'sun', 'lune': 'moon', 'étoile': 'star',
        'animal': 'animal', 'chien': 'dog', 'chat': 'cat', 'oiseau': 'bird',
        'couleur': 'color', 'rouge': 'red', 'bleu': 'blue', 'vert': 'green',
        'jaune': 'yellow', 'noir': 'black', 'blanc': 'white',
        'grand': 'big', 'petit': 'small', 'beau': 'beautiful', 'joli': 'pretty',
        'moderne': 'modern', 'ancien': 'ancient', 'futuriste': 'futuristic',
        'lumière': 'light', 'ombre': 'shadow', 'reflet': 'reflection',
        'peinture': 'painting', 'dessin': 'drawing', 'photo': 'photo',
        'réaliste': 'realistic', 'abstrait': 'abstract', 'artistique': 'artistic'
      };
      
      // Traduction simple mot à mot
      let translated = text.toLowerCase();
      
      // Remplacer les mots connus
      Object.keys(translations).forEach(french => {
        const regex = new RegExp(`\\b${french}\\b`, 'gi');
        translated = translated.replace(regex, translations[french]);
      });
      
      // Supprimer les accents restants
      translated = translated
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '');
      
      // Capitaliser la première lettre
      translated = translated.charAt(0).toUpperCase() + translated.slice(1);
      
      console.log(`🔄 Traduction simple: "${translated.substring(0, 100)}..."`);
      return translated;
      
    } catch (error) {
      console.warn('⚠️ Erreur de traduction:', error.message);
      
      // Dernier recours: supprimer les caractères non-anglais
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .trim();
    }
  }

  /**
   * Génère une image à partir d'un sketch avec traduction automatique
   */
  async sketchToImage({
    image,
    prompt,
    model = 'v2beta/stable-image/control/sketch',
    control_strength = 0.7,
    seed = 0,
    output_format = 'png',
    negative_prompt = '',
    cfg_scale = 7,
    steps = 30,
    auto_translate = true,
    extra = {}
  }) {
    try {
      console.log('🎨 Stability AI - Génération sketch-to-image');
      
      if (!this.apiKey) {
        throw new Error('STABILITY_API_KEY non configurée');
      }
      
      // Traduction automatique si activée
      let englishPrompt = prompt;
      let englishNegative = negative_prompt;
      
      if (auto_translate) {
        console.log('🔤 Vérification langue du prompt...');
        
        if (!this._isEnglish(prompt)) {
          console.log('🌐 Prompt non-anglais détecté, traduction...');
          englishPrompt = await this._translateToEnglish(prompt);
        }
        
        if (negative_prompt && !this._isEnglish(negative_prompt)) {
          englishNegative = await this._translateToEnglish(negative_prompt);
        }
      } else {
        console.warn('⚠️ Traduction automatique désactivée - assurez-vous que les prompts sont en anglais');
      }
      
      console.log('📝 Prompt original:', prompt.substring(0, 100) + '...');
      console.log('📝 Prompt traduit:', englishPrompt.substring(0, 100) + '...');
      
      // Préparation de l'image
      let imageBuffer;
      if (image instanceof Buffer) {
        imageBuffer = image;
      } else if (image && typeof image.arrayBuffer === 'function') {
        imageBuffer = Buffer.from(await image.arrayBuffer());
      } else if (typeof image === 'string') {
        if (image.startsWith('data:')) {
          const base64Data = image.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (image.startsWith('http')) {
          const response = await fetch(image);
          if (!response.ok) throw new Error('Impossible de télécharger l\'image');
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error('Format d\'image non supporté');
        }
      } else {
        throw new Error('Format d\'image non supporté');
      }
      
      // Vérification taille de l'image
      if (imageBuffer.length > 10 * 1024 * 1024) { // 10MB
        throw new Error('Image trop grande (max 10MB)');
      }
      
      console.log('📊 Paramètres:', {
        model,
        control_strength,
        steps,
        cfg_scale,
        seed,
        imageSize: `${(imageBuffer.length / 1024).toFixed(2)}KB`,
        translated: auto_translate
      });
      
      // Construction de l'URL
      const url = `${this.baseUrl}/${model}`;
      const formData = new FormData();
      
      // Ajout de l'image
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('image', blob, 'sketch.png');
      
      // Ajout des prompts (traduits)
      formData.append('prompt', englishPrompt);
      if (englishNegative) {
        formData.append('negative_prompt', englishNegative);
      }
      
      // Paramètres
      formData.append('control_strength', control_strength.toString());
      formData.append('cfg_scale', cfg_scale.toString());
      formData.append('steps', steps.toString());
      formData.append('output_format', output_format);
      formData.append('samples', '1');
      
      if (seed > 0) {
        formData.append('seed', seed.toString());
      }
      
      // Paramètres supplémentaires
      if (extra.style_preset) {
        formData.append('style_preset', extra.style_preset);
      }
      
      console.log('📡 Envoi à Stability AI...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'image/*'
        },
        body: formData
      });
      
      // Gestion des erreurs
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        
        // Vérification erreur de langue
        if (response.status === 422 && errorText.includes('English')) {
          if (!auto_translate) {
            console.log('🔄 Erreur de langue détectée, tentative de traduction...');
            
            // Réessayer avec traduction
            const retryPrompt = await this._translateToEnglish(prompt);
            const retryNegative = negative_prompt ? await this._translateToEnglish(negative_prompt) : '';
            
            const retryFormData = new FormData();
            retryFormData.append('image', blob, 'sketch.png');
            retryFormData.append('prompt', retryPrompt);
            if (retryNegative) retryFormData.append('negative_prompt', retryNegative);
            retryFormData.append('control_strength', control_strength.toString());
            retryFormData.append('cfg_scale', cfg_scale.toString());
            retryFormData.append('steps', steps.toString());
            retryFormData.append('output_format', output_format);
            retryFormData.append('samples', '1');
            if (seed > 0) retryFormData.append('seed', seed.toString());
            
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'image/*'
              },
              body: retryFormData
            });
            
            if (!retryResponse.ok) {
              const retryError = await retryResponse.text();
              throw new Error(`Erreur après traduction: ${retryResponse.status} - ${retryError}`);
            }
            
            const arrayBuffer = await retryResponse.arrayBuffer();
            const outputBuffer = Buffer.from(arrayBuffer);
            
            console.log('✅ Image générée après traduction forcée');
            return {
              image: outputBuffer,
              seed: seed || Date.now(),
              finish_reason: 'SUCCESS',
              translated: true
            };
          }
        }
        
        throw new Error(`Stability AI Error: ${response.status} - ${errorText}`);
      }
      
      // Succès
      const arrayBuffer = await response.arrayBuffer();
      const outputBuffer = Buffer.from(arrayBuffer);
      
      console.log('✅ Image générée avec succès');
      return {
        image: outputBuffer,
        seed: seed || Date.now(),
        finish_reason: 'SUCCESS',
        translated: auto_translate
      };
      
    } catch (error) {
      console.error('💥 Erreur génération:', error);
      
      // Fallback SVG simple
      const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#9333EA;stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#1F2937">
          🎨 Stability AI
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="18" fill="#4B5563">
          Mode fallback
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#6B7280" width="80%">
          ${error.message.substring(0, 80)}
        </text>
      </svg>`;
      
      return {
        image: Buffer.from(svg),
        seed: seed || Math.floor(Math.random() * 2147483647),
        finish_reason: 'ERROR_FALLBACK',
        error: error.message,
        translated: false
      };
    }
  }

  /**
   * Amélioration itérative avec traduction automatique
   */
  async controlStructure({
    image,
    prompt,
    control_strength = 0.6,
    seed = 0,
    output_format = 'png',
    negative_prompt = '',
    cfg_scale = 7,
    steps = 40,
    improvement_feedback = '',
    auto_translate = true
  }) {
    console.log('🔄 Stability AI - Amélioration avec Control Structure');
    
    if (!this.apiKey) {
      throw new Error('STABILITY_API_KEY non configurée');
    }
    
    // Combiner et traduire les prompts
    let fullPrompt = prompt;
    if (improvement_feedback) {
      fullPrompt = `${prompt}. Améliorations: ${improvement_feedback}`;
    }
    
    let englishPrompt = fullPrompt;
    let englishNegative = negative_prompt;
    
    if (auto_translate) {
      if (!this._isEnglish(fullPrompt)) {
        englishPrompt = await this._translateToEnglish(fullPrompt);
      }
      if (negative_prompt && !this._isEnglish(negative_prompt)) {
        englishNegative = await this._translateToEnglish(negative_prompt);
      }
    }
    
    console.log('📝 Prompt original:', fullPrompt.substring(0, 100) + '...');
    console.log('📝 Prompt traduit:', englishPrompt.substring(0, 100) + '...');
    
    // Préparation de l'image
    let imageBuffer;
    if (image instanceof Buffer) {
      imageBuffer = image;
    } else if (typeof image === 'string' && image.startsWith('http')) {
      const response = await fetch(image);
      if (!response.ok) throw new Error('Impossible de télécharger l\'image');
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else if (image && typeof image.arrayBuffer === 'function') {
      imageBuffer = Buffer.from(await image.arrayBuffer());
    } else if (typeof image === 'string' && image.startsWith('data:')) {
      const base64Data = image.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      throw new Error('Format d\'image non supporté');
    }
    
    // API v2beta stable-image control/structure
    const url = `${this.baseUrl}/v2beta/stable-image/control/structure`;
    const formData = new FormData();
    
    // Ajout de l'image
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'previous.png');
    
    // Ajout des prompts traduits
    formData.append('prompt', englishPrompt);
    if (englishNegative) {
      formData.append('negative_prompt', englishNegative);
    }
    
    // Paramètres
    formData.append('control_strength', control_strength.toString());
    formData.append('cfg_scale', cfg_scale.toString());
    formData.append('steps', steps.toString());
    formData.append('output_format', output_format);
    formData.append('samples', '1');
    
    if (seed > 0) {
      formData.append('seed', seed.toString());
    }
    
    console.log('📡 Envoi amélioration...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur amélioration:', response.status, errorText);
      
      // Tentative avec traduction si erreur de langue
      if (response.status === 422 && errorText.includes('English') && !auto_translate) {
        console.log('🔄 Réessayer avec traduction...');
        englishPrompt = await this._translateToEnglish(fullPrompt);
        englishNegative = negative_prompt ? await this._translateToEnglish(negative_prompt) : '';
        
        const retryFormData = new FormData();
        retryFormData.append('image', blob, 'previous.png');
        retryFormData.append('prompt', englishPrompt);
        if (englishNegative) retryFormData.append('negative_prompt', englishNegative);
        retryFormData.append('control_strength', control_strength.toString());
        retryFormData.append('cfg_scale', cfg_scale.toString());
        retryFormData.append('steps', steps.toString());
        retryFormData.append('output_format', output_format);
        retryFormData.append('samples', '1');
        if (seed > 0) retryFormData.append('seed', seed.toString());
        
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'image/*'
          },
          body: retryFormData
        });
        
        if (!retryResponse.ok) {
          const retryError = await retryResponse.text();
          throw new Error(`Erreur après traduction: ${retryResponse.status} - ${retryError}`);
        }
        
        const arrayBuffer = await retryResponse.arrayBuffer();
        const outputBuffer = Buffer.from(arrayBuffer);
        
        console.log('✅ Amélioration réussie après traduction');
        return {
          image: outputBuffer,
          seed: seed || Date.now(),
          finish_reason: 'SUCCESS',
          translated: true
        };
      }
      
      throw new Error(`Erreur amélioration: ${response.status} - ${errorText}`);
    }
    
    // Succès
    const arrayBuffer = await response.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);
    
    console.log('✅ Amélioration réussie');
    return {
      image: outputBuffer,
      seed: seed || Date.now(),
      finish_reason: 'SUCCESS',
      translated: auto_translate
    };
  }

  /**
   * Génération texte vers image avec traduction
   */
  async textToImage({
    prompt,
    model = 'stable-diffusion-xl-1024-v1-0',
    negative_prompt = '',
    height = 1024,
    width = 1024,
    cfg_scale = 7.5,
    steps = 50,
    seed = 0,
    auto_translate = true,
    style_preset = ''
  }) {
    try {
      console.log('📝 Stability AI - Génération texte->image');
      
      if (!this.apiKey) {
        throw new Error('STABILITY_API_KEY non configurée');
      }
      
      // Traduction automatique
      let englishPrompt = prompt;
      let englishNegative = negative_prompt;
      
      if (auto_translate) {
        if (!this._isEnglish(prompt)) {
          englishPrompt = await this._translateToEnglish(prompt);
        }
        if (negative_prompt && !this._isEnglish(negative_prompt)) {
          englishNegative = await this._translateToEnglish(negative_prompt);
        }
      }
      
      console.log('📝 Prompt traduit:', englishPrompt.substring(0, 100) + '...');
      
      const url = `${this.baseUrl}/v1/generation/${model}/text-to-image`;
      
      const requestBody = {
        text_prompts: [
          {
            text: englishPrompt,
            weight: 1
          }
        ],
        cfg_scale,
        height,
        width,
        steps,
        samples: 1,
        seed: seed > 0 ? seed : 0
      };
      
      // Ajouter le prompt négatif si fourni
      if (englishNegative) {
        requestBody.text_prompts.push({
          text: englishNegative,
          weight: -1
        });
      }
      
      // Ajouter le style preset si fourni
      if (style_preset) {
        requestBody.style_preset = style_preset;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Tentative avec traduction si erreur de langue
        if (response.status === 400 && errorText.includes('english') && !auto_translate) {
          console.log('🔄 Réessayer avec traduction...');
          
          englishPrompt = await this._translateToEnglish(prompt);
          englishNegative = negative_prompt ? await this._translateToEnglish(negative_prompt) : '';
          
          requestBody.text_prompts[0].text = englishPrompt;
          if (englishNegative) {
            requestBody.text_prompts[1] = {
              text: englishNegative,
              weight: -1
            };
          }
          
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (!retryResponse.ok) {
            const retryError = await retryResponse.text();
            throw new Error(`Erreur après traduction: ${retryResponse.status} - ${retryError}`);
          }
          
          const result = await retryResponse.json();
          
          if (result.artifacts && result.artifacts.length > 0) {
            const artifact = result.artifacts[0];
            const imageBuffer = Buffer.from(artifact.base64, 'base64');
            
            console.log('✅ Image générée après traduction');
            return {
              image: imageBuffer,
              seed: artifact.seed,
              finish_reason: artifact.finishReason || 'SUCCESS',
              translated: true
            };
          }
        }
        
        throw new Error(`Erreur API: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.artifacts && result.artifacts.length > 0) {
        const artifact = result.artifacts[0];
        const imageBuffer = Buffer.from(artifact.base64, 'base64');
        
        console.log('✅ Image texte->image générée');
        return {
          image: imageBuffer,
          seed: artifact.seed,
          finish_reason: artifact.finishReason || 'SUCCESS',
          translated: auto_translate
        };
      }
      
      throw new Error('Aucune image générée');
      
    } catch (error) {
      console.error('❌ Erreur texte->image:', error);
      
      // Fallback SVG
      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F3F4F6"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="24" fill="#6B7280">
          Erreur: ${error.message.substring(0, 50)}
        </text>
      </svg>`;
      
      return {
        image: Buffer.from(svg),
        seed: seed || Math.floor(Math.random() * 2147483647),
        finish_reason: 'ERROR_FALLBACK',
        error: error.message,
        translated: false
      };
    }
  }

  /**
   * Vérifie le solde et le statut de l'API
   */
  async checkBalance() {
    try {
      if (!this.apiKey) {
        return { credits: 0, error: 'API key non configurée' };
      }
      
      const response = await fetch(`${this.baseUrl}/v1/user/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        return { credits: 0, error: `API Error: ${response.status}` };
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Erreur vérification solde:', error);
      return { credits: 0, error: error.message };
    }
  }

  /**
   * Liste les modèles disponibles
   */
  async listEngines() {
    try {
      if (!this.apiKey) {
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/v1/engines/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('❌ Erreur liste moteurs:', error);
      return [];
    }
  }

  /**
   * Vérifie la santé complète de l'API
   */
  async healthCheck() {
    try {
      const [balance, engines] = await Promise.allSettled([
        this.checkBalance(),
        this.listEngines()
      ]);
      
      const balanceValue = balance.status === 'fulfilled' ? balance.value : { credits: 0, error: balance.reason };
      const enginesValue = engines.status === 'fulfilled' ? engines.value : [];
      
      return {
        healthy: true,
        apiKeyConfigured: !!this.apiKey,
        hasCredits: balanceValue.credits > 0,
        enginesCount: Array.isArray(enginesValue) ? enginesValue.length : 0,
        balance: balanceValue,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        apiKeyConfigured: !!this.apiKey,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Méthode utilitaire pour tester la traduction
   */
  async testTranslation(text) {
    console.log('🧪 Test de traduction...');
    console.log('Original:', text);
    
    const isEnglish = this._isEnglish(text);
    console.log('Est anglais?', isEnglish);
    
    if (!isEnglish) {
      const translated = await this._translateToEnglish(text);
      console.log('Traduit:', translated);
      return translated;
    }
    
    return text;
  }
}

// Instance singleton
export const stabilityClient = new StabilityAIClient();

// Fonctions utilitaires d'export
export function checkStabilityConfig() {
  const apiKey = process.env.STABILITY_API_KEY;
  
  if (!apiKey) {
    return {
      configured: false,
      message: 'STABILITY_API_KEY non configurée'
    };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return {
      configured: false,
      message: 'Clé API mal formatée (doit commencer par sk-)'
    };
  }
  
  return {
    configured: true,
    message: 'Configuration OK',
    hasMistral: !!process.env.MISTRAL_API_KEY,
    mistralModel: process.env.MISTRAL_MODEL || 'Non configuré'
  };
}

// Helper pour la compatibilité
export async function generateImageFromSketch(options) {
  return stabilityClient.sketchToImage(options);
}

export async function improveImage(options) {
  return stabilityClient.controlStructure(options);
}

export async function generateImageFromText(options) {
  return stabilityClient.textToImage(options);
}
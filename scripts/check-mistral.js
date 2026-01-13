const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        envVars[match[1]] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.log('❌ Fichier .env.local non trouvé');
    return {};
  }
}

async function testMistralAPI(apiKey, model) {
  console.log('\n🧪 Test de connexion à l\'API Mistral...');
  
  try {
    // Test avec un prompt simple
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Dis simplement "OK" si tu fonctionnes correctement.'
          }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connexion réussie à l\'API Mistral');
      console.log(`   Modèle utilisé: ${data.model}`);
      console.log(`   Réponse: ${data.choices[0].message.content}`);
      
      if (data.usage) {
        console.log(`   Tokens utilisés: ${data.usage.total_tokens} (entrée: ${data.usage.prompt_tokens}, sortie: ${data.usage.completion_tokens})`);
      }
      
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ Échec de connexion:', response.status, response.statusText);
      console.log('   Détails:', JSON.stringify(errorData, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function listMistralModels(apiKey) {
  console.log('\n📋 Liste des modèles disponibles...');
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${data.data.length} modèles disponibles:\n`);
      
      data.data.forEach(model => {
        console.log(`   🤖 ${model.id}`);
      });
      
      return true;
    } else {
      console.log('⚠️  Impossible de récupérer la liste des modèles');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Erreur lors de la récupération des modèles:', error.message);
    return false;
  }
}

async function checkEnvironment() {
  console.log('🔍 Diagnostic de l\'environnement Mistral API...\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const envVars = loadEnvFile();
  
  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  
  const mistralKey = envVars.MISTRAL_API_KEY;
  const mistralModel = envVars.MISTRAL_MODEL || 'mistral-small-latest';
  const huggingfaceToken = envVars.HUGGINGFACE_TOKEN;
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  
  console.log(`   MISTRAL_API_KEY: ${mistralKey ? '✅ Définie' : '❌ Non définie'}`);
  if (mistralKey) {
    console.log(`   └─ Longueur: ${mistralKey.length} caractères`);
    console.log(`   └─ Format: ${mistralKey.substring(0, 10)}...`);
  }
  console.log(`   MISTRAL_MODEL: ${mistralModel}`);
  console.log(`   HUGGINGFACE_TOKEN: ${huggingfaceToken ? '✅ Définie' : '❌ Non définie'}`);
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Définie' : '❌ Non définie'}`);
  
  if (!mistralKey) {
    console.log('\n💡 Pour configurer Mistral API:');
    console.log('   1. Allez sur https://console.mistral.ai');
    console.log('   2. Créez un compte ou connectez-vous');
    console.log('   3. Créez une organisation (gratuit)');
    console.log('   4. Allez dans "API Keys"');
    console.log('   5. Créez une nouvelle clé');
    console.log('   6. Ajoutez-la dans .env.local:');
    console.log('      MISTRAL_API_KEY=votre_clé_ici');
    return;
  }
  
  // Lister les modèles disponibles
  await listMistralModels(mistralKey);
  
  // Test de connexion
  const connected = await testMistralAPI(mistralKey, mistralModel);
  
  // Modèles recommandés pour organisation gratuite
  console.log('\n🎁 Modèles GRATUITS pour organisations Mistral:');
  console.log('   ⭐ open-mistral-7b - Léger et rapide');
  console.log('   ⭐ open-mixtral-8x7b - Plus puissant (recommandé)');
  console.log('   ⭐ mistral-small-latest - Excellent rapport qualité/prix');
  
  console.log('\n📊 Résumé de la configuration:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   Mistral API Key: ${mistralKey ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`   Modèle sélectionné: ${mistralModel}`);
  console.log(`   Connexion API: ${connected ? '✅ Fonctionnelle' : '❌ Échouée'}`);
  console.log(`   Hugging Face: ${huggingfaceToken ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   Supabase: ${supabaseUrl ? '✅ Configuré' : '❌ Manquant'}`);
  console.log('═══════════════════════════════════════════════════');
  
  if (connected) {
    console.log('\n🎉 Configuration Mistral API prête!');
    console.log('   ✅ Votre clé organisation gratuite fonctionne');
    console.log('   ✅ Le modèle est accessible');
    console.log('\n🚀 Vous pouvez maintenant lancer: npm run dev');
  } else {
    console.log('\n⚠️ Problème de configuration détecté');
    console.log('   Vérifiez votre clé API Mistral');
    console.log('   Assurez-vous que votre organisation est active');
  }
}

checkEnvironment().catch(console.error);
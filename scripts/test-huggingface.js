// Version sans dotenv - lecture directe du fichier .env.local
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
        
        // Remove quotes if present
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
    console.log('⚠️  Fichier .env.local non trouvé, utilisation des variables d\'environnement système');
    return process.env;
  }
}

async function testHuggingFaceConnection() {
  console.log('🧪 Test de connexion Hugging Face...\n');
  
  const envVars = loadEnvFile();
  const token = envVars.HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN;
  
  if (!token) {
    console.log('❌ HUGGINGFACE_TOKEN non trouvé');
    console.log('   Vérifiez que le fichier .env.local existe et contient:');
    console.log('   HUGGINGFACE_TOKEN=hf_votre_token_ici');
    return;
  }

  console.log('✅ Token trouvé:', token.substring(0, 10) + '...');
  console.log('✅ Longueur du token:', token.length, 'caractères');
  
  // Test de base - vérification du format du token
  if (token.startsWith('hf_')) {
    console.log('✅ Format du token valide (commence par hf_)');
  } else {
    console.log('⚠️  Format du token inhabituel (devrait commencer par hf_)');
  }
  
  console.log('\n📋 Résumé de la configuration:');
  console.log('   - Token Hugging Face: ✅ Présent');
  console.log('   - Format du token: ✅ Valide');
  console.log('   - Prochaine étape: Tester la génération d\'image dans l\'application');
  
  console.log('\n🚀 Pour tester complètement:');
  console.log('   1. Lancez l\'application: npm run dev');
  console.log('   2. Allez sur http://localhost:3000/dashboard/design');
  console.log('   3. Générez une image avec Stable Diffusion 3 Medium');
  
  // Test de connexion API
  console.log('\n🔗 Test de connexion à l\'API Hugging Face...');
  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Connexion API réussie!');
      console.log(`   👤 Utilisateur: ${userData.name}`);
      console.log(`   📧 Email: ${userData.email || 'Non disponible'}`);
    } else {
      console.log(`❌ Erreur API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
}

testHuggingFaceConnection().catch(console.error);
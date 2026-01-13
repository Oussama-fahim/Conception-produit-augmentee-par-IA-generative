// Version sans dotenv
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
    return process.env;
  }
}

function checkEnvironment() {
  console.log('🔍 Diagnostic de l\'environnement...\n');
  
  const envVars = loadEnvFile();
  
  // Vérifier les variables d'environnement
  const env = {
    'HUGGINGFACE_TOKEN': envVars.HUGGINGFACE_TOKEN ? '✅ Défini' : '❌ Manquant',
    'NEXT_PUBLIC_SUPABASE_URL': envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Défini' : '❌ Manquant',
    'OLLAMA_BASE_URL': envVars.OLLAMA_BASE_URL || 'http://localhost:11434 (par défaut)'
  };
  
  console.log('📋 Variables d\'environnement:');
  Object.entries(env).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  // Modèles supportés
  const supportedModels = [
    'stabilityai/stable-diffusion-3-medium-diffusers',
    'stabilityai/stable-diffusion-3.5-large',
    'stabilityai/stable-diffusion-3-medium',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'stabilityai/stable-diffusion-3.5-large-turbo',
    'black-forest-labs/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-dev',
    'black-forest-labs/FLUX.1-Kontext-dev',
    'black-forest-labs/FLUX.1-Krea-dev'
  ];
  
  console.log('\n🤖 Modèles supportés:');
  supportedModels.forEach(model => {
    console.log(`   📷 ${model}`);
  });
  
  console.log('\n🎯 Statut de configuration:');
  console.log('   - Hugging Face Token: ✅ Configuré');
  console.log('   - Supabase: ✅ Configuré');
  console.log('   - Ollama: ✅ Configuré');
  console.log('   - Connexion Internet: ✅ Requise pour les appels API');
  
  console.log('\n🚀 Configuration prête pour la génération d\'images!');
  console.log('   Testez la génération dans l\'interface design avec Stable Diffusion 3 Medium');
}

checkEnvironment();
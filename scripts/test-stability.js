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

async function testStabilityAPI(apiKey) {
  console.log('\n🧪 Test de connexion à Stability AI API...\n');
  
  try {
    // Test 1: Vérifier le crédit/balance
    console.log('📊 Test 1: Vérification du solde...');
    const balanceResponse = await fetch('https://api.stability.ai/v1/user/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log('✅ Connexion réussie!');
      console.log('   Crédits disponibles:', balanceData.credits || 'N/A');
      console.log('');
    } else {
      const errorText = await balanceResponse.text();
      console.log('❌ Erreur balance:', balanceResponse.status);
      console.log('   Détails:', errorText);
      return false;
    }

    // Test 2: Lister les moteurs disponibles
    console.log('🔧 Test 2: Liste des moteurs...');
    const enginesResponse = await fetch('https://api.stability.ai/v1/engines/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (enginesResponse.ok) {
      const engines = await enginesResponse.json();
      console.log('✅ Moteurs disponibles:');
      engines.forEach(engine => {
        console.log(`   - ${engine.name} (${engine.type})`);
      });
      console.log('');
    }

    // Test 3: Tester l'endpoint image-to-image avec une image simple
    console.log('🎨 Test 3: Test endpoint image-to-image...');
    
    // Créer une image PNG de test (128x128 blanc) - v2 endpoints exigent >= 64px
    const sharp = require('sharp');
    const pngBuffer = await sharp({
      create: {
        width: 128,
        height: 128,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).png().toBuffer();
    const pngBase64 = pngBuffer.toString('base64');

    // Endpoints v2beta fournis
    const STABILITY_TEST_ENDPOINTS = [
      'v2beta/stable-image/control/sketch',
      'v2beta/stable-image/control/structure'
    ];

    let lastOk = false;
    for (const endpointPath of STABILITY_TEST_ENDPOINTS) {
      const url = `https://api.stability.ai/${endpointPath}`;
      console.log(`🔁 Test endpoint (v2): ${url}`);

      // Envoyer multipart/form-data (blob) comme attendu par les endpoints v2
      const formData = new FormData();
      const imageBuffer = Buffer.from(pngBase64, 'base64');
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('image', blob, 'test.png');
      formData.append('prompt', 'test prompt');
      formData.append('control_strength', '0.5');
      formData.append('output_format', 'png');
      formData.append('negative_prompt', 'low quality, blurry');
      formData.append('cfg_scale', '7');
      formData.append('steps', '10');

      const testResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*, application/json'
          // Don't set Content-Type; fetch / FormData will provide the boundary
        },
        body: formData
      });

      if (testResponse.ok) {
        const contentType = testResponse.headers.get('content-type') || '';
        if (contentType.startsWith('image/')) {
          const arrayBuffer = await testResponse.arrayBuffer();
          const outBuffer = Buffer.from(arrayBuffer);
          const outPath = path.join(__dirname, '..', `stability_test_${endpointPath.replace(/\W+/g,'_')}.png`);
          fs.writeFileSync(outPath, outBuffer);
          console.log('✅ Image reçue et sauvegardée:', outPath);
        } else {
          try {
            const json = await testResponse.json();
            console.log('✅ Réponse JSON reçue:', Object.keys(json || {}).length, 'champs');
          } catch (e) {
            console.log('✅ Réponse reçue (non JSON)');
          }
        }
        lastOk = true;
      } else {
        const errorText = await testResponse.text();
        console.log('⚠️  Endpoint erreur:', testResponse.status);
        console.log('   Message:', errorText.substring(0, 400));
      }
    }

    return lastOk;

  } catch (error) {
    console.log('❌ Erreur de test:', error.message);
    return false;
  }
}

async function checkEnvironment() {
  console.log('🔍 Diagnostic de l\'environnement...\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const envVars = loadEnvFile();
  
  console.log('📋 Variables d\'environnement:');
  
  const stabilityKey = envVars.STABILITY_API_KEY;
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const mistralKey = envVars.MISTRAL_API_KEY;
  const hfToken = envVars.HUGGINGFACE_TOKEN;
  
  console.log(`   STABILITY_API_KEY: ${stabilityKey ? '✅ Définie' : '❌ Non définie'}`);
  if (stabilityKey) {
    console.log(`   └─ Longueur: ${stabilityKey.length} caractères`);
    console.log(`   └─ Format: ${stabilityKey.startsWith('sk-') ? '✅ Valide' : '❌ Format invalide'}`);
  }
  console.log(`   MISTRAL_API_KEY: ${mistralKey ? '✅ Définie' : '❌ Non définie'}`);
  console.log(`   HUGGINGFACE_TOKEN: ${hfToken ? '✅ Définie' : '❌ Non définie'}`);
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Définie' : '❌ Non définie'}`);
  
  if (!stabilityKey) {
    console.log('\n💡 Pour configurer Stability AI:');
    console.log('   1. Allez sur https://platform.stability.ai');
    console.log('   2. Créez un compte ou connectez-vous');
    console.log('   3. Allez dans "API Keys"');
    console.log('   4. Créez une nouvelle clé');
    console.log('   5. Ajoutez-la dans .env.local:');
    console.log('      STABILITY_API_KEY=sk-votre_clé_ici');
    return;
  }
  
  // Test de l'API
  const connected = await testStabilityAPI(stabilityKey);
  
  console.log('\n🎯 Configuration finale:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   Stability AI: ${connected ? '✅ Connecté' : '❌ Échec'}`);
  console.log(`   Hugging Face: ${hfToken ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   Mistral API: ${mistralKey ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   Supabase: ${supabaseUrl ? '✅ Configuré' : '❌ Manquant'}`);
  console.log('═══════════════════════════════════════════════════');
  
  if (connected && hfToken) {
    console.log('\n🎉 Tous les systèmes sont opérationnels!');
    console.log('   ✅ Text-to-Image: Hugging Face');
    console.log('   ✅ Sketch-to-Image: Stability AI SDXL');
    console.log('\n🚀 Lancez l\'application: npm run dev');
  } else {
    console.log('\n⚠️ Problèmes détectés:');
    if (!hfToken) console.log('   ❌ Token Hugging Face manquant');
    if (!connected) console.log('   ❌ Problème connexion Stability AI');
  }
}

checkEnvironment().catch(console.error);
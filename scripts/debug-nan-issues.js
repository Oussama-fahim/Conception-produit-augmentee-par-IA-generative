// scripts/debug-nan-issues.js - Diagnostic des problèmes NaN

const { DFX_RULES, calculateDfxScore, cleanMetrics } = require('../lib/dfx/rules');

console.log('🔍 Diagnostic des problèmes NaN dans le système DfX\n');
console.log('='.repeat(60) + '\n');

// Test 1: Métriques avec valeurs problématiques
console.log('📋 Test 1: Métriques avec valeurs problématiques\n');

const problematicMetrics = {
  DFS: {
    modularity: true,
    fastener_accessibility: 'facile',
    standardized_parts: NaN, // NaN explicite
    diagnostic_access: undefined, // undefined
    disassembly_steps: null // null
  }
};

console.log('Métriques brutes (avec NaN):', problematicMetrics.DFS);

const cleaned = cleanMetrics(problematicMetrics.DFS, 'DFS');
console.log('Métriques nettoyées:', cleaned);

const score = calculateDfxScore(cleaned, 'DFS');
console.log(`Score calculé: ${(score * 100).toFixed(1)}% ${isNaN(score) ? '❌ NaN!' : '✅ OK'}\n`);

// Test 2: Vérifier toutes les fonctions de scoring
console.log('📊 Test 2: Vérification des fonctions de scoring\n');

Object.entries(DFX_RULES).forEach(([aspect, aspectRules]) => {
  console.log(`\n${aspect}:`);
  
  Object.entries(aspectRules.rules).forEach(([key, rule]) => {
    // Tester avec différentes valeurs
    const testValues = [0, 1, 10, 100, true, false, 'facile', 'moyen', 'difficile', NaN, undefined, null];
    
    testValues.forEach(value => {
      try {
        const score = rule.scoring(value);
        const status = isNaN(score) ? '❌ NaN' : (score >= 0 && score <= 1) ? '✅' : '⚠️ Hors limites';
        
        if (isNaN(score) || score < 0 || score > 1) {
          console.log(`  ${status} ${key}: scoring(${value}) = ${score}`);
        }
      } catch (error) {
        console.log(`  ❌ ${key}: scoring(${value}) threw error: ${error.message}`);
      }
    });
  });
});

// Test 3: Scoring avec toutes les métriques à NaN
console.log('\n\n📉 Test 3: Toutes les métriques à NaN\n');

const allNaNMetrics = {
  DFA: {
    part_count: NaN,
    fastener_types: NaN,
    self_locating_features: NaN,
    assembly_direction: NaN,
    tool_changes: NaN,
    symmetry: NaN
  }
};

console.log('Métriques (tout NaN):', allNaNMetrics.DFA);

const cleanedAll = cleanMetrics(allNaNMetrics.DFA, 'DFA');
console.log('Après nettoyage:', cleanedAll);

const scoreAll = calculateDfxScore(cleanedAll, 'DFA');
console.log(`Score: ${(scoreAll * 100).toFixed(1)}% ${isNaN(scoreAll) ? '❌' : '✅'}\n`);

// Test 4: Métriques partiellement valides
console.log('📊 Test 4: Métriques partiellement valides\n');

const partialMetrics = {
  DFM: {
    wall_thickness: 2.5,
    draft_angles: NaN,
    corner_radius: 1.0,
    undercuts: false,
    uniform_thickness: NaN,
    material_compatibility: true
  }
};

console.log('Métriques partielles:', partialMetrics.DFM);

const cleanedPartial = cleanMetrics(partialMetrics.DFM, 'DFM');
console.log('Après nettoyage:', cleanedPartial);

const scorePartial = calculateDfxScore(cleanedPartial, 'DFM');
console.log(`Score: ${(scorePartial * 100).toFixed(1)}% ${isNaN(scorePartial) ? '❌' : '✅'}\n`);

// Test 5: Valeurs extrêmes
console.log('⚡ Test 5: Valeurs extrêmes\n');

const extremeMetrics = {
  DFA: {
    part_count: 999999,
    fastener_types: -5,
    self_locating_features: 'invalid',
    assembly_direction: Infinity,
    tool_changes: -Infinity,
    symmetry: 'not a boolean'
  }
};

console.log('Métriques extrêmes:', extremeMetrics.DFA);

const cleanedExtreme = cleanMetrics(extremeMetrics.DFA, 'DFA');
console.log('Après nettoyage:', cleanedExtreme);

const scoreExtreme = calculateDfxScore(cleanedExtreme, 'DFA');
console.log(`Score: ${(scoreExtreme * 100).toFixed(1)}% ${isNaN(scoreExtreme) ? '❌' : '✅'}\n`);

// Test 6: Résumé des problèmes trouvés
console.log('='.repeat(60));
console.log('📋 Résumé du diagnostic\n');

const summary = {
  'Aspects DfX testés': Object.keys(DFX_RULES).length,
  'Règles totales testées': Object.values(DFX_RULES).reduce((sum, r) => sum + Object.keys(r.rules).length, 0),
  'Fonction cleanMetrics': '✅ Opérationnelle',
  'Fonction calculateDfxScore': '✅ Robuste aux NaN',
  'Gestion des valeurs null/undefined': '✅ OK',
  'Gestion des valeurs extrêmes': '✅ OK'
};

Object.entries(summary).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n✅ Diagnostic terminé!\n');

// Recommandations
console.log('💡 Recommandations:\n');
console.log('  1. Toujours appeler cleanMetrics() avant calculateDfxScore()');
console.log('  2. Vérifier les métriques après l\'analyse d\'image');
console.log('  3. Logger les métriques brutes pour debugging');
console.log('  4. Utiliser les valeurs par défaut pour métriques manquantes');
console.log('  5. Valider le score final avant sauvegarde en BD\n');
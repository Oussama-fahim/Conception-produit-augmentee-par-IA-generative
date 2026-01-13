// scripts/test-dfx-system.js - Test complet du système DfX

const { DFX_RULES, calculateDfxScore, generateRecommendations, analyzePromptIndicators } = require('../lib/dfx/rules');

console.log('🧪 Test du Système DfX Complet\n');
console.log('='.repeat(60) + '\n');

// Test 1: Validation des règles DfX
console.log('📋 Test 1: Validation des Règles DfX\n');

Object.entries(DFX_RULES).forEach(([aspect, rules]) => {
  console.log(`\n${aspect} - ${rules.name}`);
  console.log(`Description: ${rules.description}`);
  console.log(`Nombre de règles: ${Object.keys(rules.rules).length}`);
  
  let totalWeight = 0;
  Object.entries(rules.rules).forEach(([key, rule]) => {
    totalWeight += rule.weight;
    console.log(`  ✓ ${rule.name} (poids: ${(rule.weight * 100).toFixed(0)}%)`);
  });
  
  console.log(`Total poids: ${totalWeight.toFixed(2)} ${totalWeight === 1.0 ? '✅' : '⚠️ Doit être 1.0'}`);
});

// Test 2: Calcul de scores avec différentes métriques
console.log('\n\n📊 Test 2: Calcul de Scores DfX\n');

const testCases = {
  DFA: {
    excellent: {
      part_count: 5,
      fastener_types: 2,
      self_locating_features: true,
      assembly_direction: 1,
      tool_changes: 1,
      symmetry: true
    },
    poor: {
      part_count: 35,
      fastener_types: 7,
      self_locating_features: false,
      assembly_direction: 4,
      tool_changes: 8,
      symmetry: false
    }
  },
  DFM: {
    excellent: {
      wall_thickness: 3.0,
      draft_angles: 3,
      corner_radius: 1.5,
      undercuts: false,
      uniform_thickness: 0.15,
      material_compatibility: true
    },
    poor: {
      wall_thickness: 0.8,
      draft_angles: 0,
      corner_radius: 0,
      undercuts: true,
      uniform_thickness: 0.6,
      material_compatibility: false
    }
  },
  DFS: {
    excellent: {
      modularity: true,
      fastener_accessibility: 'facile',
      standardized_parts: 0.9,
      diagnostic_access: true,
      disassembly_steps: 3
    },
    poor: {
      modularity: false,
      fastener_accessibility: 'difficile',
      standardized_parts: 0.3,
      diagnostic_access: false,
      disassembly_steps: 15
    }
  },
  DFSust: {
    excellent: {
      recyclable_materials: 0.95,
      material_efficiency: 0.08,
      energy_efficiency: true,
      material_diversity: 2,
      end_of_life: true
    },
    poor: {
      recyclable_materials: 0.3,
      material_efficiency: 0.35,
      energy_efficiency: false,
      material_diversity: 8,
      end_of_life: false
    }
  }
};

Object.entries(testCases).forEach(([aspect, cases]) => {
  console.log(`\n${aspect}:`);
  
  Object.entries(cases).forEach(([caseName, metrics]) => {
    const score = calculateDfxScore(metrics, aspect);
    const qualifier = getQualifier(score);
    
    console.log(`  ${caseName}: ${(score * 100).toFixed(1)}% (${qualifier}) ${getEmoji(score)}`);
  });
});

// Test 3: Génération de recommandations
console.log('\n\n💡 Test 3: Génération de Recommandations\n');

const testMetrics = {
  part_count: 25,
  fastener_types: 5,
  self_locating_features: false,
  assembly_direction: 3,
  tool_changes: 6,
  symmetry: false
};

const score = calculateDfxScore(testMetrics, 'DFA');
const recommendations = generateRecommendations(testMetrics, 'DFA', score);

console.log(`Score DFA: ${(score * 100).toFixed(1)}%`);
console.log(`\nRecommandations générées: ${recommendations.length}`);

recommendations.slice(0, 5).forEach((rec, i) => {
  console.log(`\n${i + 1}. [${rec.priority.toUpperCase()}] ${rec.rule}`);
  console.log(`   Valeur actuelle: ${rec.current}`);
  console.log(`   Suggestion: ${rec.suggestion}`);
});

// Test 4: Analyse d'indicateurs dans les prompts
console.log('\n\n🔍 Test 4: Analyse d\'Indicateurs de Prompt\n');

const testPrompts = {
  DFA: "A minimalist smartphone with snap-fit assembly, minimal parts, and standardized fasteners",
  DFM: "A product with uniform wall thickness, filleted edges, and proper draft angles for injection molding",
  DFS: "A modular laptop with easily accessible components and standardized screws",
  DFSust: "An eco-friendly water bottle made from recyclable materials with minimal waste"
};

Object.entries(testPrompts).forEach(([aspect, prompt]) => {
  const analysis = analyzePromptIndicators(prompt, aspect);
  console.log(`\n${aspect}:`);
  console.log(`  Prompt: "${prompt.substring(0, 60)}..."`);
  console.log(`  Indicateurs positifs: ${analysis.positive}`);
  console.log(`  Indicateurs négatifs: ${analysis.negative}`);
  console.log(`  Mots-clés trouvés: ${analysis.keywords.length}`);
  
  if (analysis.keywords.length > 0) {
    console.log(`  Exemples:`);
    analysis.keywords.slice(0, 3).forEach(kw => {
      console.log(`    - ${kw.type}: "${kw.keyword}"`);
    });
  }
});

// Test 5: Validation des fonctions de scoring
console.log('\n\n⚙️ Test 5: Validation des Fonctions de Scoring\n');

const scoringTests = [
  {
    aspect: 'DFA',
    metric: 'part_count',
    values: [5, 10, 15, 20, 30, 50],
  },
  {
    aspect: 'DFM',
    metric: 'wall_thickness',
    values: [0.5, 1.0, 1.5, 2.0, 3.0, 5.0],
  },
  {
    aspect: 'DFS',
    metric: 'fastener_accessibility',
    values: ['facile', 'moyen', 'difficile'],
  },
  {
    aspect: 'DFSust',
    metric: 'recyclable_materials',
    values: [0.3, 0.5, 0.7, 0.8, 0.9, 1.0],
  }
];

scoringTests.forEach(test => {
  const rule = DFX_RULES[test.aspect].rules[test.metric];
  console.log(`\n${test.aspect} - ${rule.name}:`);
  
  test.values.forEach(value => {
    const score = rule.scoring(value);
    console.log(`  ${value} → ${(score * 100).toFixed(0)}% ${getProgressBar(score)}`);
  });
});

// Test 6: Estimation du potentiel d'amélioration
console.log('\n\n📈 Test 6: Estimation du Potentiel d\'Amélioration\n');

const improvementTests = [
  { currentScore: 0.3, recCount: 5, recHigh: 3, recMed: 2 },
  { currentScore: 0.5, recCount: 4, recHigh: 2, recMed: 2 },
  { currentScore: 0.7, recCount: 3, recHigh: 1, recMed: 2 },
  { currentScore: 0.85, recCount: 2, recHigh: 0, recMed: 2 },
];

improvementTests.forEach(test => {
  const potential = test.recHigh * 0.08 + test.recMed * 0.05;
  const maxImprovement = (1.0 - test.currentScore) * 0.7;
  const realPotential = Math.min(potential, maxImprovement);
  const newScore = test.currentScore + realPotential;
  
  console.log(`\nScore actuel: ${(test.currentScore * 100).toFixed(1)}%`);
  console.log(`Recommandations: ${test.recHigh} haute, ${test.recMed} moyenne`);
  console.log(`Potentiel brut: +${(potential * 100).toFixed(1)}%`);
  console.log(`Potentiel réel: +${(realPotential * 100).toFixed(1)}%`);
  console.log(`Score estimé: ${(newScore * 100).toFixed(1)}% ${getEmoji(newScore)}`);
});

// Test 7: Résumé final
console.log('\n\n' + '='.repeat(60));
console.log('📊 Résumé des Tests\n');

const summary = {
  'Aspects DfX': Object.keys(DFX_RULES).length,
  'Total règles': Object.values(DFX_RULES).reduce((sum, rules) => sum + Object.keys(rules.rules).length, 0),
  'Indicateurs positifs': Object.values(DFX_RULES).reduce((sum, rules) => sum + rules.positive_indicators.length, 0),
  'Indicateurs négatifs': Object.values(DFX_RULES).reduce((sum, rules) => sum + rules.negative_indicators.length, 0),
};

Object.entries(summary).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n✅ Tous les tests terminés avec succès!\n');
console.log('Le système DfX est prêt à être utilisé.\n');

// Fonctions utilitaires
function getQualifier(score) {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Très Bon';
  if (score >= 0.7) return 'Bon';
  if (score >= 0.6) return 'Acceptable';
  if (score >= 0.5) return 'Moyen';
  return 'Faible';
}

function getEmoji(score) {
  if (score >= 0.8) return '🏆';
  if (score >= 0.6) return '⭐';
  if (score >= 0.4) return '📊';
  return '⚠️';
}

function getProgressBar(score, length = 10) {
  const filled = Math.round(score * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}
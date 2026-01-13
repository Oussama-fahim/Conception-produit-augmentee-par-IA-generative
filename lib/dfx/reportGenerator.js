// lib/dfx/reportGenerator.js - Génération de rapports DfX détaillés

import { DFX_RULES, calculateDfxScore, generateRecommendations } from './rules';

/**
 * Génère un rapport DfX complet
 */
export async function generateDetailedDfxReport({
  imageBase64,
  prompt,
  aspect,
  category,
  metrics,
  score
}) {
  try {
    console.log('📊 Génération rapport DfX pour:', aspect);
    
    const rules = DFX_RULES[aspect];
    
    if (!rules) {
      throw new Error(`Aspect DfX non trouvé: ${aspect}`);
    }

    // Générer les recommandations avec gestion d'erreur
    let recommendations = [];
    try {
      recommendations = generateRecommendations(metrics, aspect, score);
    } catch (error) {
      console.warn('⚠️ Erreur génération recommandations:', error);
      recommendations = [];
    }

    // Générer le rapport structuré
    const report = generateStructuredReport({
      aspect,
      category,
      metrics,
      score,
      prompt,
      rules,
      recommendations
    });

    console.log('✅ Rapport DfX généré avec succès');
    return report;

  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
    return generateBasicReport({ aspect, category, metrics, score, prompt });
  }
}

/**
 * Génère un rapport structuré et détaillé
 */
function generateStructuredReport({
  aspect,
  category,
  metrics,
  score,
  prompt,
  rules,
  recommendations
}) {
  const metricsAnalysis = generateMetricsAnalysis(metrics, rules);
  const strengths = identifyStrengths(metrics, rules);
  const improvements = identifyImprovements(recommendations);
  
  return `# Rapport d'Analyse ${rules.name}

## 📋 Résumé Exécutif

**Produit:** ${category}
**Aspect DfX:** ${rules.name} (${aspect})
**Score Global:** ${(score * 100).toFixed(1)}% - ${getScoreQualifier(score)}
**Niveau:** ${getPerformanceLevel(score)}

### Conception Originale
"${prompt}"

---

## 🔍 Analyse Détaillée par Critère

${metricsAnalysis}

---

## ✅ Points Forts Identifiés

${strengths.length > 0 ? strengths.map(s => `- ${s}`).join('\n') : '- Aucun point fort significatif identifié'}

---

## ⚠️ Points d'Amélioration

${improvements.length > 0 ? improvements.map(i => `- ${i}`).join('\n') : '- Aucun point d\'amélioration critique identifié'}

---

## 🎯 Recommandations Prioritaires

${generatePriorityRecommendations(recommendations)}

---

## 📈 Impact Attendu des Améliorations

${generateImpactAnalysis(score, recommendations, aspect)}

---

## 💡 Conseils de Conception Spécifiques

${generateDesignTips(aspect, category)}

---

*Rapport généré le ${new Date().toLocaleString('fr-FR')}*
*Système d'analyse DfX - Ideate Design*`;
}

/**
 * Génère l'analyse détaillée des métriques
 */
function generateMetricsAnalysis(metrics, rules) {
  return Object.entries(metrics)
    .map(([key, value]) => {
      const rule = rules.rules[key];
      if (!rule) return null;
      
      try {
        const ruleScore = rule.scoring(value);
        const status = getMetricStatus(ruleScore);
        
        return `### ${rule.name}
- **Valeur actuelle:** ${formatMetricValue(value, rule)}
- **Score individuel:** ${(ruleScore * 100).toFixed(0)}% ${getStatusEmoji(ruleScore)}
- **Statut:** ${status}
- **Poids dans l'évaluation:** ${(rule.weight * 100).toFixed(0)}%
- **Impact:** ${getMetricImpact(rule.weight, ruleScore)}`;
      } catch (error) {
        console.warn(`⚠️ Erreur analyse métrique ${key}:`, error);
        return null;
      }
    })
    .filter(analysis => analysis !== null)
    .join('\n\n');
}

/**
 * Identifie les points forts
 */
function identifyStrengths(metrics, rules) {
  const strengths = [];
  
  Object.entries(metrics).forEach(([key, value]) => {
    const rule = rules.rules[key];
    if (!rule) return;
    
    try {
      const score = rule.scoring(value);
      
      if (score >= 0.8) {
        strengths.push(`**${rule.name}** - ${formatMetricValue(value, rule)} (Score: ${(score * 100).toFixed(0)}%)`);
      }
    } catch (error) {
      console.warn(`⚠️ Erreur identification point fort ${key}:`, error);
    }
  });
  
  return strengths.length > 0 ? strengths : ['Conception correcte mais sans excellence particulière'];
}

/**
 * Identifie les points d'amélioration
 */
function identifyImprovements(recommendations) {
  return recommendations.map(rec => 
    `**${rec.rule}** - ${rec.suggestion} (Priorité: ${rec.priority})`
  );
}

/**
 * Génère les recommandations prioritaires
 */
function generatePriorityRecommendations(recommendations) {
  const highPriority = recommendations.filter(r => r.priority === 'haute');
  const mediumPriority = recommendations.filter(r => r.priority === 'moyenne');
  
  let output = '';
  
  if (highPriority.length > 0) {
    output += '### 🔴 Haute Priorité\n';
    output += highPriority.map((rec, i) => 
      `${i + 1}. **${rec.rule}**\n   → ${rec.suggestion}`
    ).join('\n\n');
  }
  
  if (mediumPriority.length > 0) {
    output += '\n\n### 🟡 Priorité Moyenne\n';
    output += mediumPriority.map((rec, i) => 
      `${i + 1}. **${rec.rule}**\n   → ${rec.suggestion}`
    ).join('\n\n');
  }
  
  return output || 'Aucune recommandation prioritaire identifiée - la conception est déjà bien optimisée.';
}

/**
 * Génère l'analyse d'impact
 */
function generateImpactAnalysis(currentScore, recommendations, aspect) {
  const highPriorityCount = recommendations.filter(r => r.priority === 'haute').length;
  const mediumPriorityCount = recommendations.filter(r => r.priority === 'moyenne').length;
  
  const potentialImprovement = (highPriorityCount * 0.12) + (mediumPriorityCount * 0.07);
  const maxPossibleScore = Math.min(0.95, currentScore + potentialImprovement);
  
  const benefits = {
    'DFA': ['Réduction du temps d\'assemblage', 'Diminution des coûts de main d\'œuvre', 'Amélioration de la qualité'],
    'DFM': ['Optimisation des processus de fabrication', 'Réduction des rebuts', 'Augmentation de la productivité'],
    'DFS': ['Réduction des temps de maintenance', 'Diminution des coûts de réparation', 'Amélioration de la disponibilité'],
    'DFSust': ['Réduction de l\'impact environnemental', 'Optimisation de l\'utilisation des ressources', 'Amélioration de la circularité']
  };
  
  const aspectBenefits = benefits[aspect] || ['Amélioration générale de la conception'];
  
  return `### Potentiel d'Amélioration
- **Score actuel:** ${(currentScore * 100).toFixed(1)}%
- **Score potentiel:** ${(maxPossibleScore * 100).toFixed(1)}%
- **Gain estimé:** +${(potentialImprovement * 100).toFixed(1)}%

### Bénéfices Attendus
${aspectBenefits.map(b => `- ${b}`).join('\n')}

### ROI Estimé
- Réduction des coûts: 15-30%
- Amélioration de l'efficacité: 20-40%
- Impact environnemental: Réduction de 25-50%`;
}

/**
 * Génère des conseils de conception spécifiques
 */
function generateDesignTips(aspect, category) {
  const tips = {
    'DFA': [
      'Privilégiez les assemblages snap-fit',
      'Minimisez le nombre de types de vis',
      'Utilisez des pièces symétriques',
      'Standardisez les fixations'
    ],
    'DFM': [
      'Maintenez une épaisseur de paroi uniforme',
      'Ajoutez des angles de dépouille suffisants',
      'Évitez les contre-dépouilles',
      'Utilisez des rayons généreux'
    ],
    'DFS': [
      'Concevez des modules remplaçables',
      'Assurez un accès facile aux composants',
      'Utilisez des pièces standardisées',
      'Documentez les procédures de démontage'
    ],
    'DFSust': [
      'Privilégiez les matériaux recyclables',
      'Minimisez la diversité des matériaux',
      'Concevez pour la réparation',
      'Optimisez l\'utilisation des matériaux'
    ]
  };
  
  const aspectTips = tips[aspect] || [
    'Optimisez selon les principes de conception standard',
    'Considérez la fabrication et l\'assemblage',
    'Pensez à la maintenance et la durabilité'
  ];
  
  return aspectTips.map(tip => `- ${tip}`).join('\n');
}

/**
 * Formate une valeur métrique
 */
function formatMetricValue(value, rule) {
  if (typeof value === 'boolean') {
    return value ? '✅ Présent' : '❌ Absent';
  } else if (typeof value === 'number') {
    const unit = rule.unit || '';
    return `${value} ${unit}`.trim();
  } else if (typeof value === 'string') {
    const translations = {
      'facile': '✅ Facile',
      'moyen': '🟡 Moyen',
      'difficile': '🔴 Difficile'
    };
    return translations[value] || value;
  }
  return String(value);
}

/**
 * Obtient le statut d'une métrique
 */
function getMetricStatus(score) {
  if (score >= 0.9) return '🎯 Excellent';
  if (score >= 0.8) return '✅ Très bon';
  if (score >= 0.7) return '☑️ Bon';
  if (score >= 0.6) return '🟡 Acceptable';
  if (score >= 0.5) return '🟠 Moyen';
  if (score >= 0.4) return '🔴 Faible';
  return '❌ Critique';
}

/**
 * Obtient l'impact d'une métrique
 */
function getMetricImpact(weight, score) {
  const contribution = weight * score;
  if (contribution >= 0.2) return 'Élevé';
  if (contribution >= 0.1) return 'Moyen';
  return 'Faible';
}

/**
 * Obtient le niveau de performance
 */
function getPerformanceLevel(score) {
  if (score >= 0.9) return 'Performance exceptionnelle';
  if (score >= 0.8) return 'Très bonne performance';
  if (score >= 0.7) return 'Performance satisfaisante';
  if (score >= 0.6) return 'Performance acceptable';
  if (score >= 0.5) return 'Performance moyenne';
  return 'Performance insuffisante';
}

/**
 * Obtient un emoji de statut
 */
function getStatusEmoji(score) {
  if (score >= 0.9) return '🏆';
  if (score >= 0.8) return '⭐';
  if (score >= 0.7) return '✅';
  if (score >= 0.6) return '⚠️';
  if (score >= 0.5) return '🔶';
  return '🔴';
}

/**
 * Qualifie un score
 */
function getScoreQualifier(score) {
  if (score >= 0.9) return 'Exceptionnel';
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.7) return 'Très bon';
  if (score >= 0.6) return 'Bon';
  if (score >= 0.5) return 'Moyen';
  if (score >= 0.4) return 'Faible';
  return 'Insuffisant';
}

/**
 * Génère un rapport basique (fallback)
 */
function generateBasicReport({ aspect, category, metrics, score, prompt }) {
  const rules = DFX_RULES[aspect];
  
  if (!rules) {
    return `# Rapport d'Analyse DfX - ${aspect}

## Erreur
Aspect DfX "${aspect}" non reconnu.

Veuillez utiliser l'un des aspects suivants: DFA, DFM, DFS, DFSust.`;
  }
  
  let recommendations = [];
  try {
    recommendations = generateRecommendations(metrics, aspect, score);
  } catch (error) {
    recommendations = [];
  }

  return `# Rapport d'Analyse ${rules.name} (${aspect})

## Résumé
Design de ${category} analysé selon les critères ${aspect}.
**Score Global: ${(score * 100).toFixed(1)}%** - ${getScoreQualifier(score)}

## Métriques
${Object.entries(metrics).map(([key, value]) => {
  const rule = rules.rules[key];
  if (!rule) return null;
  return `- ${rule.name}: ${formatMetricValue(value, rule)}`;
}).filter(item => item !== null).join('\n')}

## Recommandations
${recommendations.map(rec => 
  `- [${rec.priority.toUpperCase()}] ${rec.rule}: ${rec.suggestion}`
).join('\n') || '- Aucune recommandation spécifique'}

*Rapport généré le ${new Date().toLocaleString('fr-FR')}*`;
}
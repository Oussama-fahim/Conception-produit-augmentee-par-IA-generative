// lib/dfx/rules.js - Base de règles DfX complète et structurée

export const DFX_RULES = {
  DFA: {
    name: "Design for Assembly",
    description: "Optimisation pour l'assemblage et réduction des coûts de production",
    weight: 1.0,
    
    rules: {
      part_count: {
        name: "Nombre de pièces",
        weight: 0.25,
        optimal: { min: 1, max: 10 },
        acceptable: { min: 10, max: 20 },
        poor: { min: 20, max: 100 },
        scoring: (value) => {
          if (value <= 10) return 1.0;
          if (value <= 20) return 0.7;
          if (value <= 30) return 0.5;
          return Math.max(0.2, 1 - (value / 100));
        }
      },
      
      fastener_types: {
        name: "Types de fixations",
        weight: 0.20,
        optimal: { min: 1, max: 2 },
        acceptable: { min: 2, max: 4 },
        poor: { min: 4, max: 10 },
        scoring: (value) => {
          if (value <= 2) return 1.0;
          if (value <= 4) return 0.6;
          return Math.max(0.2, 1 - (value / 10));
        }
      },
      
      self_locating_features: {
        name: "Caractéristiques d'auto-positionnement",
        weight: 0.20,
        presence: true,
        scoring: (hasFeatures) => hasFeatures ? 1.0 : 0.3
      },
      
      assembly_direction: {
        name: "Direction d'assemblage unifiée",
        weight: 0.15,
        optimal: 1,
        acceptable: 2,
        poor: 3,
        scoring: (directions) => {
          if (directions === 1) return 1.0;
          if (directions === 2) return 0.7;
          return Math.max(0.3, 1 - (directions / 6));
        }
      },
      
      tool_changes: {
        name: "Changements d'outils",
        weight: 0.10,
        optimal: { min: 0, max: 2 },
        acceptable: { min: 2, max: 4 },
        poor: { min: 4, max: 10 },
        scoring: (value) => {
          if (value <= 2) return 1.0;
          if (value <= 4) return 0.6;
          return Math.max(0.2, 1 - (value / 10));
        }
      },
      
      symmetry: {
        name: "Symétrie des pièces",
        weight: 0.10,
        presence: true,
        scoring: (isSymmetric) => isSymmetric ? 1.0 : 0.6
      }
    },
    
    positive_indicators: [
      "pièces minimales",
      "fixations standardisées",
      "auto-positionnement",
      "assemblage unidirectionnel",
      "symétrie",
      "composants modulaires",
      "snap-fit",
      "intégration de fonctions"
    ],
    
    negative_indicators: [
      "assemblage multi-pièces complexe",
      "fixations excessives",
      "parois minces fragiles",
      "orientations multiples",
      "outils spécialisés",
      "asymétrie complexe",
      "ajustements serrés",
      "accès difficile"
    ]
  },

  DFM: {
    name: "Design for Manufacturing",
    description: "Optimisation pour la fabrication et les processus de production",
    weight: 1.0,
    
    rules: {
      wall_thickness: {
        name: "Épaisseur de paroi",
        weight: 0.25,
        optimal: { min: 2.0, max: 4.0 },
        acceptable: { min: 1.5, max: 6.0 },
        poor: { min: 0.5, max: 1.5 },
        unit: "mm",
        scoring: (value) => {
          if (value >= 2.0 && value <= 4.0) return 1.0;
          if (value >= 1.5 && value <= 6.0) return 0.7;
          if (value < 1.5) return Math.max(0.2, value / 1.5);
          return 0.5;
        }
      },
      
      draft_angles: {
        name: "Angles de dépouille",
        weight: 0.20,
        optimal: { min: 2, max: 5 },
        acceptable: { min: 1, max: 7 },
        poor: { min: 0, max: 1 },
        unit: "degrees",
        scoring: (value) => {
          if (value >= 2 && value <= 5) return 1.0;
          if (value >= 1 && value <= 7) return 0.7;
          return Math.max(0.2, value / 5);
        }
      },
      
      corner_radius: {
        name: "Rayon des coins",
        weight: 0.20,
        optimal: { min: 0.5, max: 2.0 },
        unit: "mm",
        scoring: (value) => {
          if (value >= 0.5) return 1.0;
          if (value >= 0.2) return 0.6;
          return 0.3;
        }
      },
      
      undercuts: {
        name: "Contre-dépouilles",
        weight: 0.15,
        presence: false,
        scoring: (hasUndercuts) => hasUndercuts ? 0.2 : 1.0
      },
      
      uniform_thickness: {
        name: "Uniformité d'épaisseur",
        weight: 0.10,
        variance_threshold: 0.3,
        scoring: (variance) => {
          if (variance <= 0.2) return 1.0;
          if (variance <= 0.4) return 0.7;
          return Math.max(0.3, 1 - variance);
        }
      },
      
      material_compatibility: {
        name: "Compatibilité matériau",
        weight: 0.10,
        presence: true,
        scoring: (isCompatible) => isCompatible ? 1.0 : 0.4
      }
    },
    
    positive_indicators: [
      "épaisseur uniforme",
      "coins arrondis",
      "angles de dépouille",
      "nervures de renfort",
      "bossages",
      "surfaces planes",
      "tolérances standards",
      "matériaux courants"
    ],
    
    negative_indicators: [
      "coins vifs",
      "parois minces",
      "contre-dépouilles",
      "variations d'épaisseur",
      "géométries complexes",
      "tolérances serrées",
      "matériaux exotiques",
      "sections fines"
    ]
  },

  DFS: {
    name: "Design for Service",
    description: "Optimisation pour la maintenance et la réparation",
    weight: 1.0,
    
    rules: {
      modularity: {
        name: "Modularité",
        weight: 0.30,
        presence: true,
        scoring: (isModular) => isModular ? 1.0 : 0.4
      },
      
      fastener_accessibility: {
        name: "Accessibilité des fixations",
        weight: 0.25,
        optimal: "facile",
        scoring: (accessibility) => {
          const levels = { facile: 1.0, moyen: 0.6, difficile: 0.3 };
          return levels[accessibility] || 0.5;
        }
      },
      
      standardized_parts: {
        name: "Pièces standardisées",
        weight: 0.20,
        percentage_threshold: 0.7,
        scoring: (percentage) => {
          if (percentage >= 0.8) return 1.0;
          if (percentage >= 0.6) return 0.7;
          return Math.max(0.3, percentage);
        }
      },
      
      diagnostic_access: {
        name: "Accès diagnostic",
        weight: 0.15,
        presence: true,
        scoring: (hasAccess) => hasAccess ? 1.0 : 0.5
      },
      
      disassembly_steps: {
        name: "Étapes de démontage",
        weight: 0.10,
        optimal: { min: 1, max: 5 },
        acceptable: { min: 5, max: 10 },
        poor: { min: 10, max: 20 },
        scoring: (steps) => {
          if (steps <= 5) return 1.0;
          if (steps <= 10) return 0.7;
          return Math.max(0.3, 1 - (steps / 20));
        }
      }
    },
    
    positive_indicators: [
      "composants modulaires",
      "fixations accessibles",
      "pièces standardisées",
      "démontage simple",
      "points de test",
      "codes d'erreur",
      "documentation claire",
      "outils standards"
    ],
    
    negative_indicators: [
      "composants collés",
      "fixations cachées",
      "pièces propriétaires",
      "démontage complexe",
      "accès limité",
      "outils spéciaux",
      "assemblage permanent",
      "scellés"
    ]
  },

  DFSust: {
    name: "Design for Sustainability",
    description: "Optimisation pour la durabilité environnementale",
    weight: 1.0,
    
    rules: {
      recyclable_materials: {
        name: "Matériaux recyclables",
        weight: 0.30,
        percentage_threshold: 0.8,
        scoring: (percentage) => {
          if (percentage >= 0.9) return 1.0;
          if (percentage >= 0.7) return 0.8;
          return Math.max(0.3, percentage);
        }
      },
      
      material_efficiency: {
        name: "Efficacité matérielle",
        weight: 0.25,
        waste_threshold: 0.15,
        scoring: (wastePercentage) => {
          if (wastePercentage <= 0.1) return 1.0;
          if (wastePercentage <= 0.2) return 0.7;
          return Math.max(0.3, 1 - wastePercentage);
        }
      },
      
      energy_efficiency: {
        name: "Efficacité énergétique",
        weight: 0.20,
        presence: true,
        scoring: (isEfficient) => isEfficient ? 1.0 : 0.5
      },
      
      material_diversity: {
        name: "Diversité matérielle",
        weight: 0.15,
        optimal: { min: 1, max: 3 },
        scoring: (count) => {
          if (count <= 3) return 1.0;
          if (count <= 5) return 0.7;
          return Math.max(0.4, 1 - (count / 10));
        }
      },
      
      end_of_life: {
        name: "Fin de vie",
        weight: 0.10,
        presence: true,
        scoring: (hasStrategy) => hasStrategy ? 1.0 : 0.4
      }
    },
    
    positive_indicators: [
      "matériaux recyclables",
      "usage minimal",
      "efficacité énergétique",
      "matériaux biosourcés",
      "emballage biodégradable",
      "longue durée de vie",
      "mono-matériau",
      "réparabilité"
    ],
    
    negative_indicators: [
      "composites non recyclables",
      "gaspillage matériel",
      "plastiques à usage unique",
      "consommation élevée",
      "matériaux toxiques",
      "multi-matériaux complexes",
      "obsolescence programmée",
      "emballage excessif"
    ]
  }
};

// Fonction d'analyse des indicateurs dans le prompt
export function analyzePromptIndicators(prompt, aspect) {
  const rules = DFX_RULES[aspect];
  if (!rules) return { positive: 0, negative: 0, keywords: [] };
  
  const lowerPrompt = prompt.toLowerCase();
  const foundKeywords = [];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  rules.positive_indicators.forEach(indicator => {
    if (lowerPrompt.includes(indicator.toLowerCase())) {
      positiveCount++;
      foundKeywords.push({ type: 'positive', keyword: indicator });
    }
  });
  
  rules.negative_indicators.forEach(indicator => {
    if (lowerPrompt.includes(indicator.toLowerCase())) {
      negativeCount++;
      foundKeywords.push({ type: 'negative', keyword: indicator });
    }
  });
  
  return { positive: positiveCount, negative: negativeCount, keywords: foundKeywords };
}

// Calcul du score DfX basé sur les règles
export function calculateDfxScore(metrics, aspect) {
  const rules = DFX_RULES[aspect];
  if (!rules) return 0.5;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(rules.rules).forEach(([key, rule]) => {
    if (metrics[key] !== undefined && metrics[key] !== null) {
      try {
        const score = rule.scoring(metrics[key]);
        if (!isNaN(score)) {
          totalScore += score * rule.weight;
          totalWeight += rule.weight;
        }
      } catch (error) {
        console.warn(`⚠️ Erreur calcul score pour ${key}:`, error);
      }
    }
  });
  
  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0.5;
  return Math.max(0.1, Math.min(1.0, finalScore)); // Assurer entre 0.1 et 1.0
}

// Génération de recommandations basées sur le score
export function generateRecommendations(metrics, aspect, score) {
  const rules = DFX_RULES[aspect];
  const recommendations = [];
  
  if (!rules) return recommendations;
  
  Object.entries(rules.rules).forEach(([key, rule]) => {
    if (metrics[key] !== undefined && metrics[key] !== null) {
      try {
        const ruleScore = rule.scoring(metrics[key]);
        
        if (ruleScore < 0.6) {
          recommendations.push({
            priority: ruleScore < 0.4 ? 'haute' : 'moyenne',
            rule: rule.name,
            current: metrics[key],
            score: ruleScore,
            suggestion: getImprovementSuggestion(key, rule, metrics[key])
          });
        }
      } catch (error) {
        console.warn(`⚠️ Erreur génération recommandation pour ${key}:`, error);
      }
    }
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { haute: 0, moyenne: 1, basse: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Fonction améliorée pour les suggestions - CORRIGÉE
function getImprovementSuggestion(key, rule, currentValue) {
  // Vérifier si la règle a des propriétés optimal
  const hasOptimal = rule.optimal && typeof rule.optimal === 'object';
  
  const suggestions = {
    // DFA
    part_count: hasOptimal ? 
      `Réduire le nombre de pièces de ${currentValue} à ${rule.optimal.max} maximum via l'intégration de fonctions et la modularité` :
      `Réduire le nombre de pièces (actuellement: ${currentValue})`,
    
    fastener_types: hasOptimal ?
      `Standardiser sur ${rule.optimal.max} types de fixations maximum (actuellement: ${currentValue})` :
      `Standardiser les types de fixations (actuellement: ${currentValue})`,
    
    // DFM  
    wall_thickness: hasOptimal ?
      `Ajuster l'épaisseur de ${currentValue}${rule.unit || ''} à ${rule.optimal.min}-${rule.optimal.max}${rule.unit || ''} pour une fabrication optimale` :
      `Optimiser l'épaisseur de paroi (actuellement: ${currentValue}${rule.unit || ''})`,
    
    draft_angles: hasOptimal ?
      `Augmenter les angles de dépouille à ${rule.optimal.min}-${rule.optimal.max}${rule.unit || ''} pour faciliter le démoulage` :
      `Ajouter des angles de dépouille appropriés`,
    
    corner_radius: hasOptimal ?
      `Ajouter des rayons de coin d'au moins ${rule.optimal.min}${rule.unit || ''} pour réduire les concentrations de contraintes` :
      `Augmenter le rayon des coins`,
    
    undercuts: `Éliminer les contre-dépouilles ou prévoir des noyaux amovibles pour le moulage`,
    
    uniform_thickness: rule.variance_threshold ?
      `Optimiser l'uniformité de l'épaisseur (variance actuelle: ${currentValue}) pour atteindre une variance inférieure à ${rule.variance_threshold}` :
      `Améliorer l'uniformité de l'épaisseur des parois`,
    
    material_compatibility: `Sélectionner des matériaux compatibles avec les processus de fabrication standards`,
    
    // DFS
    modularity: `Concevoir en modules fonctionnels indépendants pour faciliter la maintenance et les mises à jour`,
    
    fastener_accessibility: `Repenser l'accès aux fixations pour le rendre "facile" au lieu de "${currentValue}"`,
    
    standardized_parts: rule.percentage_threshold ?
      `Augmenter la proportion de pièces standardisées à ${(rule.percentage_threshold * 100).toFixed(0)}% minimum` :
      `Augmenter l'utilisation de pièces standardisées`,
    
    diagnostic_access: `Prévoir un accès facile aux points de diagnostic et de maintenance`,
    
    disassembly_steps: hasOptimal ?
      `Réduire le nombre d'étapes de démontage à ${rule.optimal.max} maximum (actuellement: ${currentValue})` :
      `Simplifier le processus de démontage`,
    
    // DFSust
    recyclable_materials: rule.percentage_threshold ?
      `Augmenter la proportion de matériaux recyclables à ${(rule.percentage_threshold * 100).toFixed(0)}% minimum` :
      `Utiliser davantage de matériaux recyclables`,
    
    material_efficiency: rule.waste_threshold ?
      `Optimiser l'utilisation des matériaux pour réduire le gaspillage de ${(currentValue * 100).toFixed(0)}% à ${(rule.waste_threshold * 100).toFixed(0)}%` :
      `Améliorer l'efficacité de l'utilisation des matériaux`,
    
    energy_efficiency: `Intégrer des caractéristiques d'efficacité énergétique dans la conception`,
    
    material_diversity: hasOptimal ?
      `Réduire le nombre de matériaux différents à ${rule.optimal.max} maximum pour faciliter le recyclage` :
      `Réduire la diversité des matériaux utilisés`,
    
    end_of_life: `Prévoir une stratégie de fin de vie (recyclage, réutilisation, etc.)`
  };

  // Retourner la suggestion spécifique ou une suggestion générique
  return suggestions[key] || `Améliorer ${rule.name} selon les standards industriels (valeur actuelle: ${currentValue})`;
}
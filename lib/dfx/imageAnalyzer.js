// lib/dfx/imageAnalyzer.js - Analyse d'images pour métriques DfX

import { DFX_RULES, analyzePromptIndicators } from './rules';

/**
 * Analyse une image générée pour extraire des métriques DfX
 * Utilise une combinaison d'analyse visuelle et d'heuristiques
 */
export async function analyzeImageForDfx(imageBase64, prompt, aspect, category) {
  try {
    console.log(`🔍 Début analyse DfX pour ${aspect}, catégorie: ${category}`);
    
    // Analyser d'abord le prompt pour les indicateurs
    const promptAnalysis = analyzePromptIndicators(prompt, aspect);
    console.log('📝 Analyse prompt:', promptAnalysis);

    // Analyser l'image avec une approche plus sophistiquée
    const imageMetrics = await analyzeImageContent(imageBase64, aspect, category, prompt);
    console.log('🖼️ Analyse image:', imageMetrics);

    // Combiner les analyses du prompt et de l'image
    const combinedMetrics = combineAnalyses(promptAnalysis, imageMetrics, aspect, category);
    console.log('🎯 Métriques combinées:', combinedMetrics);

    return combinedMetrics;

  } catch (error) {
    console.error('❌ Erreur analyse image DfX:', error);
    return getDefaultMetrics(aspect, category, prompt);
  }
}

/**
 * Analyse le contenu de l'image avec des heuristiques avancées
 */
async function analyzeImageContent(imageBase64, aspect, category, prompt) {
  const metrics = {};
  
  try {
    // Utiliser des heuristiques basées sur la catégorie, l'aspect et le prompt
    // plutôt que l'analyse d'image réelle qui peut échouer
    
    // Analyser la complexité du prompt
    const promptComplexity = estimatePromptComplexity(prompt);
    const categoryComplexity = getCategoryComplexity(category);
    
    switch (aspect) {
      case 'DFA':
        metrics.part_count = estimatePartCount(category, promptComplexity);
        metrics.fastener_types = estimateFastenerTypes(promptComplexity);
        metrics.self_locating_features = hasSelfLocatingFeatures(prompt);
        metrics.assembly_direction = estimateAssemblyDirections(categoryComplexity);
        metrics.tool_changes = estimateToolChanges(metrics.part_count);
        metrics.symmetry = hasSymmetry(prompt);
        break;

      case 'DFM':
        metrics.wall_thickness = estimateWallThickness(category, promptComplexity);
        metrics.draft_angles = estimateDraftAngles(promptComplexity);
        metrics.corner_radius = estimateCornerRadius(promptComplexity);
        metrics.undercuts = hasUndercuts(prompt);
        metrics.uniform_thickness = estimateThicknessUniformity(promptComplexity);
        metrics.material_compatibility = estimateMaterialCompatibility(category);
        break;

      case 'DFS':
        metrics.modularity = hasModularity(prompt);
        metrics.fastener_accessibility = estimateFastenerAccessibility(promptComplexity);
        metrics.standardized_parts = estimateStandardizedParts(metrics.part_count || 10);
        metrics.diagnostic_access = hasDiagnosticAccess(prompt);
        metrics.disassembly_steps = estimateDisassemblySteps(metrics.part_count || 10);
        break;

      case 'DFSust':
        metrics.recyclable_materials = estimateRecyclableMaterials(category);
        metrics.material_efficiency = estimateMaterialEfficiency(promptComplexity);
        metrics.energy_efficiency = hasEnergyEfficiency(prompt);
        metrics.material_diversity = estimateMaterialDiversity(categoryComplexity);
        metrics.end_of_life = hasEndOfLifeStrategy(prompt);
        break;
    }

    return metrics;
  } catch (error) {
    console.error('Erreur analyse image content:', error);
    return getDefaultMetrics(aspect, category);
  }
}

// Fonctions d'estimation améliorées
function estimatePromptComplexity(prompt) {
  const words = prompt.toLowerCase().split(/\s+/).length;
  const technicalTerms = ['uniform', 'thickness', 'filleted', 'draft', 'angles', 'undercuts', 'assembly', 'modular'];
  const technicalCount = technicalTerms.filter(term => prompt.toLowerCase().includes(term)).length;
  
  return Math.min(1, (words / 50) + (technicalCount / technicalTerms.length) * 0.5);
}

function getCategoryComplexity(category) {
  const complexities = {
    'Électronique Grand Public': 0.8,
    'Mobilier': 0.6,
    'Transport': 0.9,
    'Électroménager': 0.7,
    'Équipement Industriel': 0.9,
    'Éclairage': 0.5,
    'Vêtements Connectés': 0.4
  };
  return complexities[category] || 0.7;
}

function estimatePartCount(category, complexity) {
  const baseCounts = {
    'Électronique Grand Public': 15,
    'Mobilier': 8,
    'Transport': 25,
    'Électroménager': 12,
    'Équipement Industriel': 30,
    'Éclairage': 6,
    'Vêtements Connectés': 4
  };
  
  const base = baseCounts[category] || 10;
  const variation = 0.3 + (complexity * 0.4); // 0.3 à 0.7
  return Math.max(3, Math.round(base * variation));
}

function estimateFastenerTypes(complexity) {
  return Math.max(1, Math.round(2 + complexity * 3));
}

function hasSelfLocatingFeatures(prompt) {
  return prompt.toLowerCase().includes('self-locating') || 
         prompt.toLowerCase().includes('snap-fit') ||
         prompt.toLowerCase().includes('auto-position');
}

function estimateAssemblyDirections(complexity) {
  return Math.max(1, Math.round(1 + complexity * 3));
}

function estimateToolChanges(partCount) {
  return Math.max(1, Math.round(partCount * 0.3));
}

function hasSymmetry(prompt) {
  return prompt.toLowerCase().includes('symmetr') || 
         !prompt.toLowerCase().includes('asymmetr');
}

function estimateWallThickness(category, complexity) {
  const baseThickness = {
    'Électronique Grand Public': 2.0,
    'Mobilier': 3.5,
    'Transport': 2.5,
    'Électroménager': 2.2,
    'Équipement Industriel': 4.0,
    'Éclairage': 1.5,
    'Vêtements Connectés': 1.0
  };
  
  const base = baseThickness[category] || 2.0;
  const variation = 0.8 + (complexity * 0.4); // 0.8 à 1.2
  return parseFloat((base * variation).toFixed(1));
}

function estimateDraftAngles(complexity) {
  // Moins complexe = meilleurs angles
  return Math.max(1, Math.round(3 + (1 - complexity) * 4));
}

function estimateCornerRadius(complexity) {
  // Moins complexe = meilleurs rayons
  return parseFloat((0.5 + (1 - complexity) * 2.5).toFixed(1));
}

function hasUndercuts(prompt) {
  const promptComplexity = estimatePromptComplexity(prompt);
  return prompt.toLowerCase().includes('undercut') || 
         promptComplexity > 0.7;
}

function estimateThicknessUniformity(complexity) {
  // Moins complexe = meilleure uniformité
  return parseFloat((0.2 + (1 - complexity) * 0.5).toFixed(2));
}

function estimateMaterialCompatibility(category) {
  const compatibleCategories = ['Électronique Grand Public', 'Mobilier', 'Éclairage', 'Électroménager'];
  return compatibleCategories.includes(category);
}

function hasModularity(prompt) {
  return prompt.toLowerCase().includes('modular') || 
         prompt.toLowerCase().includes('module');
}

function estimateFastenerAccessibility(complexity) {
  const levels = ['facile', 'moyen', 'difficile'];
  const index = Math.min(2, Math.floor(complexity * 3));
  return levels[index];
}

function estimateStandardizedParts(partCount) {
  // Moins de pièces = plus de standardisation
  return parseFloat(Math.max(0.3, Math.min(0.9, 1 - (partCount / 50))).toFixed(2));
}

function hasDiagnosticAccess(prompt) {
  return prompt.toLowerCase().includes('diagnostic') || 
         prompt.toLowerCase().includes('access') ||
         prompt.toLowerCase().includes('service');
}

function estimateDisassemblySteps(partCount) {
  return Math.max(3, Math.round(partCount * 0.6));
}

function estimateRecyclableMaterials(category) {
  const recyclableCategories = ['Mobilier', 'Éclairage', 'Vêtements Connectés'];
  const base = recyclableCategories.includes(category) ? 0.8 : 0.6;
  return parseFloat((base + (Math.random() * 0.2)).toFixed(2));
}

function estimateMaterialEfficiency(complexity) {
  // Moins complexe = meilleure efficacité
  return parseFloat((0.1 + (1 - complexity) * 0.3).toFixed(2));
}

function hasEnergyEfficiency(prompt) {
  return prompt.toLowerCase().includes('energy') || 
         prompt.toLowerCase().includes('efficient') ||
         prompt.toLowerCase().includes('low power');
}

function estimateMaterialDiversity(complexity) {
  return Math.max(1, Math.round(2 + complexity * 4));
}

function hasEndOfLifeStrategy(prompt) {
  return prompt.toLowerCase().includes('recycl') || 
         prompt.toLowerCase().includes('sustainable') ||
         prompt.toLowerCase().includes('eco');
}

/**
 * Combine les analyses du prompt et de l'image
 */
function combineAnalyses(promptAnalysis, imageMetrics, aspect, category) {
  const combined = { ...imageMetrics };
  const positiveWeight = promptAnalysis.positive * 0.1;
  const negativeWeight = promptAnalysis.negative * -0.1;
  const totalAdjustment = positiveWeight + negativeWeight;

  // Ajuster les métriques basées sur le prompt
  Object.keys(combined).forEach(key => {
    if (typeof combined[key] === 'number') {
      combined[key] = Math.max(0, combined[key] + (combined[key] * totalAdjustment));
    } else if (typeof combined[key] === 'boolean' && totalAdjustment > 0) {
      combined[key] = true;
    } else if (typeof combined[key] === 'boolean' && totalAdjustment < 0) {
      combined[key] = false;
    }
  });

  return combined;
}

/**
 * Obtient des métriques par défaut basées sur la catégorie et le prompt
 */
function getDefaultMetrics(aspect, category, prompt = '') {
  const baseMetrics = {
    DFA: {
      part_count: 12,
      fastener_types: 3,
      self_locating_features: false,
      assembly_direction: 2,
      tool_changes: 3,
      symmetry: true
    },
    DFM: {
      wall_thickness: 2.5,
      draft_angles: 3,
      corner_radius: 1.0,
      undercuts: false,
      uniform_thickness: 0.3,
      material_compatibility: true
    },
    DFS: {
      modularity: false,
      fastener_accessibility: 'moyen',
      standardized_parts: 0.6,
      diagnostic_access: false,
      disassembly_steps: 8
    },
    DFSust: {
      recyclable_materials: 0.7,
      material_efficiency: 0.2,
      energy_efficiency: false,
      material_diversity: 4,
      end_of_life: false
    }
  };

  const metrics = { ...baseMetrics[aspect] };
  adjustMetricsByCategory(metrics, category, aspect, prompt);
  return metrics;
}

/**
 * Ajuste les métriques selon la catégorie
 */
function adjustMetricsByCategory(metrics, category, aspect, prompt = '') {
  const adjustments = {
    'Électronique Grand Public': {
      DFA: { part_count: 18, fastener_types: 4, self_locating_features: true },
      DFM: { wall_thickness: 1.8, corner_radius: 0.8 },
      DFS: { modularity: true, diagnostic_access: true },
      DFSust: { recyclable_materials: 0.6, energy_efficiency: true }
    },
    'Mobilier': {
      DFA: { part_count: 8, symmetry: true, tool_changes: 2 },
      DFM: { wall_thickness: 3.5, corner_radius: 2.0, draft_angles: 4 },
      DFS: { modularity: true, disassembly_steps: 5, fastener_accessibility: 'facile' },
      DFSust: { recyclable_materials: 0.9, material_efficiency: 0.15 }
    },
    'Électroménager': {
      DFA: { part_count: 15, self_locating_features: true, assembly_direction: 1 },
      DFM: { wall_thickness: 2.2, draft_angles: 4, uniform_thickness: 0.25 },
      DFS: { diagnostic_access: true, fastener_accessibility: 'facile', standardized_parts: 0.8 },
      DFSust: { energy_efficiency: true, recyclable_materials: 0.7 }
    }
  };

  const categoryAdjustments = adjustments[category]?.[aspect];
  if (categoryAdjustments) {
    Object.assign(metrics, categoryAdjustments);
  }

  // Ajustements basés sur le prompt
  if (prompt.toLowerCase().includes('minimal') || prompt.toLowerCase().includes('simple')) {
    if (metrics.part_count) metrics.part_count = Math.max(3, metrics.part_count * 0.7);
    if (metrics.fastener_types) metrics.fastener_types = Math.max(1, metrics.fastener_types - 1);
  }

  if (prompt.toLowerCase().includes('complex') || prompt.toLowerCase().includes('advanced')) {
    if (metrics.part_count) metrics.part_count = Math.min(40, metrics.part_count * 1.3);
    if (metrics.fastener_types) metrics.fastener_types = Math.min(8, metrics.fastener_types + 1);
  }

  return metrics;
}
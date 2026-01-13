import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRecommendations } from '@/lib/dfx/rules';
import { analyzeImageForDfx } from '@/lib/dfx/imageAnalyzer';
import { calculateDfxScore } from '@/lib/dfx/rules';

/**
 * API pour raffiner un design basé sur son score DfX
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { 
      projectId, 
      currentPrompt, 
      currentMetrics, 
      currentScore,
      aspect,
      category,
      imageBase64
    } = await request.json();

    console.log('🔄 Raffinement DfX demandé:', {
      projectId,
      currentScore: (currentScore * 100).toFixed(1) + '%',
      aspect,
      category
    });

    // Régénérer les métriques pour s'assurer qu'elles sont fraîches
    const refreshedMetrics = await analyzeImageForDfx(
      imageBase64, 
      currentPrompt, 
      aspect, 
      category
    );
    
    // Recalculer le score avec les métriques fraîches
    const refreshedScore = calculateDfxScore(refreshedMetrics, aspect);

    // Récupérer les recommandations basées sur les métriques actuelles
    const recommendations = generateRecommendations(refreshedMetrics, aspect, refreshedScore);
    
    // Générer un nouveau prompt amélioré
    const refinedPrompt = await generateRefinedPrompt({
      currentPrompt,
      recommendations,
      aspect,
      category,
      currentScore: refreshedScore,
      currentMetrics: refreshedMetrics
    });

    console.log('✅ Prompt raffiné généré - Score actuel:', (refreshedScore * 100).toFixed(1) + '%');

    // Sauvegarder l'analyse de raffinement
    if (projectId) {
      try {
        const { error: saveError } = await supabase
          .from('design_refinements')
          .insert({
            project_id: projectId,
            original_prompt: currentPrompt,
            refined_prompt: refinedPrompt,
            original_score: currentScore,
            estimated_improvement: estimateImprovement(refreshedScore, recommendations).percentage,
            recommendations: recommendations.slice(0, 5),
            aspect: aspect,
            category: category
          });

        if (saveError) {
          console.error('❌ Erreur sauvegarde raffinement:', saveError);
        }
      } catch (dbError) {
        console.error('❌ Erreur base de données raffinement:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      refinedPrompt: refinedPrompt,
      recommendations: recommendations.slice(0, 5),
      improvementPotential: estimateImprovement(refreshedScore, recommendations),
      currentMetrics: refreshedMetrics,
      currentScore: refreshedScore,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur raffinement DfX:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du raffinement DfX: ' + error.message,
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * Génère un prompt raffiné basé sur les recommandations DfX
 */
async function generateRefinedPrompt({ 
  currentPrompt, 
  recommendations, 
  aspect, 
  category,
  currentScore,
  currentMetrics
}) {
  try {
    const mistralKey = process.env.MISTRAL_API_KEY;
    const mistralModel = process.env.MISTRAL_MODEL || 'mistral-small-latest';
    
    if (!mistralKey) {
      console.warn('⚠️ Mistral non disponible, utilisation raffinement basique');
      return generateBasicRefinement(currentPrompt, recommendations, aspect);
    }

    const improvementPrompt = buildImprovementPrompt({
      currentPrompt,
      recommendations,
      aspect,
      category,
      currentScore,
      currentMetrics
    });

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        model: mistralModel,
        messages: [
          {
            role: 'system',
            content: `Vous êtes un expert en design industriel spécialisé dans les méthodologies DfX (Design for ${aspect}). 
            Améliorez les prompts de design en incorporant des recommandations DfX tout en conservant l'intention de conception originale.
            Répondez en français.`
          },
          {
            role: 'user',
            content: improvementPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur Mistral: ${response.status}`);
    }

    const data = await response.json();
    let refinedPrompt = data.choices[0].message.content.trim();
    
    // Nettoyer le prompt
    refinedPrompt = refinedPrompt.replace(/^["']|["']$/g, '');
    
    // S'assurer que le prompt n'est pas trop long
    if (refinedPrompt.length > 400) {
      refinedPrompt = refinedPrompt.substring(0, 397) + '...';
    }

    return refinedPrompt;

  } catch (error) {
    console.error('❌ Erreur génération prompt avec Mistral:', error);
    return generateBasicRefinement(currentPrompt, recommendations, aspect);
  }
}

/**
 * Construit le prompt d'amélioration pour Mistral
 */
function buildImprovementPrompt({ 
  currentPrompt, 
  recommendations, 
  aspect, 
  category,
  currentScore,
  currentMetrics
}) {
  const topRecommendations = recommendations.slice(0, 3);
  
  // Analyser les métriques problématiques
  const problemMetrics = Object.entries(currentMetrics)
    .filter(([key, value]) => {
      const rules = require('@/lib/dfx/rules').DFX_RULES[aspect];
      const rule = rules.rules[key];
      const score = rule.scoring(value);
      return score < 0.6;
    })
    .map(([key, value]) => {
      const rules = require('@/lib/dfx/rules').DFX_RULES[aspect];
      const rule = rules.rules[key];
      return `${rule.name}: ${value}${rule.unit || ''} (score: ${(rule.scoring(value) * 100).toFixed(0)}%)`;
    });

  return `Améliorez ce prompt de design industriel en incorporant des recommandations DfX.

**Prompt Original:**
"${currentPrompt}"

**Catégorie Produit:** ${category}
**Aspect DfX:** ${aspect}
**Score Actuel:** ${(currentScore * 100).toFixed(1)}%

**Problèmes Identifiés:**
${problemMetrics.length > 0 ? problemMetrics.join('\n') : 'Aucun problème critique'}

**Recommandations Prioritaires:**
${topRecommendations.map((rec, i) => 
  `${i + 1}. [${rec.priority.toUpperCase()}] ${rec.suggestion}`
).join('\n')}

Générez un prompt amélioré qui:
1. Conserve l'intention de design originale et l'esthétique
2. Incorpore ces améliorations DfX de manière naturelle
3. Reste concis (2-3 phrases maximum)
4. Utilise un langage professionnel de design industriel
5. Se concentre sur les aspects ${aspect}

Retournez UNIQUEMENT le prompt amélioré, sans explication.`;
}

/**
 * Raffinement basique sans Mistral (fallback)
 */
function generateBasicRefinement(currentPrompt, recommendations, aspect) {
  const improvements = recommendations
    .slice(0, 3)
    .map(rec => {
      const suggestion = rec.suggestion.toLowerCase();
      
      if (suggestion.includes('réduire') || suggestion.includes('nombre de pièces')) {
        return 'avec un nombre minimal de pièces';
      }
      if (suggestion.includes('standardiser') || suggestion.includes('fixations')) {
        return 'avec des fixations standardisées';
      }
      if (suggestion.includes('épaisseur') || suggestion.includes('paroi')) {
        return 'avec une épaisseur de paroi optimisée';
      }
      if (suggestion.includes('angle') || suggestion.includes('dépouille')) {
        return 'avec des angles de dépouille appropriés';
      }
      if (suggestion.includes('rayon') || suggestion.includes('coin')) {
        return 'avec des coins arrondis';
      }
      if (suggestion.includes('module') || suggestion.includes('modulaire')) {
        return 'avec une conception modulaire';
      }
      if (suggestion.includes('recyclable') || suggestion.includes('durable')) {
        return 'avec des matériaux recyclables';
      }
      if (suggestion.includes('assemblage') || suggestion.includes('montage')) {
        return 'avec un assemblage simplifié';
      }
      return '';
    })
    .filter(imp => imp !== '')
    .join(', ');

  if (improvements) {
    return `${currentPrompt}, ${improvements}`;
  }
  
  // Fallback générique si aucune amélioration spécifique
  const aspectImprovements = {
    'DFA': 'avec assemblage optimisé et pièces minimales',
    'DFM': 'avec conception optimisée pour la fabrication',
    'DFS': 'avec maintenance et réparation facilitées', 
    'DFSust': 'avec matériaux durables et conception écologique'
  };
  
  return `${currentPrompt}, ${aspectImprovements[aspect] || 'avec optimisation DfX'}`;
}

/**
 * Estime le potentiel d'amélioration
 */
function estimateImprovement(currentScore, recommendations) {
  let potential = 0;
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  
  recommendations.forEach(rec => {
    if (rec.priority === 'haute') {
      potential += 0.10;
      highPriorityCount++;
    } else if (rec.priority === 'moyenne') {
      potential += 0.06;
      mediumPriorityCount++;
    } else {
      potential += 0.03;
    }
  });

  // Limiter selon le score actuel (loi des rendements décroissants)
  const maxPossible = 0.95; // Score maximum réaliste
  const maxImprovement = maxPossible - currentScore;
  potential = Math.min(potential, maxImprovement * 0.8); // 80% du maximum possible

  // Ajuster la confiance
  let confidence = 'moyenne';
  if (highPriorityCount >= 2) confidence = 'élevée';
  if (recommendations.length === 0) confidence = 'faible';

  return {
    percentage: Math.round(potential * 100),
    newScoreEstimate: Math.min(currentScore + potential, maxPossible),
    confidence: confidence,
    highPriorityCount,
    mediumPriorityCount,
    totalRecommendations: recommendations.length
  };
}
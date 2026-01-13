import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeImageForDfx } from '@/lib/dfx/imageAnalyzer';
import { calculateDfxScore, generateRecommendations } from '@/lib/dfx/rules';
import { generateDetailedDfxReport } from '@/lib/dfx/reportGenerator';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { 
      imageData, 
      aspect, 
      category, 
      userText, 
      prompt,
      projectId,
      iterationId 
    } = await request.json();

    console.log('📊 Génération rapport DfX:', { aspect, category, projectId, iterationId });

    if (!aspect || !category || !prompt) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: aspect, category et prompt requis' 
      }, { status: 400 });
    }

    // Analyser l'image avec le système DfX amélioré
    const metrics = await analyzeImageForDfx(
      imageData, 
      prompt, 
      aspect, 
      category
    );

    // Calculer le score DfX
    const score = calculateDfxScore(metrics, aspect);
    
    // Générer le rapport détaillé
    const report = await generateDetailedDfxReport({
      imageBase64: imageData,
      prompt,
      aspect,
      category,
      metrics,
      score
    });

    // Générer les recommandations
    const recommendations = generateRecommendations(metrics, aspect, score);

    // Qualifier le score
    const qualifier = getScoreQualifier(score);

    // CORRECTION: Vérifier que projectId et iterationId sont valides avant sauvegarde
    if (projectId && isValidUUID(projectId) && iterationId && isValidUUID(iterationId)) {
      try {
        const { error: updateError } = await supabase
          .from('design_iterations')
          .update({ 
            dfx_metrics: metrics,
            dfx_score: score,
            dfx_report: report,
            updated_at: new Date().toISOString()
          })
          .eq('id', iterationId)
          .eq('project_id', projectId);

        if (updateError) {
          console.error('❌ Erreur sauvegarde métriques:', updateError);
        } else {
          console.log('✅ Métriques DfX sauvegardées pour iteration:', iterationId);
        }
      } catch (dbError) {
        console.error('❌ Erreur base de données:', dbError);
      }
    } else {
      console.warn('⚠️ Données non sauvegardées: projectId ou iterationId invalide', { 
        projectId, 
        iterationId,
        projectIdValid: projectId && isValidUUID(projectId),
        iterationIdValid: iterationId && isValidUUID(iterationId)
      });
    }

    return NextResponse.json({
      success: true,
      metrics,
      score,
      qualifier,
      report,
      recommendations: recommendations.slice(0, 5),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur génération rapport DfX:', error);
    
    // Fallback: générer un rapport basique
    try {
      const fallbackMetrics = await analyzeImageForDfx(null, prompt, aspect, category);
      const fallbackScore = calculateDfxScore(fallbackMetrics, aspect);
      const fallbackReport = await generateDetailedDfxReport({
        imageBase64: null,
        prompt,
        aspect,
        category,
        metrics: fallbackMetrics,
        score: fallbackScore
      });

      return NextResponse.json({
        success: true,
        metrics: fallbackMetrics,
        score: fallbackScore,
        qualifier: getScoreQualifier(fallbackScore),
        report: fallbackReport,
        note: "Rapport généré en mode fallback",
        timestamp: new Date().toISOString()
      });

    } catch (fallbackError) {
      console.error('❌ Erreur même en fallback:', fallbackError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la génération du rapport DfX: ' + error.message,
          success: false
        },
        { status: 500 }
      );
    }
  }
}

// Fonction pour valider les UUID
function isValidUUID(uuid) {
  if (!uuid || uuid === 'null' || uuid === 'undefined') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function getScoreQualifier(score) {
  if (score >= 0.9) return 'Exceptionnel';
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.7) return 'Très bon';
  if (score >= 0.6) return 'Bon';
  if (score >= 0.5) return 'Moyen';
  if (score >= 0.4) return 'Faible';
  return 'Insuffisant';
}
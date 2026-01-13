// app/api/analysedfx/analyze-dfx.js
import { analyzeImageForDfx } from '@/lib/dfx/imageAnalyzer';
import { calculateDfxScore, generateRecommendations } from '@/lib/dfx/rules';
import { generateDetailedDfxReport } from '@/lib/dfx/reportGenerator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { imageBase64, prompt, aspect, category } = req.body;

    if (!prompt || !aspect || !category) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    console.log('🔍 Analyse DfX démarrée:', { aspect, category });

    // Analyser l'image pour obtenir les métriques DfX
    const metrics = await analyzeImageForDfx(imageBase64, prompt, aspect, category);

    // Calculer le score
    const score = calculateDfxScore(metrics, aspect);

    // Générer le rapport détaillé
    const report = await generateDetailedDfxReport({
      imageBase64,
      prompt,
      aspect,
      category,
      metrics,
      score
    });

    // Qualifier le score
    const qualifier = getScoreQualifier(score);

    res.status(200).json({
      success: true,
      metrics,
      score,
      qualifier,
      report
    });

  } catch (error) {
    console.error('❌ Erreur analyse DfX:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse DfX: ' + error.message 
    });
  }
}

function getScoreQualifier(score) {
  if (score >= 0.9) return 'Exceptionnel';
  if (score >= 0.8) return 'Excellent';
  if (score >= 0.7) return 'Très bon';
  if (score >= 0.6) return 'Bon';
  if (score >= 0.5) return 'Moyen';
  return 'À améliorer';
}
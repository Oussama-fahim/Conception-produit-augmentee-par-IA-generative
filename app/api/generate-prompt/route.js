import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { prompt, max_tokens = 100, temperature = 0.7 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    // Vérifier que la clé API Mistral est configurée
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY non configurée');
      throw new Error('Configuration Mistral API manquante');
    }

    try {
      // Appel à l'API Mistral
      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en design industriel. Réponds de manière concise et professionnelle.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: 1,
          stream: false
        })
      });

      if (!mistralResponse.ok) {
        const errorData = await mistralResponse.json().catch(() => ({}));
        console.error('Erreur API Mistral:', mistralResponse.status, errorData);
        throw new Error(`Mistral API error: ${mistralResponse.statusText}`);
      }

      const mistralData = await mistralResponse.json();
      const response = mistralData.choices?.[0]?.message?.content || "Brief design généré avec succès.";

      return NextResponse.json({
        success: true,
        response: response,
        timestamp: new Date().toISOString(),
        model: mistralData.model || 'mistral-small-latest',
        usage: mistralData.usage || null
      });

    } catch (mistralError) {
      console.error('Erreur Mistral:', mistralError);
      
      // Fallback: Génération de prompt basique
      const fallbackResponse = `Design concept créé basé sur les paramètres fournis. Professional product visualization, studio lighting, high detail.`;
      
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        note: "Prompt généré en mode fallback - Mistral API non disponible",
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Erreur génération prompt:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du prompt' },
      { status: 500 }
    );
  }
}
// app/dashboard/help/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'

// Catégories d'aide basées sur les fonctionnalités existantes
const helpCategories = {
  'design-studio': {
    title: 'Studio de Conception Design',
    description: 'Génération de designs avec analyse DfX',
    icon: '🎨',
    sections: [
      {
        title: 'Générateur de Concept Design',
        questions: [
          {
            q: 'Comment fonctionne le générateur de brief design ?',
            a: `Le générateur utilise Mistral AI pour créer des prompts de design professionnels. Il combine :
• Votre catégorie de produit (Électronique, Mobilier, etc.)
• Le focus design (Facteur Forme, Ergonomie, etc.)
• Le style souhaité (Minimaliste, Futuriste, etc.)
• Vos instructions personnalisées

Le système génère automatiquement un prompt optimisé pour la génération d'images IA.`
          },
          {
            q: 'Quelles catégories de produits sont disponibles ?',
            a: `7 catégories principales :
1. Électronique Grand Public
2. Mobilier
3. Transport
4. Électroménager
5. Équipement Industriel
6. Éclairage
7. Vêtements Connectés

Chaque catégorie contient des produits spécifiques pour des prompts précis.`
          },
          {
            q: 'Comment choisir le bon focus design ?',
            a: `Chaque focus correspond à une approche design spécifique :
• Facteur Forme : Forme et proportions
• Étude Matériaux : Matériaux et textures
• Ergonomie : Confort et utilisabilité
• Design Durable : Éco-conception et recyclabilité
• Mécanisme : Fonctionnalités mécaniques
• Fabrication : Optimisation de production`
          }
        ]
      },
      {
        title: 'Modes de Génération',
        questions: [
          {
            q: 'Différence entre "Texte → Image" et "Croquis → Image" ?',
            a: `📝 Texte → Image :
• Utilise Hugging Face ou Stability AI
• Transforme votre prompt texte en image
• Idéal pour les concepts initiaux
• 8+ modèles disponibles

🎨 Croquis → Image :
• Utilise Stability AI ControlNet
• Transforme votre croquis uploadé en image raffinée
• Préserve la structure de votre dessin
• Parfait pour itérer sur des esquises existantes`
          },
          {
            q: 'Quels modèles sont disponibles ?',
            a: `Modèles Texte → Image :
• Stable Diffusion 3 Medium (Diffusers)
• Stable Diffusion 3.5 Large
• Stable Diffusion XL Base
• FLUX.1 Schnell/Dev
• Et autres modèles spécialisés

Modèles Croquis → Image :
• Control Sketch : Pour croquis au trait
• Control Structure : Pour structure et ossature`
          },
          {
            q: 'Comment uploader un croquis efficacement ?',
            a: `Format recommandé :
• PNG, JPG, JPEG (max 5MB)
• Fond blanc ou contrasté
• Lignes claires et visibles
• Résolution : 512x512px minimum

Le système utilise ControlNet Scribble pour interpréter votre croquis.`
          }
        ]
      },
      {
        title: 'Analyse DfX en Temps Réel',
        questions: [
          {
            q: "Qu'est-ce que l'analyse DfX ?",
            a: `Le Design for Excellence (DfX) analyse votre design selon 4 aspects :
1. DFA - Design for Assembly : Facilité d'assemblage
2. DFM - Design for Manufacturing : Fabricabilité
3. DFS - Design for Service : Maintenabilité
4. DFSust - Design for Sustainability : Durabilité

Chaque génération est automatiquement analysée et notée.`
          },
          {
            q: 'Comment interpréter le score DfX ?',
            a: `Échelle de notation :
• 90-100% : Exceptionnel 🏆
• 80-89% : Excellent ⭐
• 70-79% : Très bon 👍
• 60-69% : Bon ✅
• 50-59% : Moyen ⚠️
• <50% : À améliorer 🔧

Le rapport détaillé explique chaque point d'amélioration.`
          },
          {
            q: 'Comment utiliser le raffinement DfX ?',
            a: `Le raffinement automatique :
1. Analyse les métriques de votre design actuel
2. Identifie les points faibles
3. Génère un prompt amélioré
4. Estime le gain potentiel

Fonction disponible dès qu'un score DfX est disponible.`
          }
        ]
      },
      {
        title: 'Gestion des Projets',
        questions: [
          {
            q: 'Comment créer et gérer un projet ?',
            a: `Étapes :
1. Nommez votre projet
2. Choisissez public/privé
3. Générez des itérations
4. Téléchargez les versions
5. Terminez le projet

Les projets sont sauvegardés dans votre espace personnel.`
          },
          {
            q: 'Que signifie "projet public" ?',
            a: `Projet public :
• Visible par les autres designers
• Partageable via lien
• Contribue à la communauté
• Reste dans votre portfolio

Projet privé :
• Seulement visible par vous
• Idéal pour les travaux confidentiels`
          },
          {
            q: 'Comment exporter mes designs ?',
            a: `Formats d'export :
• PNG haute résolution
• JSON complet (métadonnées + historique)
• Rapports DfX détaillés
• Batch download (toutes les itérations)

Tous les exports conservent les métadonnées et scores.`
          }
        ]
      }
    ]
  },
  '3d-transformation': {
    title: 'Transformation 3D',
    description: 'Conversion image → modèle 3D',
    icon: '🔄',
    sections: [
      {
        title: 'Fonctionnement de la Transformation',
        questions: [
          {
            q: 'Comment transformer une image en 3D ?',
            a: `Processus :
1. Upload d'une image 2D
2. Analyse par Stable Fast 3D
3. Génération de profondeur
4. Création du maillage 3D
5. Texturing automatique
6. Export GLB

Temps estimé : 1-3 minutes selon complexité.`
          },
          {
            q: 'Quels types d\'images fonctionnent le mieux ?',
            a: `Images idéales :
• Format carré 1024x1024px
• Objet bien défini au centre
• Fond contrasté (blanc recommandé)
• Bon éclairage
• Détails visibles

À éviter : fonds complexes, objets multiples, faible contraste.`
          },
          {
            q: 'Quels paramètres ajuster ?',
            a: `Paramètres clés :
• Résolution texture : 512-2048px
• Ratio avant-plan : ajuste la taille objet
• Type de maillage : triangle/quad/none
• Ces paramètres affectent qualité/poids fichier`
          }
        ]
      },
      {
        title: 'Formats et Compatibilité',
        questions: [
          {
            q: 'Quel format 3D est généré ?',
            a: `Format de sortie : GLB (GL Transmission Format Binary)
• Format standard industriel
• Inclut géométrie + textures
• Léger et optimisé
• Compatible avec tous les logiciels 3D majeurs`
          },
          {
            q: 'Avec quels logiciels utiliser mes modèles ?',
            a: `Compatibilité complète :
• Blender (gratuit)
• Unity & Unreal Engine
• Maya, 3ds Max, Cinema 4D
• Three.js (WebGL)
• SketchUp, Fusion 360
• Et tous les lecteurs GLB`
          },
          {
            q: 'Comment optimiser mes modèles pour le web ?',
            a: `Optimisations :
• Réduire résolution textures (512px)
• Simplifier géométrie dans Blender
• Exporter en GLB compressé
• Utiliser Draco compression si besoin
• Maintenir <5MB pour applications web`
          }
        ]
      },
      {
        title: 'Historique et Gestion',
        questions: [
          {
            q: 'Où trouver mes transformations précédentes ?',
            a: `Accès historique :
1. Onglet "Historique" dans Transformation 3D
2. Tri par date (plus récent d'abord)
3. Filtrage par statut
4. Recherche par nom
5. Vue détaillée de chaque projet

Tous les projets sont conservés indéfiniment.`
          },
          {
            q: 'Comment partager mes modèles 3D ?',
            a: `Options de partage :
• Lien direct vers fichier GLB
• Embed via viewer 3D
• Export vers Sketchfab
• Intégration dans presentations
• Partage privé via email

Les projets publics sont indexables.`
          },
          {
            q: 'Supprimer un projet 3D ?',
            a: `Pour supprimer :
1. Allez dans l'historique
2. Cliquez sur l'icône corbeille
3. Confirmez la suppression
4. Le fichier est immédiatement supprimé

Attention : action irréversible !`
          }
        ]
      }
    ]
  },
  'iterative-design': {
    title: 'Design Itératif',
    description: 'Amélioration progressive de designs',
    icon: '🔄',
    sections: [
      {
        title: 'Processus Itératif',
        questions: [
          {
            q: 'Qu\'est-ce que le design itératif ?',
            a: `Méthodologie en 5 étapes :
1. Brief : Définition des besoins
2. Croquis : Upload optionnel
3. Génération : Première version
4. Amélioration : Feedback + regénération
5. Finalisation : Rapport et export

Objectif : amélioration progressive via feedback.`
          },
          {
            q: 'Combien d\'itérations sont possibles ?',
            a: `Aucune limite ! Vous pouvez :
• Générer autant d'itérations que nécessaire
• Chaque itération conserve l'historique
• Comparer visuellement les versions
• Revenir à n'importe quelle étape

Recommandé : 3-5 itérations pour optimisation.`
          },
          {
            q: 'Comment donner du feedback efficace ?',
            a: `Feedback utile :
• Spécifique : "arrondir les angles"
• Mesurable : "augmenter de 20%"
• Réalisable : suggestions concrètes
• Pertinent : lié aux objectifs design
• Temporel : pour prochaine itération

Exemple : "Rendre la texture plus mate, épaissir les bords de 2mm".`
          }
        ]
      },
      {
        title: 'Outils d\'Amélioration',
        questions: [
          {
            q: 'Comment sélectionner une itération précédente ?',
            a: `Sélection :
1. Ouvrez l'historique des itérations
2. Cliquez sur "Sélectionner"
3. L'image s'affiche en grand
4. Toutes les métadonnées sont chargées
5. Vous pouvez repartir de cette version

Toutes les itérations restent modifiables.`
          },
          {
            q: 'Puis-je supprimer des itérations ?',
            a: `Oui, vous pouvez :
1. Supprimer une itération spécifique
2. Conserver les autres versions
3. Le score DfX reste dans l'historique
4. Les numéros d'itération s'ajustent

Utile pour nettoyer les versions intermédiaires.`
          },
          {
            q: 'Comment comparer deux itérations ?',
            a: `Méthodes de comparaison :
• Vue côte à côte
• Historique avec scores visibles
• Téléchargement groupé
• Analyse DfX comparative
• Slider avant/après

Recommandation : noter les changements entre chaque version.`
          }
        ]
      },
      {
        title: 'Export et Rapports',
        questions: [
          {
            q: 'Qu\'obtient-on à la fin du processus ?',
            a: `Livrables finaux :
• Toutes les itérations en PNG
• Rapport DfX détaillé
• Historique complet au format JSON
• Prompt final optimisé
• Score d'amélioration

Parfait pour présentations clients.`
          },
          {
            q: 'Comment mesurer la progression ?',
            a: `Métriques de progression :
• Score DfX par itération
• Amélioration en pourcentage
• Nombre d'itérations
• Temps total
• Points d'amélioration résolus

Le système génère un graphique de progression.`
          },
          {
            q: 'Puis-je reprendre un projet itératif ?',
            a: `Reprise possible :
• Projets en cours : continuez où vous étiez
• Projets terminés : clonez pour nouvelle version
• Toutes les données sont conservées
• Exportez pour archivage

Idéal pour les évolutions produit.`
          }
        ]
      }
    ]
  },
  'technical': {
    title: 'Aspects Techniques',
    description: 'Configuration et dépannage',
    icon: '⚙️',
    sections: [
      {
        title: 'Configuration Système',
        questions: [
          {
            q: 'Quelles sont les spécifications techniques requises ?',
            a: `Navigateurs supportés :
• Chrome 90+ (recommandé)
• Firefox 88+
• Safari 14+
• Edge 90+

Système :
• 4GB RAM minimum
• Connexion internet stable
• GPU recommandé (pas obligatoire)
• Résolution 1280x720 minimum`
          },
          {
            q: 'Les images sont-elles stockées ?',
            a: `Stockage :
• Vos images sont stockées temporairement
• Projets : stockage permanent (Supabase)
• Limite : 100 projets/utilisateur
• Format : URLs sécurisées
• Suppression automatique après 30 jours (brouillons)`
          },
          {
            q: 'Comment fonctionne l\'authentification ?',
            a: `Sécurité :
• Authentification via Supabase Auth
• Données chiffrées
• Sessions sécurisées
• Pas de partage de données
• Conformité RGPD

Vos designs restent privés sauf si partagés.`
          }
        ]
      },
      {
        title: 'Problèmes Courants',
        questions: [
          {
            q: 'La génération d\'image échoue, que faire ?',
            a: `Solutions :
1. Vérifiez votre connexion internet
2. Réduisez la résolution (512x512)
3. Simplifiez votre prompt
4. Essayez un autre modèle
5. Actualisez la page

Si persistant, contactez le support.`
          },
          {
            q: 'Pourquoi mon score DfX est bas ?',
            a: `Causes possibles :
• Image floue ou pixelisée
• Prompt trop vague
• Design trop complexe
• Mauvaise visibilité des détails
• Format non adapté

Solution : utilisez le raffinement automatique.`
          },
          {
            q: 'Problèmes de téléchargement ?',
            a: `Vérifiez :
• Autorisations navigateur
• Espace disque disponible
• Bloqueurs de popup
• Connexion stable
• Format de fichier supporté

Alternative : utilisez le lien direct.`
          }
        ]
      },
      {
        title: 'Limites et Capacités',
        questions: [
          {
            q: 'Quelles sont les limites de taille ?',
            a: `Limites actuelles :
• Images générées : max 1024x1024px
• Croquis upload : 5MB max
• Modèles 3D : 50MB max
• Durée génération : 5 minutes max
• Itérations/session : pas de limite

Ces limites peuvent évoluer.`
          },
          {
            q: 'Les designs sont-ils libres de droits ?',
            a: `Droits d'usage :
• Designs générés : usage personnel/commercial
• Attribution recommandée
• Pas de redistribution API
• Respect des licences modèles
• Vérifiez les spécificités par modèle

Consultez les conditions d'utilisation.`
          },
          {
            q: 'Puis-je utiliser l\'API pour automatisation ?',
            a: `API disponible pour :
• Entreprises avec compte pro
• Intégration workflow existant
• Génération batch
• Rapport automatisé
• Synchronisation avec outils design

Contactez-nous pour accès API.`
          }
        ]
      }
    ]
  }
}

// Composant Question Accordéon
const QuestionAccordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-300">
      <button
        className="w-full p-6 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold text-gray-800 text-lg pr-4">{question}</h3>
        <svg 
          className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {answer}
          </div>
        </div>
      )}
    </div>
  )
}

// Composant Section
const HelpSection = ({ title, questions }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <QuestionAccordion
            key={index}
            question={item.q}
            answer={item.a}
          />
        ))}
      </div>
    </div>
  )
}

// Composant Carte Catégorie
const CategoryCard = ({ category, isActive, onClick }) => {
  const data = helpCategories[category]
  
  return (
    <button
      onClick={() => onClick(category)}
      className={`w-full p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl' 
          : 'bg-white border border-gray-200 text-gray-800 hover:border-blue-300 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`text-2xl ${isActive ? 'text-white' : 'text-blue-600'}`}>
          {data.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-xl mb-1 ${isActive ? 'text-white' : 'text-gray-800'}`}>
            {data.title}
          </h3>
          <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-600'}`}>
            {data.description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}

export default function HelpPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('design-studio')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les questions basées sur la recherche
  const allQuestions = Object.entries(helpCategories).flatMap(([catId, catData]) =>
    catData.sections.flatMap(section =>
      section.questions.map(q => ({
        category: catData.title,
        section: section.title,
        question: q.q,
        answer: q.a,
        catId
      }))
    )
  )

  const filteredQuestions = searchQuery
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.section.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  Centre d'Aide Ideate
                </h1>
                <p className="text-gray-600">Guide complet pour maîtriser toutes les fonctionnalités</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour au Tableau de Bord</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Bienvenue dans l'Aide Ideate
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez des réponses à toutes vos questions sur notre plateforme de design industriel avec IA
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher dans l'aide (fonctionnalités, problèmes, guides...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredQuestions.length} résultat{filteredQuestions.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </div>
          )}
        </div>

        {/* Résultats de recherche */}
        {searchQuery && filteredQuestions && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Résultats de recherche
              </h3>
              <div className="space-y-6">
                {filteredQuestions.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-start space-x-3 mb-3">
                      <span className="text-blue-600 font-medium text-sm bg-blue-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-600 text-sm">{item.section}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{item.question}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3">{item.answer}</p>
                    <button
                      onClick={() => {
                        setActiveCategory(item.catId)
                        setSearchQuery('')
                      }}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      Voir plus dans {item.category}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation par catégories */}
        {!searchQuery && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Sélectionnez une Catégorie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(helpCategories).map(catId => (
                <CategoryCard
                  key={catId}
                  category={catId}
                  isActive={activeCategory === catId}
                  onClick={setActiveCategory}
                />
              ))}
            </div>
          </div>
        )}

        {/* Contenu de la catégorie active */}
        {!searchQuery && helpCategories[activeCategory] && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* En-tête de catégorie */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {helpCategories[activeCategory].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {helpCategories[activeCategory].title}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {helpCategories[activeCategory].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Sections de questions */}
            <div className="p-8">
              <div className="space-y-12">
                {helpCategories[activeCategory].sections.map((section, index) => (
                  <div key={index}>
                    <HelpSection
                      title={section.title}
                      questions={section.questions}
                    />
                    {index < helpCategories[activeCategory].sections.length - 1 && (
                      <div className="my-8 border-t border-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  )
}
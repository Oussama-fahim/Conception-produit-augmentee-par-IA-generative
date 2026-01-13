'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SketchUploader from '@/components/SketchUploader'
import DownloadButton from '@/components/DownloadButton'
import DfxScoreDisplay from '@/components/DfxScoreDisplay'
import DfxMetricsPanel from '@/components/DfxMetricsPanel'
import DebugMetrics from '@/components/DebugMetrics'
import LoadingSpinner from '@/components/LoadingSpinner'

// Configuration des modèles
const MODELES = {
  "Stable Diffusion 3 Medium (Diffusers)": {
    "model_id": "stabilityai/stable-diffusion-3-medium-diffusers",
    "type": "sdxl",
    "provider": "huggingface",
    "description": "Stable Diffusion 3 Medium avec qualité améliorée et meilleure compréhension du texte."
  },
  "Stable Diffusion 3.5 Large": {
    "model_id": "stabilityai/stable-diffusion-3.5-large",
    "type": "sdxl",
    "description": "Version large de SD 3.5 pour des images très détaillées et réalistes."
  },
  "Stable Diffusion 3 Medium": {
    "model_id": "stabilityai/stable-diffusion-3-medium",
    "type": "sdxl",
    "description": "Stable Diffusion 3 Medium classique avec bon compromis qualité/vitesse."
  },
  "Stable Diffusion XL Base": {
    "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
    "type": "sdxl",
    "description": "Modèle XL haute qualité avec rendu de détails exceptionnel."
  },
  "Stable Diffusion 3.5 Large Turbo": {
    "model_id": "stabilityai/stable-diffusion-3.5-large-turbo",
    "type": "sdxl",
    "description": "Version ultra-rapide de SD 3.5 Large, générant des images quasi en temps réel."
  },
  "FLUX.1 Schnell": {
    "model_id": "black-forest-labs/FLUX.1-schnell",
    "type": "sdxl",
    "description": "Modèle FLUX rapide pour des rendus conceptuels instantanés."
  },
  "FLUX.1 Dev": {
    "model_id": "black-forest-labs/FLUX.1-dev",
    "type": "sdxl",
    "description": "Version de développement de FLUX.1 pour expérimentations et tests."
  },
  "FLUX.1 Kontext Dev": {
    "model_id": "black-forest-labs/FLUX.1-Kontext-dev",
    "type": "sdxl",
    "description": "FLUX.1 Dev spécialisé pour gérer le contexte dans la génération d'images."
  },
  "FLUX.1 Krea Dev": {
    "model_id": "black-forest-labs/FLUX.1-Krea-dev",
    "type": "sdxl",
    "provider": "huggingface",
    "description": "FLUX.1 Dev orienté création artistique et générative avancée."
  },
  // Modèles Stability pour le mode Croquis → Image
  "Control Sketch": {
    "model_id": "stable-diffusion-xl-1024-v1-0",
    "type": "controlnet",
    "provider": "stability",
    "description": "Pipeline ControlNet pour utiliser un croquis comme guide principal"
  },
  "Control Structure": {
    "model_id": "stable-diffusion-xl-1024-v1-0",
    "type": "controlnet",
    "provider": "stability",
    "description": "ControlNet orienté structure pour guider la génération sur formes et ossature"
  }
};

// Composant de carte d'itération pour la conception rapide
const DesignIterationCard = ({ iteration, onSelect, isSelected, onDownload }) => {
  const [expanded, setExpanded] = useState(false)

  const getGenerationModeBadge = (mode) => {
    const modes = {
      'text-to-image': { label: 'Texte → Image', color: 'bg-blue-100 text-blue-800', icon: '📝' },
      'sketch-to-image': { label: 'Croquis → Image', color: 'bg-yellow-100 text-yellow-800', icon: '🎨' },
      'refinement': { label: 'Raffinement', color: 'bg-purple-100 text-purple-800', icon: '🔄' }
    }
    const config = modes[mode] || modes['text-to-image']
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) return null
    const qualifier = score >= 0.8 ? 'Excellent' : score >= 0.6 ? 'Bon' : 'À améliorer'
    const color = score >= 0.8 ? 'bg-green-100 text-green-800' : score >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {(score * 100).toFixed(1)}% - {qualifier}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* En-tête */}
      <div 
        className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            {iteration.iteration_number}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-800">
                Itération {iteration.iteration_number}
              </h4>
              {iteration.generation_mode && getGenerationModeBadge(iteration.generation_mode)}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{formatDate(iteration.created_at)}</span>
              {iteration.model_used && (
                <>
                  <span>•</span>
                  <span className="font-medium">{iteration.model_used}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {iteration.dfx_score !== null && iteration.dfx_score !== undefined && (
            <div className="text-right">
              {getScoreBadge(iteration.dfx_score)}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu détaillé */}
      {expanded && (
        <div className="p-6 space-y-6 bg-white">
          {/* Image et actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Image Générée</label>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 aspect-square">
                {iteration.image_url ? (
                  <img
                    src={iteration.image_url}
                    alt={`Itération ${iteration.iteration_number}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNNjAgNzVINjBWODVINjBWNzVaTTE0MCA3NUg4NVY4NUgxNDBWNzVaTTYwIDEwMEg2MFYxMTBINjBWMTBaTTE0MCAxMDBIODVWMTEwSDE0MFYxMDJaTTYwIDEyNUg2MFYxMzVINjBWMTI1Wk0xNDAgMTI1SDg1VjEzNUgxNDBWMTI1WiIgZmlsbD0iI2I4YjhiOCIvPjwvc3ZnPg=='
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="grid grid-cols-2 gap-3">
                {iteration.image_url && (
                  <DownloadButton
                    href={iteration.image_url}
                    filename={`iteration-${iteration.iteration_number}-design.png`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </DownloadButton>
                )}
                
                <button
                  onClick={() => onSelect && onSelect(iteration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            </div>

            {/* Détails techniques */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Prompt</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                  {iteration.prompt || 'Aucun prompt'}
                </p>
              </div>

              {iteration.feedback_text && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                    {iteration.feedback_text}
                  </p>
                </div>
              )}

              {/* Paramètres techniques */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Paramètres</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-2">
                  {iteration.seed && (
                    <p><span className="font-medium">Seed:</span> {iteration.seed}</p>
                  )}
                  {iteration.specifications && typeof iteration.specifications === 'object' && (
                    <>
                      {iteration.specifications.point_vue && (
                        <p><span className="font-medium">Point de vue:</span> {iteration.specifications.point_vue}</p>
                      )}
                      {iteration.specifications.hauteur && iteration.specifications.largeur && (
                        <p><span className="font-medium">Dimensions:</span> {iteration.specifications.largeur}×{iteration.specifications.hauteur}px</p>
                      )}
                    </>
                  )}
                  {iteration.control_strength && (
                    <p><span className="font-medium">Force ControlNet:</span> {iteration.control_strength}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Métriques DfX */}
          {iteration.dfx_metrics && Object.keys(iteration.dfx_metrics).length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Analyse DfX</label>
              <DfxMetricsPanel 
                metrics={iteration.dfx_metrics}
                aspect={iteration.dfx_aspect || 'DFM'}
                score={iteration.dfx_score}
                compact={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Styles professionnels améliorés
const styles = {
  card: "border border-gray-200 rounded-xl p-6 bg-white shadow-lg mb-6 transition-all duration-300 hover:shadow-xl",
  header: "text-3xl font-bold text-gray-800 mb-2",
  subheader: "text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-4",
  input: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  select: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  button: "w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md",
  buttonSecondary: "w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-all duration-200 border border-gray-300",
  label: "block text-sm font-semibold text-gray-700 mb-2 flex items-center",
  slider: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb",
  textarea: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-vertical min-h-[120px]",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
  badgeSuccess: "bg-green-100 text-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800",
  badgeError: "bg-red-100 text-red-800",
  badgeInfo: "bg-blue-100 text-blue-800"
}

// Générateur de prompt
class GenerateurPromptDesign {
  constructor() {
    this.categoriesProduits = {
      "Électronique Grand Public": ["smartphone", "ordinateur portable", "enceinte", "tablette", "casque audio", "écouteurs", "montre connectée", "écran", "clavier", "manette", "souris d'ordinateur"],
      "Mobilier": ["chaise", "bureau", "étagère", "canapé", "table", "bibliothèque", "lit", "tabouret", "unité de rangement", "poste de travail"],
      "Transport": ["trotinette", "vélo", "tableau de bord", "volant", "casque", "drone", "bagage", "sac à dos", "station de recharge"],
      "Électroménager": ["machine à café", "mixeur", "grille-pain", "bouilloire", "robot culinaire", "réfrigérateur", "micro-ondes", "batteur", "extracteur de jus"],
      "Équipement Industriel": ["outil électrique", "panneau de contrôle", "bras robotique", "imprimante 3D", "dispositif de surveillance", "capteur", "équipement d'usine"],
      "Éclairage": ["lampe de bureau", "lampe sur pied", "suspension", "applique murale", "éclairage sur rail", "lumière extérieure", "plafonnier"],
      "Vêtements Connectés": ["traqueur d'activité", "lunettes connectées", "moniteur de santé", "casque VR", "bijou connecté", "dispositif médical", "équipement de sécurité", "Vêtements", "Bandes frontales", "T-Shirts", "Jeans", "Hijab", "Pantalons", "Chapeaux", "Boucles d'oreilles", "Vestes", "Cravates", "Sweats à capuche", "Shorts"]
    }
    this.donneesFocus = {
      "Facteur Forme": {"keyword": "facteur forme", "details": ["lignes épurées", "proportions géométriques", "design compact", "forme innovante", "silhouette distinctive"]},
      "Étude Matériaux": {"keyword": "innovation matériaux", "details": ["matériaux durables", "combinaisons matériaux novatrices", "surfaces texturées", "composites haute performance", "matériaux recyclés"]},
      "Ergonomie": {"keyword": "ergonomie", "details": ["confort utilisateur", "contrôles intuitifs", "fonctionnalités accessibilité", "interfaces adaptatives", "design anthropométrique"]},
      "Design Durable": {"keyword": "durabilité", "details": ["efficacité énergétique", "composants recyclables", "impact environnemental réduit", "éléments biodégradables", "design cradle-to-cradle"]},
      "Mécanisme": {"keyword": "design mécanique", "details": ["mécanisme pliable", "composants ajustables", "ingénierie de précision", "assemblage modulaire", "joints innovants"]},
      "Fabrication": {"keyword": "innovation fabrication", "details": ["composants imprimés 3D", "moulage par injection", "usinage CNC", "fabrication avancée", "assemblage efficace"]}
    }
    this.stylesDesign = {
      "Minimaliste": "lignes épurées et forme simplifiée",
      "Brutaliste": "formes angulaires audacieuses avec matériaux apparents",
      "Organique": "formes fluides inspirées de la nature",
      "Futuriste": "éléments technologiques avancés et visionnaires",
      "Rétro": "inspiration vintage avec fonctionnalité contemporaine",
      "Biomorphique": "formes fluides inspirées de la biologie",
      "Scandinave": "design propre et fonctionnel avec éléments naturels",
      "Industriel": "design utilitaire avec éléments mécaniques apparents",
      "Modulaire": "composants reconfigurables avec approche systématique"
    }
  }

  _nettoyerPrompt(prompt, typeModele) {
    prompt = prompt.replace(/"/g, '').replace(/\n/g, ', ')
    const suffixes = {
      "sd": "visualisation produit professionnelle, éclairage studio, haut niveau de détail",
      "sdxl": "résolution 8k, photographie produit, rendu CAO, détails techniques précis",
      "if": "plan technique, matériaux réalistes, projection orthographique"
    }
    return `${prompt}, ${suffixes[typeModele] || ''}`
  }

  _promptSecours(categorie, focus, style, typeModele, item) {
    const detailsFocus = this.donneesFocus[focus]
    const descStyle = this.stylesDesign[style]
    const detail = detailsFocus.details[Math.floor(Math.random() * detailsFocus.details.length)]
    return this._nettoyerPrompt(`Un ${item} de style ${style.toLowerCase()} avec ${detailsFocus.keyword}, ${detail}, ${descStyle}`, typeModele)
  }
}

// Fonction helper pour valider les UUID
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
  return 'À améliorer';
}

export default function PageDesign() {
  const router = useRouter()
  const supabase = createClient()
  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [raffinementChargement, setRaffinementChargement] = useState(false)
  const [generationBrief, setGenerationBrief] = useState(false)
  const [terminerProjetChargement, setTerminerProjetChargement] = useState(false)
  const [ongletActif, setOngletActif] = useState('nouveau-design')
  
  // États pour le design
  const [modeleSelectionne, setModeleSelectionne] = useState("Stable Diffusion 3 Medium (Diffusers)")
  const [categorie, setCategorie] = useState("Électronique Grand Public")
  const [focus, setFocus] = useState("Facteur Forme")
  const [style, setStyle] = useState("Minimaliste")
  const [entreeUtilisateur, setEntreeUtilisateur] = useState("")
  const [promptDesign, setPromptDesign] = useState("")
  const [mode, setMode] = useState("Texte → Image")
  const [fichierCroquis, setFichierCroquis] = useState(null)
  
  // États pour la fonctionnalité designers
  const [nomProjet, setNomProjet] = useState("")
  const [projetPublic, setProjetPublic] = useState(false)
  const [idProjetActuel, setIdProjetActuel] = useState(null)
  
  const [specifications, setSpecifications] = useState({
    point_vue: "vue trois-quarts",
    style_rendu: "photographie produit",
    ajouter_suffixe: true,
    hauteur: 512,
    largeur: 512,
    prompt_negatif: "mauvaise qualité, proportions déformées, matériaux irréalistes, flou, filigrane, asymétrique",
    etapes_inference: 50,
    mode_basse_memoire: false,
    echelle_guidage: 7.5,
    seed: Math.floor(Math.random() * 2147483647),
    seed_aleatoire: true,
    seuil: 100,
    rayon_flou: 0.5,
    echelle_controlnet: 0.8,
    aspect: "DFM"
  })

  // NOUVEAUX ÉTATS DFX
  const [imageGeneree, setImageGeneree] = useState(null)
  const [dfxData, setDfxData] = useState(null)
  const [afficherRapportComplet, setAfficherRapportComplet] = useState(false)
  const [iterationActuelle, setIterationActuelle] = useState(1)
  const [historiqueIterations, setHistoriqueIterations] = useState([])
  const [message, setMessage] = useState({ type: '', content: '' })

  const [isEditing, setIsEditing] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)

  // État pour les données du croquis
  const [sketchData, setSketchData] = useState({
    sketch_data: null,
    sketch_url: null,
    sketch_metadata: null
  })

  const generateurPrompt = new GenerateurPromptDesign()

  useEffect(() => {
    verifierUtilisateur()
  }, [])

  // Quand on change de mode, forcer un modèle compatible
  useEffect(() => {
    if (mode === "Croquis → Image") {
      const firstStability = Object.keys(MODELES).find(name => MODELES[name].provider === 'stability')
      if (firstStability) setModeleSelectionne(firstStability)
    } else {
      const firstHF = Object.keys(MODELES).find(name => MODELES[name].provider !== 'stability')
      if (firstHF) setModeleSelectionne(firstHF)
    }
  }, [mode])

  // Mettre à jour les données du croquis quand un fichier est uploadé
  useEffect(() => {
    if (fichierCroquis) {
      const sketchUrl = URL.createObjectURL(fichierCroquis)
      const reader = new FileReader()
      reader.onloadend = () => {
        const sketchDataBase64 = reader.result
        setSketchData({
          sketch_data: sketchDataBase64,
          sketch_url: sketchUrl,
          sketch_metadata: {
            filename: fichierCroquis.name,
            size: fichierCroquis.size,
            type: fichierCroquis.type,
            lastModified: fichierCroquis.lastModified,
            created_at: new Date().toISOString()
          }
        })
      }
      reader.readAsDataURL(fichierCroquis)
    } else {
      setSketchData({
        sketch_data: null,
        sketch_url: null,
        sketch_metadata: null
      })
    }
  }, [fichierCroquis])

  const verifierUtilisateur = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/connexion')
    } else {
      setUtilisateur(currentUser)
    }
  }

  // Fonction pour analyser avec DfX
  const analyserAvecDfx = async (imageBase64, prompt, aspect, category, projectId, iterationId) => {
    try {
      console.log('🔄 Début analyse DfX...')
      
      const response = await fetch('/api/generate-dfx-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageBase64,
          prompt,
          aspect,
          category,
          projectId,
          iterationId
        })
      })

      if (!response.ok) {
        throw new Error('Erreur analyse DfX')
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Erreur analyse DfX:', error)
      throw error
    }
  }

  // Fonction pour raffiner le design
  const raffinerDesignDfx = async (projectId, currentPrompt, currentMetrics, currentScore, aspect, category, imageBase64) => {
    try {
      console.log('🔄 Raffinement DfX...')
      
      const response = await fetch('/api/refine-dfx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          currentPrompt,
          currentMetrics,
          currentScore,
          aspect,
          category,
          imageBase64
        })
      })

      if (!response.ok) {
        throw new Error('Erreur raffinement DfX')
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Erreur raffinement DfX:', error)
      throw error
    }
  }

  // Fonction pour générer le brief design avec Mistral
  const genererBriefDesign = async () => {
    setGenerationBrief(true)
    try {
      let item
      if (entreeUtilisateur) {
        const itemsCorrespondants = generateurPrompt.categoriesProduits[categorie].filter(item => 
          entreeUtilisateur.toLowerCase().includes(item.toLowerCase())
        )
        item = itemsCorrespondants.length > 0 ? itemsCorrespondants[0] : entreeUtilisateur
      } else {
        item = generateurPrompt.categoriesProduits[categorie][0]
      }

      const detailsFocus = generateurPrompt.donneesFocus[focus]
      const descStyle = generateurPrompt.stylesDesign[style]
      const detail = detailsFocus.details[Math.floor(Math.random() * detailsFocus.details.length)]

      const promptSysteme = `Vous êtes un designer industriel expert. Créez un prompt concis pour :
- Article : ${item}
- Focus : ${focus} (${detailsFocus.keyword} : ${detail})
- Style : ${style} (${descStyle})
${entreeUtilisateur ? '- Entrée utilisateur : ' + entreeUtilisateur : ''}
Produisez une description professionnelle de 2 lignes pour la visualisation de produit. Évitez les fonctionnalités irréalistes ou les longues listes.`

      const reponse = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptSysteme,
          max_tokens: 55,
          temperature: 0.7
        })
      })

      if (!reponse.ok) {
        throw new Error('Erreur lors de la génération du brief')
      }

      const resultat = await reponse.json()

      if (resultat.success) {
        const promptBrut = resultat.response
        const promptNettoye = generateurPrompt._nettoyerPrompt(promptBrut, MODELES[modeleSelectionne].type)
        setPromptDesign(promptNettoye)
      } else {
        throw new Error(resultat.error || 'Erreur inconnue')
      }

    } catch (erreur) {
      console.error("Erreur génération brief:", erreur)
      const promptSecours = generateurPrompt._promptSecours(
        categorie, 
        focus, 
        style, 
        MODELES[modeleSelectionne].type, 
        entreeUtilisateur || generateurPrompt.categoriesProduits[categorie][0]
      )
      setPromptDesign(promptSecours)
    } finally {
      setGenerationBrief(false)
    }
  }

  // GÉNÉRATION AVEC ANALYSE DFX COMPLÈTE
  const genererImage = async () => {
    if (!promptDesign) {
      setMessage({ type: 'error', content: "Veuillez d'abord générer un brief de design" })
      return
    }

    if (mode === "Croquis → Image" && !fichierCroquis) {
      setMessage({ type: 'error', content: "Veuillez uploader un croquis pour le mode Sketch-to-Image" })
      return
    }

    setChargement(true)
    setMessage({ type: '', content: '' })
    
    try {
      let projet

      if (isEditing && editingProjectId) {
        // Mettre à jour le projet existant avec les données du croquis
        const updateData = {
          title: `${categorie} - ${focus} - ${style}`,
          project_name: nomProjet || `${categorie} - ${focus} - ${style}`,
          description: promptDesign,
          category: categorie,
          design_focus: focus,
          design_style: style,
          aspect: specifications.aspect,
          prompt: promptDesign,
          is_project_public: projetPublic,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        }

        // Ajouter les données du croquis si disponibles
        if (sketchData.sketch_data && sketchData.sketch_url && sketchData.sketch_metadata) {
          updateData.sketch_data = sketchData.sketch_data
          updateData.sketch_url = sketchData.sketch_url
          updateData.sketch_metadata = sketchData.sketch_metadata
        }

        const { data: updatedProject, error: updateError } = await supabase
          .from('design_projects')
          .update(updateData)
          .eq('id', editingProjectId)
          .select()
          .single()

        if (updateError) throw new Error(`Erreur mise à jour projet: ${updateError.message}`)
        projet = updatedProject
      } else {
        // Créer un nouveau projet avec les données du croquis
        const insertData = {
          user_id: utilisateur.id,
          title: `${categorie} - ${focus} - ${style}`,
          project_name: nomProjet || `${categorie} - ${focus} - ${style}`,
          description: promptDesign,
          category: categorie,
          design_focus: focus,
          design_style: style,
          aspect: specifications.aspect,
          prompt: promptDesign,
          is_project_public: projetPublic,
          status: 'in_progress',
          type: 'standard'
        }

        // Ajouter les données du croquis si disponibles
        if (sketchData.sketch_data && sketchData.sketch_url && sketchData.sketch_metadata) {
          insertData.sketch_data = sketchData.sketch_data
          insertData.sketch_url = sketchData.sketch_url
          insertData.sketch_metadata = sketchData.sketch_metadata
        }

        const { data: newProject, error: createError } = await supabase
          .from('design_projects')
          .insert(insertData)
          .select()
          .single()

        if (createError) throw new Error(`Erreur création projet: ${createError.message}`)
        projet = newProject
      }

      setIdProjetActuel(projet.id)

      const formData = new FormData()
      formData.append('prompt', promptDesign)
      formData.append('model', modeleSelectionne)
      formData.append('specifications', JSON.stringify(specifications))
      formData.append('mode', mode)
      formData.append('category', categorie)
      formData.append('projectId', projet.id)
      
      if (mode === "Croquis → Image" && fichierCroquis) {
        formData.append('sketch', fichierCroquis)
      }

      const reponse = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      })

      if (!reponse.ok) {
        const donneesErreur = await reponse.json()
        throw new Error(donneesErreur.error || 'Erreur lors de la génération')
      }

      const resultat = await reponse.json()

      if (resultat.success) {
        setImageGeneree({
          image: resultat.image,
          prompt: promptDesign,
          seed: resultat.seed,
          timestamp: resultat.timestamp,
          note: resultat.note,
          provider: resultat.provider,
          mode: resultat.mode
        })

        // Sauvegarder l'itération avec l'image
        const iterationData = {
          project_id: projet.id,
          iteration_number: iterationActuelle,
          prompt: promptDesign,
          image_url: resultat.image,
          seed: resultat.seed,
          model_used: mode === "Croquis → Image" ? "Stability AI SDXL + ControlNet Scribble" : modeleSelectionne,
          specifications: {
            ...specifications,
            mode: mode,
            api_provider: mode === "Croquis → Image" ? 'stability_ai' : 'huggingface'
          },
          dfx_score: null,
          dfx_metrics: null,
          dfx_report: null
        }

        if (mode === "Croquis → Image") {
          iterationData.control_strength = specifications.echelle_controlnet || 0.7
          iterationData.generation_mode = 'sketch-to-image'
        } else {
          iterationData.generation_mode = 'text-to-image'
        }

        const { data: iteration, error: iterationError } = await supabase
          .from('design_iterations')
          .insert(iterationData)
          .select()
          .single()

        // ANALYSE DFX AVEC L'IMAGE RÉELLE
        console.log('🔍 Lancement analyse DfX...')
        try {
          // CORRECTION: Vérifier que l'itération existe avant de passer son ID
          const iterationIdToUse = iteration?.id && isValidUUID(iteration.id) ? iteration.id : null;
          
          const dfxResult = await analyserAvecDfx(
            resultat.image, 
            promptDesign, 
            specifications.aspect, 
            categorie,
            projet.id,
            iterationIdToUse // Utiliser l'ID seulement s'il est valide
          )
          
          setDfxData(dfxResult)
          
          setMessage({ 
            type: 'success', 
            content: `Design généré avec succès! Score DfX: ${(dfxResult.score * 100).toFixed(1)}% (${dfxResult.qualifier})`
          })

          // Mettre à jour l'itération avec les données DfX
          if (iterationIdToUse) {
            const { error: updateError } = await supabase
              .from('design_iterations')
              .update({
                dfx_score: dfxResult.score,
                dfx_metrics: dfxResult.metrics,
                dfx_report: dfxResult.report,
                dfx_qualifier: dfxResult.qualifier,
                dfx_aspect: specifications.aspect
              })
              .eq('id', iterationIdToUse)

            if (updateError) {
              console.error('Erreur mise à jour itération avec données DfX:', updateError)
            }
          }

          // Ajouter à l'historique
          const nouvelleIteration = {
            id: iterationIdToUse || iteration?.id,
            iteration_number: iterationActuelle,
            image_url: resultat.image,
            prompt: promptDesign,
            created_at: new Date().toISOString(),
            dfx_score: dfxResult.score,
            dfx_metrics: dfxResult.metrics,
            generation_mode: mode === "Croquis → Image" ? 'sketch-to-image' : 'text-to-image',
            model_used: mode === "Croquis → Image" ? "Stability AI SDXL + ControlNet" : modeleSelectionne,
            specifications: specifications
          }

          setHistoriqueIterations(prev => [...prev, nouvelleIteration])

        } catch (dfxError) {
          console.error('Erreur analyse DfX:', dfxError)
          setMessage({ 
            type: 'warning', 
            content: 'Design généré mais analyse DfX échouée. Utilisation des métriques par défaut.'
          })
          
          // Fallback avec analyse basique
          const { analyzeImageForDfx } = await import('@/lib/dfx/imageAnalyzer')
          const { calculateDfxScore } = await import('@/lib/dfx/rules')
          const { generateDetailedDfxReport } = await import('@/lib/dfx/reportGenerator')
          
          const fallbackMetrics = await analyzeImageForDfx(null, promptDesign, specifications.aspect, categorie)
          const fallbackScore = calculateDfxScore(fallbackMetrics, specifications.aspect)
          const fallbackReport = await generateDetailedDfxReport({
            imageBase64: null,
            prompt: promptDesign,
            aspect: specifications.aspect,
            category: categorie,
            metrics: fallbackMetrics,
            score: fallbackScore
          })
          
          setDfxData({
            metrics: fallbackMetrics,
            score: fallbackScore,
            qualifier: getScoreQualifier(fallbackScore),
            report: fallbackReport
          })

          // Mettre à jour l'itération avec les données de fallback
          if (iteration?.id && isValidUUID(iteration.id)) {
            const { error: updateError } = await supabase
              .from('design_iterations')
              .update({
                dfx_score: fallbackScore,
                dfx_metrics: fallbackMetrics,
                dfx_report: fallbackReport,
                dfx_qualifier: getScoreQualifier(fallbackScore),
                dfx_aspect: specifications.aspect
              })
              .eq('id', iteration.id)

            if (updateError) {
              console.error('Erreur mise à jour itération avec fallback DfX:', updateError)
            }
          }

          // Ajouter à l'historique avec les données de fallback
          const nouvelleIteration = {
            id: iteration?.id,
            iteration_number: iterationActuelle,
            image_url: resultat.image,
            prompt: promptDesign,
            created_at: new Date().toISOString(),
            dfx_score: fallbackScore,
            dfx_metrics: fallbackMetrics,
            generation_mode: mode === "Croquis → Image" ? 'sketch-to-image' : 'text-to-image',
            model_used: mode === "Croquis → Image" ? "Stability AI SDXL + ControlNet" : modeleSelectionne,
            specifications: specifications
          }

          setHistoriqueIterations(prev => [...prev, nouvelleIteration])
        }

        // Incrémenter l'itération pour la prochaine génération
        setIterationActuelle(prev => prev + 1)

      } else {
        throw new Error(resultat.error || 'Erreur inconnue')
      }

    } catch (erreur) {
      console.error("Erreur génération:", erreur)
      setMessage({ type: 'error', content: "Erreur lors de la génération de l'image: " + erreur.message })
    } finally {
      setChargement(false)
    }
  }

  // RAFFINEMENT BASÉ SUR DFX
  const raffinerDesign = async () => {
    if (!dfxData || !imageGeneree) {
      setMessage({ type: 'error', content: "Aucune image à raffiner" })
      return
    }

    setRaffinementChargement(true)
    setMessage({ type: '', content: '' })

    try {
      // Appeler l'API de raffinement DfX
      const resultat = await raffinerDesignDfx(
        idProjetActuel,
        promptDesign,
        dfxData.metrics,
        dfxData.score,
        specifications.aspect,
        categorie,
        imageGeneree.image
      )

      if (resultat.success) {
        // Appliquer le prompt raffiné
        setPromptDesign(resultat.refinedPrompt)
        
        // Mettre à jour les métriques et score
        if (resultat.currentMetrics && resultat.currentScore) {
          setDfxData(prev => ({
            ...prev,
            metrics: resultat.currentMetrics,
            score: resultat.currentScore
          }))
        }
        
        setMessage({ 
          type: 'success', 
          content: `Prompt raffiné généré ! Amélioration estimée: +${resultat.improvementPotential.percentage}%`
        })

      } else {
        throw new Error(resultat.error || 'Erreur inconnue')
      }

    } catch (erreur) {
      console.error("Erreur raffinement:", erreur)
      setMessage({ type: 'error', content: "Erreur lors du raffinement: " + erreur.message })
    } finally {
      setRaffinementChargement(false)
    }
  }

  // Fonction pour terminer le projet
  const terminerProjet = async () => {
    if (!idProjetActuel) {
      setMessage({ type: 'error', content: 'Aucun projet actif à terminer' })
      return
    }

    setTerminerProjetChargement(true)
    setMessage({ type: '', content: '' })

    try {
      const { error: updateError } = await supabase
        .from('design_projects')
        .update({
          status: 'completed',
          is_project_public: projetPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', idProjetActuel)

      if (updateError) {
        throw new Error(`Erreur mise à jour projet: ${updateError.message}`)
      }

      setMessage({
        type: 'success',
        content: projetPublic 
          ? 'Projet terminé et publié avec succès ! Il est maintenant visible par les autres designers.' 
          : 'Projet terminé avec succès ! Il reste privé dans votre espace personnel.'
      })

      // Réinitialiser les états pour un nouveau projet
      setTimeout(() => {
        setNomProjet("")
        setPromptDesign("")
        setImageGeneree(null)
        setDfxData(null)
        setIdProjetActuel(null)
        setEntreeUtilisateur("")
        setFichierCroquis(null)
        setHistoriqueIterations([])
        setIterationActuelle(1)
        setIsEditing(false)
        setEditingProjectId(null)
        setSketchData({
          sketch_data: null,
          sketch_url: null,
          sketch_metadata: null
        })
      }, 3000)

    } catch (erreur) {
      console.error("Erreur terminaison projet:", erreur)
      setMessage({
        type: 'error',
        content: 'Erreur lors de la terminaison du projet: ' + erreur.message
      })
    } finally {
      setTerminerProjetChargement(false)
    }
  }

  const utiliserBriefDesign = () => {
    setMessage({ type: 'success', content: 'Brief design appliqué avec succès!' })
  }

  // Télécharger toutes les itérations
  const downloadAllIterations = async () => {
    try {
      for (const iteration of historiqueIterations) {
        if (iteration.image_url) {
          const response = await fetch(iteration.image_url)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `iteration-${iteration.iteration_number}-${nomProjet || 'design'}.png`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          // Petit délai entre chaque téléchargement
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      alert(`Toutes les ${historiqueIterations.length} itérations ont été téléchargées avec succès!`)
    } catch (error) {
      console.error('Erreur téléchargement multiple:', error)
      alert('Erreur lors du téléchargement des itérations')
    }
  }

  // Télécharger le projet au format JSON
  const downloadProjectAsJson = async () => {
    try {
      const projectData = {
        projet: {
          nom: nomProjet || `${categorie} - ${focus} - ${style}`,
          description: promptDesign,
          categorie: categorie,
          focus: focus,
          style: style,
          aspect: specifications.aspect,
          prompt: promptDesign,
          date_creation: new Date().toISOString(),
          statut: 'in_progress',
          public: projetPublic
        },
        croquis: sketchData.sketch_metadata ? {
          metadata: sketchData.sketch_metadata,
          disponible: true
        } : null,
        iterations: historiqueIterations.map(iter => ({
          numero: iter.iteration_number,
          prompt: iter.prompt,
          score_dfx: iter.dfx_score,
          mode_generation: iter.generation_mode,
          modele: iter.model_used,
          date_creation: iter.created_at
        }))
      }
      
      // Convertir en JSON
      const jsonData = JSON.stringify(projectData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nomProjet || 'design'}-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert(`Projet exporté avec succès! ${historiqueIterations.length} itérations incluses.`)
    } catch (error) {
      console.error('Erreur export projet:', error)
      alert('Erreur lors de l\'export du projet')
    }
  }

  if (!utilisateur) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Chargement de votre espace design...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DebugMetrics 
        metrics={dfxData?.metrics} 
        aspect={specifications.aspect}
        score={dfxData?.score}
      />

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  Studio de Conception Ideate
                </h1>
                <p className="text-gray-600">Plateforme de design industriel avec analyse DfX en temps réel</p>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Concepteur de Produits Industriels
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générez des visualisations conceptuelles innovantes avec analyse DfX en temps réel
          </p>
        </div>

        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          <button
            onClick={() => setOngletActif('nouveau-design')}
            className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              ongletActif === 'nouveau-design' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold">Nouveau Design</span>
          </button>
        </div>

        {message.content && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'error' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.content}
            </div>
          </div>
        )}

        {ongletActif === 'nouveau-design' && (
          <div className="space-y-8">
            {/* Section Générateur de Concept */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>Générateur de Concept Design</h2>
                <span className={styles.badge + " " + styles.badgeInfo}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Assisté par IA
                </span>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={styles.label}>
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Catégorie de Produit
                      </label>
                      <select 
                        className={styles.select}
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value)}
                      >
                        {Object.keys(generateurPrompt.categoriesProduits).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={styles.label}>
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Focus du Design
                      </label>
                      <select 
                        className={styles.select}
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                      >
                        {Object.keys(generateurPrompt.donneesFocus).map(foc => (
                          <option key={foc} value={foc}>{foc}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={styles.label}>
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Style de Design
                      </label>
                      <select 
                        className={styles.select}
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                      >
                        {Object.keys(generateurPrompt.stylesDesign).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={styles.label}>
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Description Personnalisée
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="ex: 'avec une bordure incurvée élégante et un affichage LED'"
                        value={entreeUtilisateur}
                        onChange={(e) => setEntreeUtilisateur(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={genererBriefDesign}
                    disabled={generationBrief}
                    className={`${styles.button} ${generationBrief ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {generationBrief ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Génération avec IA en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Générer le Brief Design avec Mistral
                      </>
                    )}
                  </button>
                  
                  {promptDesign && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">{promptDesign}</p>
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={utiliserBriefDesign}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Utiliser ce brief</span>
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(promptDesign)}
                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copier</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Description du Focus
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {generateurPrompt.donneesFocus[focus].details.slice(0, 3).join(', ')}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Caractéristiques du Style
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {generateurPrompt.stylesDesign[style]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Brief Design */}
            <div className={styles.card}>
              <h2 className={styles.subheader}>Brief Design Détaillé</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={styles.label}>
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Nom du projet
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Donnez un nom significatif à votre projet"
                      value={nomProjet}
                      onChange={(e) => setNomProjet(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="is_project_public"
                      checked={projetPublic}
                      onChange={(e) => setProjetPublic(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_project_public" className="text-sm text-gray-700">
                      <span className="font-medium">Rendre ce projet public</span>
                      <p className="text-gray-500 text-xs mt-1">
                        Les autres designers pourront voir ce projet dans votre profil public
                      </p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={styles.label}>
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Mode de Génération
                    </label>
                    <select 
                      className={styles.select}
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                    >
                      <option value="Texte → Image">Texte → Image (Hugging Face)</option>
                      <option value="Croquis → Image">Croquis → Image (Stability AI)</option>
                    </select>
                  </div>
                  
                  {mode === "Croquis → Image" && (
                    <div>
                      <SketchUploader
                        onSketchUpload={setFichierCroquis}
                        disabled={idProjetActuel}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className={styles.label}>
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Description du Concept Design:
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={promptDesign}
                    onChange={(e) => setPromptDesign(e.target.value)}
                    placeholder="Exemple: Une lampe de bureau minimaliste avec bras ajustable, en aluminium brossé et bois, visualisation produit sur fond blanc"
                  />
                </div>
              </div>
            </div>

            {/* Section Paramètres Avancés */}
            <div className={styles.card}>
              <h2 className={styles.subheader}>Paramètres de Visualisation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className={styles.label}>Point de Vue</label>
                  <select 
                    className={styles.select}
                    value={specifications.point_vue}
                    onChange={(e) => setSpecifications(prev => ({...prev, point_vue: e.target.value}))}
                  >
                    <option value="vue trois-quarts">Vue trois-quarts</option>
                    <option value="vue de face">Vue de face</option>
                    <option value="vue de côté">Vue de côté</option>
                    <option value="vue de dessus">Vue de dessus</option>
                    <option value="vue isométrique">Vue isométrique</option>
                    <option value="vue éclatée">Vue éclatée</option>
                    <option value="vue en coupe">Vue en coupe</option>
                  </select>
                </div>
                
                <div>
                  <label className={styles.label}>Style de Rendu</label>
                  <select 
                    className={styles.select}
                    value={specifications.style_rendu}
                    onChange={(e) => setSpecifications(prev => ({...prev, style_rendu: e.target.value}))}
                  >
                    <option value="photographie produit">Photographie produit</option>
                    <option value="illustration technique">Illustration technique</option>
                    <option value="croquis">Croquis</option>
                    <option value="rendu CAO">Rendu CAO</option>
                    <option value="wireframe">Wireframe</option>
                    <option value="concept art">Concept art</option>
                    <option value="blueprint">Blueprint</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ajouter-suffixe"
                    checked={specifications.ajouter_suffixe}
                    onChange={(e) => setSpecifications(prev => ({...prev, ajouter_suffixe: e.target.checked}))}
                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ajouter-suffixe" className={styles.label}>Ajouter les suffixes de rendu technique</label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className={styles.label}>Aspect DfX</label>
                <select 
                  className={styles.select}
                  value={specifications.aspect}
                  onChange={(e) => setSpecifications(prev => ({...prev, aspect: e.target.value}))}
                >
                  <option value="DFA">DFA (Design for Assembly)</option>
                  <option value="DFM">DFM (Design for Manufacturing)</option>
                  <option value="DFS">DFS (Design for Service)</option>
                  <option value="DFSust">DFSust (Design for Sustainability)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={styles.label}>Hauteur de l'image: {specifications.hauteur}px</label>
                  <input
                    type="range"
                    min="256"
                    max="1024"
                    step="64"
                    value={specifications.hauteur}
                    onChange={(e) => setSpecifications(prev => ({...prev, hauteur: parseInt(e.target.value)}))}
                    className={styles.slider}
                  />
                </div>
                
                <div>
                  <label className={styles.label}>Largeur de l'image: {specifications.largeur}px</label>
                  <input
                    type="range"
                    min="256"
                    max="1024"
                    step="64"
                    value={specifications.largeur}
                    onChange={(e) => setSpecifications(prev => ({...prev, largeur: parseInt(e.target.value)}))}
                    className={styles.slider}
                  />
                </div>
              </div>
              
              {/* Paramètres avancés */}
              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span>Paramètres Avancés</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 space-y-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className={styles.label}>Prompt Négatif (éléments à éviter):</label>
                    <textarea
                      className={styles.textarea}
                      value={specifications.prompt_negatif}
                      onChange={(e) => setSpecifications(prev => ({...prev, prompt_negatif: e.target.value}))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={styles.label}>Qualité: {specifications.etapes_inference} étapes</label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={specifications.etapes_inference}
                        onChange={(e) => setSpecifications(prev => ({...prev, etapes_inference: parseInt(e.target.value)}))}
                        className={styles.slider}
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="mode-basse-memoire"
                        checked={specifications.mode_basse_memoire}
                        onChange={(e) => setSpecifications(prev => ({...prev, mode_basse_memoire: e.target.checked}))}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="mode-basse-memoire" className={styles.label}>Mode Basse Mémoire</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.label}>Échelle de Guidance: {specifications.echelle_guidage}</label>
                    <input
                      type="range"
                      min="5.0"
                      max="15.0"
                      step="0.5"
                      value={specifications.echelle_guidage}
                      onChange={(e) => setSpecifications(prev => ({...prev, echelle_guidage: parseFloat(e.target.value)}))}
                      className={styles.slider}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="seed-aleatoire"
                      checked={specifications.seed_aleatoire}
                      onChange={(e) => setSpecifications(prev => ({...prev, seed_aleatoire: e.target.checked}))}
                      className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="seed-aleatoire" className={styles.label}>Utiliser une seed aléatoire</label>
                  </div>
                  
                  {!specifications.seed_aleatoire && (
                    <div>
                      <label className={styles.label}>Seed</label>
                      <input
                        type="number"
                        className={styles.input}
                        value={specifications.seed}
                        onChange={(e) => setSpecifications(prev => ({...prev, seed: parseInt(e.target.value)}))}
                      />
                    </div>
                  )}

                  {mode === "Croquis → Image" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={styles.label}>Seuil des contours: {specifications.seuil}</label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={specifications.seuil}
                          onChange={(e) => setSpecifications(prev => ({...prev, seuil: parseInt(e.target.value)}))}
                          className={styles.slider}
                        />
                      </div>
                      
                      <div>
                        <label className={styles.label}>Rayon de flou: {specifications.rayon_flou}</label>
                        <input
                          type="range"
                          min="0.0"
                          max="5.0"
                          step="0.1"
                          value={specifications.rayon_flou}
                          onChange={(e) => setSpecifications(prev => ({...prev, rayon_flou: parseFloat(e.target.value)}))}
                          className={styles.slider}
                        />
                      </div>
                      
                      <div>
                        <label className={styles.label}>Échelle ControlNet: {specifications.echelle_controlnet}</label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.0"
                          step="0.1"
                          value={specifications.echelle_controlnet}
                          onChange={(e) => setSpecifications(prev => ({...prev, echelle_controlnet: parseFloat(e.target.value)}))}
                          className={styles.slider}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Sélection du Modèle */}
            <div className={styles.card}>
              <h2 className={styles.subheader}>Moteur de Modèle IA</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className={styles.label}>Sélectionnez le Moteur de Modèle</label>
                  <select 
                    className={styles.select}
                    value={modeleSelectionne}
                    onChange={(e) => setModeleSelectionne(e.target.value)}
                  >
                    {Object.keys(MODELES)
                      .filter(name => {
                        if (mode === "Croquis → Image") return MODELES[name].provider === 'stability';
                        return MODELES[name].provider !== 'stability';
                      })
                      .map(modele => (
                        <option key={modele} value={modele}>{modele}</option>
                    ))}
                  </select>
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {MODELES[modeleSelectionne]?.description || "Description non disponible"}
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className={`${styles.badge} ${styles.badgeSuccess} text-base py-2 px-4`}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {mode === "Croquis → Image" ? "Stability AI ControlNet" : "GPU Haute Performance"}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {mode === "Croquis → Image" 
                        ? "SDXL + ControlNet Scribble pour sketches" 
                        : "Optimisé pour la génération rapide"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de Génération Principal */}
            <button
              onClick={genererImage}
              disabled={chargement || !promptDesign || (mode === "Croquis → Image" && !fichierCroquis)}
              className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                chargement || !promptDesign || (mode === "Croquis → Image" && !fichierCroquis)
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              {chargement ? (
                <div className="flex items-center justify-center space-x-3">
                  <LoadingSpinner size="md" />
                  <span>Génération avec Analyse DfX...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>
                    {mode === "Croquis → Image" ? "🎨 Générer depuis le Sketch" : "🎨 Générer avec Analyse DfX"}
                  </span>
                </div>
              )}
            </button>

            {/* RÉSULTATS AVEC DFX */}
            {imageGeneree && dfxData && (
              <div className={styles.card}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={styles.subheader}>Résultat - Itération {iterationActuelle}</h2>
                  <div className="flex items-center space-x-3">
                    <DfxScoreDisplay score={dfxData.score} qualifier={dfxData.qualifier} />
                    <span className={`${styles.badge} ${
                      imageGeneree.provider === 'stability_ai' ? styles.badgeWarning : styles.badgeInfo
                    }`}>
                      {imageGeneree.provider === 'stability_ai' ? '🤖 Stability AI' : '🤖 Hugging Face'}
                    </span>
                    <span className={`${styles.badge} ${
                      projetPublic ? styles.badgeSuccess : styles.badgeInfo
                    }`}>
                      {projetPublic ? '📢 Public' : '🔒 Privé'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                      <img src={imageGeneree.image} alt="Design généré" className="w-full h-auto" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <DownloadButton
                        href={imageGeneree.image}
                        filename={`design_dfx_${Date.now()}.png`}
                        className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Télécharger PNG</span>
                      </DownloadButton>
                      
                      <button
                        onClick={raffinerDesign}
                        disabled={raffinementChargement || dfxData.score >= 0.9}
                        className={`py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center space-x-2 ${
                          raffinementChargement || dfxData.score >= 0.9
                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                        }`}
                      >
                        {raffinementChargement ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Raffinement...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>🔄 Raffiner Design</span>
                          </>
                        )}
                      </button>
                    </div>

                    {imageGeneree.note && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-yellow-800 text-sm">{imageGeneree.note}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Panneau DfX */}
                  <div className="space-y-6">
                    <DfxMetricsPanel 
                      metrics={dfxData.metrics} 
                      aspect={specifications.aspect}
                      score={dfxData.score}
                    />

                    {/* Rapport DfX */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Rapport DfX Détaillé</h4>
                        <button
                          onClick={() => setAfficherRapportComplet(!afficherRapportComplet)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {afficherRapportComplet ? 'Réduire' : 'Afficher complet'}
                        </button>
                      </div>
                      <div className={`text-sm text-gray-700 leading-relaxed ${afficherRapportComplet ? '' : 'max-h-64 overflow-y-auto'}`}>
                        <div dangerouslySetInnerHTML={{ __html: dfxData.report.replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>

                    {/* Détails techniques */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-800 mb-4">Détails techniques</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Mode:</span>
                          <span className="text-sm font-medium text-gray-800">{imageGeneree.mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">API:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {imageGeneree.provider === 'stability_ai' ? 'Stability AI' : 'Hugging Face'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Modèle:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {mode === "Croquis → Image" ? "Stability AI SDXL + ControlNet" : modeleSelectionne}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Dimensions:</span>
                          <span className="text-sm font-medium text-gray-800">{specifications.largeur} × {specifications.hauteur} px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Itération:</span>
                          <span className="text-sm font-medium text-gray-800">{iterationActuelle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historique itérations */}
                {historiqueIterations.length > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold mb-4">Historique des itérations ({historiqueIterations.length})</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={downloadAllIterations}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Télécharger toutes
                        </button>
                        <button
                          onClick={downloadProjectAsJson}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Exporter JSON
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {historiqueIterations.map((iteration) => (
                        <DesignIterationCard
                          key={iteration.id || iteration.iteration_number}
                          iteration={iteration}
                          onSelect={() => {
                            setImageGeneree({ image: iteration.image_url, prompt: iteration.prompt })
                            setDfxData({ 
                              score: iteration.dfx_score, 
                              metrics: iteration.dfx_metrics,
                              qualifier: iteration.dfx_score >= 0.8 ? 'Excellent' : iteration.dfx_score >= 0.6 ? 'Bon' : 'À améliorer'
                            })
                          }}
                          isSelected={imageGeneree?.image === iteration.image_url}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton terminer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={terminerProjet}
                    disabled={terminerProjetChargement}
                    className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                      terminerProjetChargement
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    }`}
                  >
                    {terminerProjetChargement ? (
                      <div className="flex items-center justify-center space-x-3">
                        <LoadingSpinner size="md" />
                        <span>Finalisation en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>✅ Terminer le Projet {projetPublic ? 'et Publier' : ''}</span>
                      </div>
                    )}
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {projetPublic 
                      ? 'Le projet sera marqué comme terminé et visible par les autres designers'
                      : 'Le projet sera marqué comme terminé et restera privé'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
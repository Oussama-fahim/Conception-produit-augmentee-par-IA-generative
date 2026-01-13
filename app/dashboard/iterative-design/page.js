'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import SketchUploader from '@/components/SketchUploader'
import DfxScoreDisplay from '@/components/DfxScoreDisplay'
import DfxMetricsPanel from '@/components/DfxMetricsPanel'
import LoadingSpinner from '@/components/LoadingSpinner'
import DownloadButton from '@/components/DownloadButton'
import Image from 'next/image'

// Configuration des modèles
const MODELES = {
  "Stable Diffusion 3 Medium (Diffusers)": {
    "model_id": "stabilityai/stable-diffusion-3-medium-diffusers",
    "type": "sdxl",
    "provider": "huggingface",
    "description": "Stable Diffusion 3 Medium avec qualité améliorée"
  },
  "Stable Diffusion 3.5 Large": {
    "model_id": "stabilityai/stable-diffusion-3.5-large",
    "type": "sdxl",
    "provider": "huggingface",
    "description": "Version large de SD 3.5 pour des images détaillées"
  },
  "Stable Diffusion XL Base": {
    "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
    "type": "sdxl",
    "provider": "huggingface",
    "description": "Modèle XL haute qualité avec rendu de détails"
  },
  "Control Structure": {
    "model_id": "stable-diffusion-xl-1024-v1-0",
    "type": "controlnet",
    "provider": "stability",
    "description": "ControlNet Structure pour amélioration itérative"
  },
  "Control Sketch": {
    "model_id": "stable-diffusion-xl-1024-v1-0",
    "type": "controlnet",
    "provider": "stability",
    "description": "ControlNet Sketch pour croquis"
  }
};

// Générateur de prompt
class GenerateurPromptDesign {
  constructor() {
    this.categoriesProduits = {
      "Électronique Grand Public": ["smartphone", "ordinateur portable", "enceinte", "tablette", "casque audio"],
      "Mobilier": ["chaise", "bureau", "étagère", "canapé", "table"],
      "Transport": ["trotinette", "vélo", "tableau de bord", "volant", "casque"],
      "Électroménager": ["machine à café", "mixeur", "grille-pain", "bouilloire", "robot culinaire"],
      "Équipement Industriel": ["outil électrique", "panneau de contrôle", "bras robotique", "imprimante 3D"],
      "Éclairage": ["lampe de bureau", "lampe sur pied", "suspension", "applique murale"],
      "Vêtements Connectés": ["traqueur d'activité", "lunettes connectées", "moniteur de santé", "casque VR"]
    };
    
    this.donneesFocus = {
      "Facteur Forme": {"keyword": "facteur forme", "details": ["lignes épurées", "proportions géométriques", "design compact"]},
      "Étude Matériaux": {"keyword": "innovation matériaux", "details": ["matériaux durables", "combinaisons matériaux novatrices"]},
      "Ergonomie": {"keyword": "ergonomie", "details": ["confort utilisateur", "contrôles intuitifs"]},
      "Design Durable": {"keyword": "durabilité", "details": ["efficacité énergétique", "composants recyclables"]}
    };
    
    this.stylesDesign = {
      "Minimaliste": "lignes épurées et forme simplifiée",
      "Brutaliste": "formes angulaires audacieuses",
      "Organique": "formes fluides inspirées de la nature",
      "Futuriste": "éléments technologiques avancés",
      "Rétro": "inspiration vintage avec fonctionnalité contemporaine"
    };
  }

  _nettoyerPrompt(prompt, typeModele) {
    prompt = prompt.replace(/"/g, '').replace(/\n/g, ', ');
    const suffixes = {
      "sdxl": "résolution 8k, photographie produit, rendu CAO",
      "controlnet": "concept design professionnel, visualisation produit"
    };
    return `${prompt}, ${suffixes[typeModele] || ''}`;
  }

  _promptSecours(categorie, focus, style, typeModele, item) {
    const detailsFocus = this.donneesFocus[focus];
    const descStyle = this.stylesDesign[style];
    const detail = detailsFocus.details[Math.floor(Math.random() * detailsFocus.details.length)];
    return this._nettoyerPrompt(`Un ${item} de style ${style.toLowerCase()} avec ${detailsFocus.keyword}, ${detail}, ${descStyle}`, typeModele);
  }
}

// Composant de carte d'itération amélioré pour design itératif
const IterativeIterationCard = ({ iteration, onSelect, isSelected, onDownload, onDelete }) => {
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

          {/* Actions supplémentaires */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              ID: {iteration.id?.substring(0, 8)}...
            </div>
            <div className="flex items-center space-x-2">
              {onDelete && (
                <button
                  onClick={() => onDelete(iteration.id)}
                  className="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Styles
const styles = {
  card: "border border-gray-200 rounded-xl p-6 bg-white shadow-lg mb-6 transition-all duration-300 hover:shadow-xl",
  header: "text-3xl font-bold text-gray-800 mb-2",
  subheader: "text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-4",
  input: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  select: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  button: "w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md",
  label: "block text-sm font-semibold text-gray-700 mb-2 flex items-center",
  textarea: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-vertical min-h-[120px]",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
  badgeSuccess: "bg-green-100 text-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800",
  badgeError: "bg-red-100 text-red-800",
  badgeInfo: "bg-blue-100 text-blue-800"
};

export default function IterativeDesignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [generationBrief, setGenerationBrief] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [iterationDeleteLoading, setIterationDeleteLoading] = useState(null);

  // États du projet
  const [etape, setEtape] = useState('brief'); // 'brief', 'croquis', 'generation', 'amelioration', 'fin'
  const [modeleSelectionne, setModeleSelectionne] = useState("Stable Diffusion 3 Medium (Diffusers)");
  const [categorie, setCategorie] = useState("Électronique Grand Public");
  const [focus, setFocus] = useState("Facteur Forme");
  const [style, setStyle] = useState("Minimaliste");
  const [entreeUtilisateur, setEntreeUtilisateur] = useState("");
  const [promptDesign, setPromptDesign] = useState("");
  const [fichierCroquis, setFichierCroquis] = useState(null);
  const [feedbackAmelioration, setFeedbackAmelioration] = useState("");

  // Données du projet
  const [nomProjet, setNomProjet] = useState("");
  const [projetPublic, setProjetPublic] = useState(false);
  const [projetId, setProjetId] = useState(null);
  const [iterations, setIterations] = useState([]);
  const [iterationActuelle, setIterationActuelle] = useState(null);

  // Spécifications
  const [specifications, setSpecifications] = useState({
    point_vue: "vue trois-quarts",
    style_rendu: "photographie produit",
    hauteur: 512,
    largeur: 512,
    prompt_negatif: "mauvaise qualité, proportions déformées, matériaux irréalistes",
    etapes_inference: 50,
    echelle_guidage: 7.5,
    seed: Math.floor(Math.random() * 2147483647),
    seed_aleatoire: true,
    echelle_controlnet: 0.7,
    aspect: "DFM"
  });

  const generateurPrompt = new GenerateurPromptDesign();

  useEffect(() => {
    verifierUtilisateur();
  }, []);

  const verifierUtilisateur = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/connexion');
    } else {
      setUtilisateur(user);
    }
  };

  // Générer le brief design
  const genererBriefDesign = async () => {
    setGenerationBrief(true);
    try {
      let item;
      if (entreeUtilisateur) {
        const itemsCorrespondants = generateurPrompt.categoriesProduits[categorie].filter(item => 
          entreeUtilisateur.toLowerCase().includes(item.toLowerCase())
        );
        item = itemsCorrespondants.length > 0 ? itemsCorrespondants[0] : entreeUtilisateur;
      } else {
        item = generateurPrompt.categoriesProduits[categorie][0];
      }

      const detailsFocus = generateurPrompt.donneesFocus[focus];
      const descStyle = generateurPrompt.stylesDesign[style];
      const detail = detailsFocus.details[Math.floor(Math.random() * detailsFocus.details.length)];

      const promptSysteme = `Créez un prompt concis pour un design de ${item} avec focus sur ${focus} et style ${style}. ${entreeUtilisateur ? 'Ajouter: ' + entreeUtilisateur : ''}`;

      const reponse = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptSysteme,
          max_tokens: 55,
          temperature: 0.7
        })
      });

      if (!reponse.ok) throw new Error('Erreur génération brief');

      const resultat = await reponse.json();
      
      if (resultat.success) {
        const promptNettoye = generateurPrompt._nettoyerPrompt(resultat.response, MODELES[modeleSelectionne].type);
        setPromptDesign(promptNettoye);
        setEtape('croquis');
        setMessage({ type: 'success', content: 'Brief design généré avec succès!' });
      } else {
        throw new Error(resultat.error || 'Erreur inconnue');
      }

    } catch (erreur) {
      console.error("Erreur génération brief:", erreur);
      const promptSecours = generateurPrompt._promptSecours(
        categorie, focus, style, MODELES[modeleSelectionne].type, 
        entreeUtilisateur || generateurPrompt.categoriesProduits[categorie][0]
      );
      setPromptDesign(promptSecours);
      setEtape('croquis');
      setMessage({ type: 'warning', content: 'Brief généré en mode secours' });
    } finally {
      setGenerationBrief(false);
    }
  };

  // Démarrer le projet
  const demarrerProjet = async () => {
    if (!promptDesign) {
      setMessage({ type: 'error', content: 'Veuillez d\'abord générer un brief design' });
      return;
    }

    try {
      // Préparer les données du croquis
      let sketchData = null
      let sketchUrl = null
      let sketchMetadata = null

      if (fichierCroquis) {
        // Créer un URL temporaire pour l'affichage
        sketchUrl = URL.createObjectURL(fichierCroquis)
        
        // Convertir en base64 pour sauvegarde
        const reader = new FileReader()
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => {
            sketchData = reader.result
            resolve()
          }
        })
        reader.readAsDataURL(fichierCroquis)
        await base64Promise
        
        // Créer les métadonnées
        sketchMetadata = {
          filename: fichierCroquis.name,
          size: fichierCroquis.size,
          type: fichierCroquis.type,
          lastModified: fichierCroquis.lastModified,
          created_at: new Date().toISOString()
        }
      }

      const { data: projet, error } = await supabase
        .from('design_projects')
        .insert({
          user_id: utilisateur.id,
          title: `${categorie} - ${focus} - ${style}`,
          project_name: nomProjet || `Projet Itératif - ${new Date().toLocaleDateString('fr-FR')}`,
          description: promptDesign,
          category: categorie,
          design_focus: focus,
          design_style: style,
          aspect: specifications.aspect,
          prompt: promptDesign,
          is_project_public: projetPublic,
          status: 'in_progress',
          type: 'iterative',
          // Ajouter les données du croquis
          sketch_data: sketchData,
          sketch_url: sketchUrl,
          sketch_metadata: sketchMetadata
        })
        .select()
        .single();

      if (error) throw error;

      setProjetId(projet.id);
      setEtape('generation');
      setMessage({ type: 'success', content: 'Projet créé! Prêt pour la première itération.' });

    } catch (erreur) {
      console.error("Erreur création projet:", erreur);
      setMessage({ type: 'error', content: 'Erreur création projet: ' + erreur.message });
    }
  };

  // Générer une itération
  const genererIteration = async (type = 'first') => {
    if (!projetId) {
      setMessage({ type: 'error', content: 'Projet non créé' });
      return;
    }

    setChargement(true);
    setMessage({ type: '', content: '' });

    try {
      const iterationNum = iterations.length + 1;
      const mode = fichierCroquis && type === 'first' ? "Croquis → Image" : "Texte → Image";

      const formData = new FormData();
      formData.append('prompt', promptDesign);
      formData.append('model', modeleSelectionne);
      formData.append('specifications', JSON.stringify(specifications));
      formData.append('mode', mode);
      formData.append('category', categorie);
      formData.append('projectId', projetId);
      formData.append('iterationNumber', iterationNum);

      // Ajouter croquis pour première itération
      if (type === 'first' && fichierCroquis) {
        formData.append('sketch', fichierCroquis);
      }

      // Ajouter image précédente et feedback pour amélioration
      if (type === 'improvement' && iterationActuelle) {
        formData.append('feedback', feedbackAmelioration);
        
        // Convertir l'URL de l'image en blob
        const response = await fetch(iterationActuelle.image_url);
        const blob = await response.blob();
        formData.append('previousImage', blob, 'previous.png');
      }

      const reponse = await fetch('/api/iterative-generation', {
        method: 'POST',
        body: formData
      });

      if (!reponse.ok) {
        const donneesErreur = await reponse.json();
        throw new Error(donneesErreur.error || 'Erreur génération');
      }

      const resultat = await reponse.json();

      if (resultat.success) {
        const nouvelleIteration = {
          id: Date.now(),
          iteration_number: iterationNum,
          image_url: resultat.image,
          prompt: promptDesign,
          feedback: type === 'improvement' ? feedbackAmelioration : null,
          dfx: resultat.dfx,
          timestamp: resultat.timestamp,
          model: resultat.model,
          specifications: specifications,
          generation_mode: type === 'first' && fichierCroquis ? 'sketch-to-image' : 'text-to-image',
          dfx_score: resultat.dfx?.score,
          dfx_metrics: resultat.dfx?.metrics,
          dfx_qualifier: resultat.dfx?.qualifier,
          created_at: new Date().toISOString()
        };

        // Sauvegarder dans la base de données
        const { data: savedIteration, error: saveError } = await supabase
          .from('design_iterations')
          .insert({
            project_id: projetId,
            iteration_number: iterationNum,
            prompt: promptDesign,
            image_url: resultat.image,
            seed: resultat.seed,
            model_used: resultat.model,
            specifications: specifications,
            dfx_score: resultat.dfx?.score,
            dfx_metrics: resultat.dfx?.metrics,
            dfx_report: resultat.dfx?.report,
            dfx_qualifier: resultat.dfx?.qualifier,
            feedback_text: type === 'improvement' ? feedbackAmelioration : null,
            generation_mode: type === 'first' && fichierCroquis ? 'sketch-to-image' : 'text-to-image'
          })
          .select()
          .single();

        if (!saveError) {
          nouvelleIteration.id = savedIteration.id;
          nouvelleIteration.created_at = savedIteration.created_at;
        }

        // Mettre à jour les états
        const nouvellesIterations = [...iterations, nouvelleIteration];
        setIterations(nouvellesIterations);
        setIterationActuelle(nouvelleIteration);
        setFeedbackAmelioration("");

        if (type === 'first') {
          setEtape('amelioration');
          setMessage({ type: 'success', content: 'Première itération générée!' });
        } else {
          setMessage({ type: 'success', content: `Itération ${iterationNum} améliorée!` });
        }

        // Mettre à jour le projet
        await supabase
          .from('design_projects')
          .update({ 
            iterations_count: iterationNum,
            updated_at: new Date().toISOString()
          })
          .eq('id', projetId);

      } else {
        throw new Error(resultat.error || 'Erreur inconnue');
      }

    } catch (erreur) {
      console.error("Erreur génération itération:", erreur);
      setMessage({ type: 'error', content: 'Erreur génération: ' + erreur.message });
    } finally {
      setChargement(false);
    }
  };

  // Terminer le projet
  const terminerProjet = async () => {
    if (!projetId || !iterationActuelle) {
      setMessage({ type: 'error', content: 'Aucune itération à terminer' });
      return;
    }

    try {
      const { error } = await supabase
        .from('design_projects')
        .update({
          status: 'completed',
          final_iteration_id: iterationActuelle.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', projetId);

      if (error) throw error;

      setEtape('fin');
      setMessage({ 
        type: 'success', 
        content: 'Projet terminé avec succès! Rapport DfX disponible ci-dessous.' 
      });

    } catch (erreur) {
      console.error("Erreur terminaison projet:", erreur);
      setMessage({ type: 'error', content: 'Erreur terminaison: ' + erreur.message });
    }
  };

  // Passer à l'itération suivante sans feedback
  const iterationSuivanteSansFeedback = async () => {
    setFeedbackAmelioration("");
    await genererIteration('improvement');
  };

  // Télécharger toutes les itérations
  const downloadAllIterations = async () => {
    try {
      for (const iteration of iterations) {
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
      
      alert(`Toutes les ${iterations.length} itérations ont été téléchargées avec succès!`)
    } catch (error) {
      console.error('Erreur téléchargement multiple:', error)
      alert('Erreur lors du téléchargement des itérations')
    }
  }

  // Supprimer une itération
  const handleDeleteIteration = async (iterationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette itération ? Cette action est irréversible.')) {
      return
    }

    setIterationDeleteLoading(iterationId)
    try {
      const { error } = await supabase
        .from('design_iterations')
        .delete()
        .eq('id', iterationId)

      if (error) throw error

      // Mettre à jour les états localement
      const updatedIterations = iterations.filter(iter => iter.id !== iterationId)
      setIterations(updatedIterations)
      
      if (iterationActuelle?.id === iterationId) {
        setIterationActuelle(updatedIterations.length > 0 ? updatedIterations[0] : null)
      }

      setMessage({ type: 'success', content: 'Itération supprimée avec succès!' })

    } catch (error) {
      console.error('Erreur suppression itération:', error)
      setMessage({ type: 'error', content: 'Erreur lors de la suppression de l\'itération' })
    } finally {
      setIterationDeleteLoading(null)
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardHeader user={utilisateur} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Design Itératif Avancé
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Améliorez progressivement votre design grâce à un processus itératif guidé
          </p>
        </div>

        {message.content && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
            'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'error' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : message.type === 'warning' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

        {/* ÉTAPE 1: BRIEF DESIGN */}
        {etape === 'brief' && (
          <div className={styles.card}>
            <h2 className={styles.subheader}>Étape 1: Brief Design</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={styles.label}>Catégorie de Produit</label>
                <select className={styles.select} value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                  {Object.keys(generateurPrompt.categoriesProduits).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={styles.label}>Focus du Design</label>
                <select className={styles.select} value={focus} onChange={(e) => setFocus(e.target.value)}>
                  {Object.keys(generateurPrompt.donneesFocus).map(foc => (
                    <option key={foc} value={foc}>{foc}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={styles.label}>Style de Design</label>
                <select className={styles.select} value={style} onChange={(e) => setStyle(e.target.value)}>
                  {Object.keys(generateurPrompt.stylesDesign).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={styles.label}>Description Personnalisée</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="ex: 'avec une bordure incurvée élégante'"
                  value={entreeUtilisateur}
                  onChange={(e) => setEntreeUtilisateur(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={genererBriefDesign}
              disabled={generationBrief}
              className={`${styles.button} ${generationBrief ? 'opacity-50' : ''}`}
            >
              {generationBrief ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Génération du brief...
                </div>
              ) : 'Générer le Brief Design'}
            </button>

            {promptDesign && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-gray-700 leading-relaxed">{promptDesign}</p>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2: CROQUIS ET CONFIGURATION */}
        {etape === 'croquis' && promptDesign && (
          <div className={styles.card}>
            <h2 className={styles.subheader}>Étape 2: Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={styles.label}>Nom du Projet</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Donnez un nom à votre projet"
                  value={nomProjet}
                  onChange={(e) => setNomProjet(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="projet-public"
                  checked={projetPublic}
                  onChange={(e) => setProjetPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="projet-public" className="text-sm text-gray-700">
                  Rendre ce projet public
                </label>
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

            <div className="mb-6">
              <SketchUploader
                onSketchUpload={setFichierCroquis}
                label="Croquis initial (optionnel)"
                description="Téléchargez un croquis pour la première itération. Si vous ne téléchargez pas de croquis, la première itération utilisera la génération texte->image."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={styles.label}>Modèle</label>
                <select 
                  className={styles.select}
                  value={modeleSelectionne}
                  onChange={(e) => setModeleSelectionne(e.target.value)}
                >
                  {Object.keys(MODELES).map(modele => (
                    <option key={modele} value={modele}>{modele}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-center">
                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                  {fichierCroquis ? "🎨 Mode Croquis" : "📝 Mode Texte"}
                </span>
              </div>
            </div>

            <button
              onClick={demarrerProjet}
              className={`${styles.button} mt-6`}
            >
              Créer le Projet et Continuer
            </button>
          </div>
        )}

        {/* ÉTAPE 3: PREMIÈRE GÉNÉRATION */}
        {etape === 'generation' && projetId && (
          <div className={styles.card}>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Prêt pour la première itération!</h3>
              <p className="text-gray-600 mb-6">
                {fichierCroquis 
                  ? "Votre croquis est prêt. Générez la première version de votre design."
                  : "Générez la première version de votre design à partir du brief."
                }
              </p>
              
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => genererIteration('first')}
                  disabled={chargement}
                  className={`${styles.button} ${chargement ? 'opacity-50' : ''}`}
                >
                  {chargement ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Génération en cours...
                    </div>
                  ) : (
                    fichierCroquis ? '🎨 Générer depuis le Croquis' : '📝 Générer Première Version'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4: AMÉLIORATION ITÉRATIVE */}
        {etape === 'amelioration' && iterationActuelle && (
          <div className="space-y-6">
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>
                  Itération {iterationActuelle.iteration_number}
                  {iterationActuelle.feedback && (
                    <span className="ml-2 text-sm font-normal text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                      Améliorée
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  {iterationActuelle.dfx_score && (
                    <DfxScoreDisplay score={iterationActuelle.dfx_score} qualifier={iterationActuelle.dfx_qualifier} />
                  )}
                  <DownloadButton
                    href={iterationActuelle.image_url}
                    filename={`iteration-${iterationActuelle.iteration_number}-${nomProjet || 'design'}.png`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </DownloadButton>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image générée */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <img
                      src={iterationActuelle.image_url}
                      alt={`Itération ${iterationActuelle.iteration_number}`}
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={terminerProjet}
                      className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✅ Terminer le projet
                    </button>
                    <button
                      onClick={downloadAllIterations}
                      className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      📥 Télécharger toutes
                    </button>
                  </div>
                </div>

                {/* Options d'amélioration */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Voulez-vous améliorer cette version?</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={styles.label}>Feedback d'amélioration:</label>
                        <textarea
                          className={styles.textarea}
                          value={feedbackAmelioration}
                          onChange={(e) => setFeedbackAmelioration(e.target.value)}
                          placeholder="Exemple: Rendre les angles plus arrondis, améliorer la texture, ajuster les proportions..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => genererIteration('improvement')}
                          disabled={!feedbackAmelioration.trim() || chargement}
                          className={`py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${chargement ? 'opacity-50' : ''}`}
                        >
                          {chargement ? (
                            <div className="flex items-center justify-center">
                              <LoadingSpinner size="sm" className="mr-2" />
                              Amélioration...
                            </div>
                          ) : '🔄 Améliorer avec Feedback'}
                        </button>
                        
                        <button
                          onClick={iterationSuivanteSansFeedback}
                          disabled={chargement}
                          className={`py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${chargement ? 'opacity-50' : ''}`}
                        >
                          {chargement ? 'Génération...' : '⚡ Nouvelle itération sans feedback'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Métriques DfX si disponibles */}
                  {iterationActuelle.dfx_metrics && (
                    <DfxMetricsPanel 
                      metrics={iterationActuelle.dfx_metrics} 
                      aspect={specifications.aspect}
                      score={iterationActuelle.dfx_score}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Historique des itérations avec IterationCard */}
            {iterations.length > 1 && (
              <div className={styles.card}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Historique des itérations ({iterations.length})</h3>
                  {iterations.length > 0 && (
                    <button
                      onClick={downloadAllIterations}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Télécharger toutes
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {iterations.map((iter) => (
                    <IterativeIterationCard
                      key={iter.id}
                      iteration={iter}
                      onSelect={setIterationActuelle}
                      isSelected={iterationActuelle?.id === iter.id}
                      onDelete={handleDeleteIteration}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 5: FIN DU PROJET */}
        {etape === 'fin' && iterationActuelle && (
          <div className={styles.card}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Projet Terminé avec Succès!</h2>
              <p className="text-gray-600">
                Votre design a été amélioré sur {iterations.length} itérations. Voici le rapport final DfX.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image finale */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <img
                    src={iterationActuelle.image_url}
                    alt="Design final"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex space-x-3">
                  <DownloadButton
                    href={iterationActuelle.image_url}
                    filename={`design-final-iteration-${iterationActuelle.iteration_number}.png`}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    📥 Télécharger le Design Final
                  </DownloadButton>
                  <button
                    onClick={downloadAllIterations}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    📦 Télécharger toutes ({iterations.length})
                  </button>
                </div>
                <p className="text-center text-gray-600">
                  Itération {iterationActuelle.iteration_number} - Score DfX: {(iterationActuelle.dfx_score * 100).toFixed(1)}%
                </p>
              </div>

              {/* Rapport DfX */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Rapport DfX Final</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Aspect:</span>
                      <span className="font-semibold">{specifications.aspect}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Score final:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {(iterationActuelle.dfx_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Qualification:</span>
                      <span className={`${styles.badge} ${
                        iterationActuelle.dfx_score >= 0.8 ? styles.badgeSuccess :
                        iterationActuelle.dfx_score >= 0.6 ? styles.badgeWarning :
                        styles.badgeError
                      }`}>
                        {iterationActuelle.dfx_qualifier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Métriques détaillées */}
                {iterationActuelle.dfx_metrics && Object.keys(iterationActuelle.dfx_metrics).length > 0 && (
                  <DfxMetricsPanel 
                    metrics={iterationActuelle.dfx_metrics} 
                    aspect={specifications.aspect}
                    score={iterationActuelle.dfx_score}
                  />
                )}

                {/* Actions finales */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setEtape('brief');
                      setIterations([]);
                      setIterationActuelle(null);
                      setProjetId(null);
                      setFeedbackAmelioration("");
                      setNomProjet("");
                      setPromptDesign("");
                      setFichierCroquis(null);
                    }}
                    className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    🆕 Démarrer un Nouveau Projet
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/projects')}
                    className="w-full py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    📁 Voir tous mes projets
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
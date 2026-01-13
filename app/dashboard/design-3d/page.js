'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUploader3D from '@/components/ImageUploader3D'
import ModelViewer from '@/components/ModelViewer'
import LoadingSpinner from '@/components/LoadingSpinner'

// Styles professionnels
const styles = {
  card: "border border-gray-200 rounded-xl p-6 bg-white shadow-lg mb-6 transition-all duration-300 hover:shadow-xl",
  header: "text-3xl font-bold text-gray-800 mb-2",
  subheader: "text-xl font-semibold text-gray-700 mb-4 border-l-4 border-purple-500 pl-4",
  input: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
  select: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
  button: "w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md",
  buttonSecondary: "w-full p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-all duration-200 border border-gray-300",
  label: "block text-sm font-semibold text-gray-700 mb-2 flex items-center",
  slider: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb",
  textarea: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-vertical min-h-[100px]",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
  badgeSuccess: "bg-green-100 text-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800",
  badgeError: "bg-red-100 text-red-800",
  badgeInfo: "bg-blue-100 text-blue-800",
  badgePurple: "bg-purple-100 text-purple-800"
}

export default function Transformation3DPage() {
  const router = useRouter()
  const supabase = createClient()
  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  
  // États pour la transformation 3D
  const [titreProjet, setTitreProjet] = useState("")
  const [description, setDescription] = useState("")
  const [imageSource, setImageSource] = useState(null)
  const [resultatTransformation, setResultatTransformation] = useState(null)
  
  // États pour les paramètres du modèle
  const [parametres, setParametres] = useState({
    texture_resolution: 1024,
    foreground_ratio: 0.85,
    remesh_option: 'triangle'
  })
  
  // États pour l'historique
  const [historiqueProjets, setHistoriqueProjets] = useState([])
  const [chargementHistorique, setChargementHistorique] = useState(false)
  const [ongletActif, setOngletActif] = useState('nouveau-projet')
  const [projetSelectionne, setProjetSelectionne] = useState(null)

  useEffect(() => {
    verifierUtilisateur()
  }, [])

  useEffect(() => {
    if (utilisateur) {
      chargerHistoriqueProjets()
    }
  }, [utilisateur])

  const verifierUtilisateur = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/connexion')
    } else {
      setUtilisateur(currentUser)
    }
  }

  const chargerHistoriqueProjets = async () => {
    setChargementHistorique(true)
    try {
      const { data: projets, error } = await supabase
        .from('transformation_projects')
        .select('*')
        .eq('user_id', utilisateur.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setHistoriqueProjets(projets || [])
    } catch (error) {
      console.error('Erreur chargement historique:', error)
      setMessage({ 
        type: 'error', 
        content: 'Erreur lors du chargement de l\'historique' 
      })
    } finally {
      setChargementHistorique(false)
    }
  }

  const genererModele3D = async () => {
    if (!imageSource) {
      setMessage({ type: 'error', content: 'Veuillez sélectionner une image source' })
      return
    }

    setChargement(true)
    setMessage({ type: '', content: '' })

    try {
      const formData = new FormData()
      formData.append('title', titreProjet || `Transformation 3D - ${new Date().toLocaleDateString('fr-FR')}`)
      formData.append('description', description)
      formData.append('image', imageSource)
      formData.append('texture_resolution', parametres.texture_resolution)
      formData.append('foreground_ratio', parametres.foreground_ratio)
      formData.append('remesh_option', parametres.remesh_option)

      console.log('🚀 Envoi requête génération 3D...', {
        titre: titreProjet,
        texture: parametres.texture_resolution,
        foreground: parametres.foreground_ratio,
        remesh: parametres.remesh_option
      })

      const response = await fetch('/api/generate-3d', {
        method: 'POST',
        body: formData
      })

      const resultat = await response.json()

      if (!response.ok) {
        throw new Error(resultat.error || 'Erreur lors de la génération 3D')
      }

      if (resultat.success) {
        setResultatTransformation(resultat.project)
        setMessage({ 
          type: 'success', 
          content: `Modèle 3D généré avec succès ! Téléchargement disponible.` 
        })
        
        // Rafraîchir l'historique
        chargerHistoriqueProjets()
        
        // Basculer vers l'onglet résultat
        setOngletActif('resultat')
      } else {
        throw new Error(resultat.error || 'Erreur inconnue')
      }

    } catch (erreur) {
      console.error('❌ Erreur génération 3D:', erreur)
      setMessage({ 
        type: 'error', 
        content: `Erreur lors de la génération 3D: ${erreur.message}` 
      })
    } finally {
      setChargement(false)
    }
  }

  const telechargerModele = (url, nomFichier) => {
    if (!url) return
    
    const a = document.createElement('a')
    a.href = url
    a.download = nomFichier
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copierUrl = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setMessage({ 
          type: 'success', 
          content: 'URL copiée dans le presse-papier !' 
        })
      })
      .catch(err => {
        console.error('Erreur copie:', err)
        setMessage({ 
          type: 'error', 
          content: 'Erreur lors de la copie de l\'URL' 
        })
      })
  }

  const formaterDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formaterTailleFichier = (bytes) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const selectionnerProjet = (projet) => {
    setProjetSelectionne(projet)
    setResultatTransformation(projet)
    setOngletActif('resultat')
  }

  const supprimerProjet = async (projetId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('transformation_projects')
        .delete()
        .eq('id', projetId)
        .eq('user_id', utilisateur.id)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        content: 'Projet supprimé avec succès' 
      })
      
      // Rafraîchir l'historique
      chargerHistoriqueProjets()
      
      // Si le projet supprimé était sélectionné
      if (projetSelectionne?.id === projetId) {
        setProjetSelectionne(null)
        setResultatTransformation(null)
        if (ongletActif === 'resultat') {
          setOngletActif('nouveau-projet')
        }
      }
    } catch (error) {
      console.error('Erreur suppression projet:', error)
      setMessage({ 
        type: 'error', 
        content: 'Erreur lors de la suppression du projet' 
      })
    }
  }

  const reinitialiserFormulaire = () => {
    setTitreProjet("")
    setDescription("")
    setImageSource(null)
    setParametres({
      texture_resolution: 1024,
      foreground_ratio: 0.85,
      remesh_option: 'triangle'
    })
  }

  if (!utilisateur) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Chargement de votre espace 3D...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
                  Studio de Transformation 3D
                </h1>
                <p className="text-gray-600">Transformez vos images en modèles 3D avec Stable Fast 3D</p>
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
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Transformateur d'Images en 3D
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convertissez n'importe quelle image en modèle 3D téléchargeable avec l'IA Stability Fast 3D
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          <button
            onClick={() => setOngletActif('nouveau-projet')}
            className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              ongletActif === 'nouveau-projet' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold">Nouveau Projet</span>
          </button>
          
          <button
            onClick={() => setOngletActif('historique')}
            className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              ongletActif === 'historique' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Historique</span>
          </button>
          
          {resultatTransformation && (
            <button
              onClick={() => setOngletActif('resultat')}
              className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                ongletActif === 'resultat' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span className="font-semibold">Résultat</span>
            </button>
          )}
        </div>

        {/* Messages */}
        {message.content && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : message.type === 'warning'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-green-50 border border-green-200 text-green-800'
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

        {/* Onglet Nouveau Projet */}
        {ongletActif === 'nouveau-projet' && (
          <div className="space-y-8">
            {/* Informations du projet */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>Informations du Projet</h2>
                <span className={styles.badgePurple}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Projet 3D
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={styles.label}>
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Nom du projet
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="ex: 'Modèle de chaise design'"
                      value={titreProjet}
                      onChange={(e) => setTitreProjet(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={styles.label}>
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Description (optionnel)
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Description de votre modèle 3D"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload d'image */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>Image Source</h2>
                <span className={styles.badgeInfo}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Format: PNG, JPG, JPEG
                </span>
              </div>
              
              <ImageUploader3D
                onImageUpload={setImageSource}
                disabled={chargement}
              />
            </div>

            {/* Paramètres du modèle */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>Paramètres du Modèle 3D</h2>
                <span className={styles.badgePurple}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuration avancée
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={styles.label}>
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Résolution des textures
                  </label>
                  <div className="flex space-x-4 mb-2">
                    {[512, 1024, 2048].map(res => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setParametres(prev => ({ ...prev, texture_resolution: res }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          parametres.texture_resolution === res
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {res}px
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Définit la qualité des textures du modèle 3D. Plus la résolution est élevée, plus le fichier sera détaillé (mais plus lourd).
                  </p>
                </div>

                <div>
                  <label className={styles.label}>
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Ratio avant-plan: {parametres.foreground_ratio}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={parametres.foreground_ratio}
                    onChange={(e) => setParametres(prev => ({ 
                      ...prev, 
                      foreground_ratio: parseFloat(e.target.value) 
                    }))}
                    className={styles.slider}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Objet petit (0.1)</span>
                    <span>Objet moyen (0.5)</span>
                    <span>Objet large (1.0)</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Contrôle la proportion de l'image considérée comme objet principal. Ajustez selon la taille de l'objet dans l'image.
                  </p>
                </div>

                <div>
                  <label className={styles.label}>
                    <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Type de maillage
                  </label>
                  <div className="flex space-x-4 mb-2">
                    {[
                      { value: 'none', label: 'Aucun', desc: 'Conserve le maillage original' },
                      { value: 'triangle', label: 'Triangles', desc: 'Maillage standard' },
                      { value: 'quad', label: 'Quadrilatères', desc: 'Maillage optimisé' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setParametres(prev => ({ ...prev, remesh_option: option.value }))}
                        className={`px-4 py-3 rounded-lg transition-colors text-left flex-1 ${
                          parametres.remesh_option === option.value
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-80">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Détermine la structure du maillage 3D. Les quadrilatères sont recommandés pour l'animation.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de génération */}
            <button
              onClick={genererModele3D}
              disabled={chargement || !imageSource}
              className={`${styles.button} ${chargement ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {chargement ? (
                <div className="flex items-center justify-center space-x-3">
                  <LoadingSpinner size="md" />
                  <span>Génération du modèle 3D en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  <span className="text-lg">✨ Générer le Modèle 3D</span>
                </div>
              )}
            </button>

            {/* Informations importantes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Informations importantes</h3>
                  <ul className="text-yellow-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">⏱️</span>
                      <span>Temps de génération: 1-3 minutes selon la complexité</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">💾</span>
                      <span>Format de sortie: GLB (compatible Blender, Unity, Unreal Engine, Three.js)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📐</span>
                      <span>Images recommandées: Carré 1024×1024px, objet bien défini, fond contrasté</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">⚡</span>
                      <span>Technologie: Stable Fast 3D de Stability AI</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Historique */}
        {ongletActif === 'historique' && (
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={styles.subheader}>Historique des Transformations 3D</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={chargerHistoriqueProjets}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Rafraîchir"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                  {historiqueProjets.length} projet{historiqueProjets.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {chargementHistorique ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : historiqueProjets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun projet 3D</h3>
                <p className="text-gray-500 mb-6">Commencez par créer votre premier projet de transformation 3D</p>
                <button
                  onClick={() => setOngletActif('nouveau-projet')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors"
                >
                  Créer un nouveau projet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {historiqueProjets.map(projet => (
                  <div 
                    key={projet.id} 
                    className={`border rounded-lg p-4 transition-all duration-300 hover:border-purple-300 hover:shadow-md ${
                      projetSelectionne?.id === projet.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            projet.status === 'completed' ? 'bg-green-100 text-green-600' :
                            projet.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                            projet.status === 'failed' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {projet.status === 'completed' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : projet.status === 'processing' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : projet.status === 'failed' ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{projet.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{formaterDate(projet.created_at)}</span>
                            <span>•</span>
                            <span>Texture: {projet.texture_resolution}px</span>
                            {projet.file_size && (
                              <>
                                <span>•</span>
                                <span>{formaterTailleFichier(projet.file_size)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          projet.status === 'completed' ? 'bg-green-100 text-green-800' :
                          projet.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          projet.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {projet.status === 'completed' ? 'Terminé' :
                           projet.status === 'processing' ? 'En cours' :
                           projet.status === 'failed' ? 'Échec' : 'En attente'}
                        </span>
                        
                        <div className="flex space-x-1">
                          {projet.status === 'completed' && projet.output_glb_url && (
                            <button
                              onClick={() => telechargerModele(
                                projet.output_glb_url,
                                `${projet.title.replace(/\s+/g, '_').toLowerCase()}.glb`
                              )}
                              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          )}
                          
                          <button
                            onClick={() => selectionnerProjet(projet)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => supprimerProjet(projet.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {projet.description && (
                      <p className="mt-3 text-gray-600 text-sm">{projet.description}</p>
                    )}
                    
                    {projet.thumbnail_url && (
                      <div className="mt-4 flex items-center space-x-4">
                        <img 
                          src={projet.thumbnail_url} 
                          alt="Thumbnail" 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 flex-1">
                          <div>
                            <span className="font-medium">Maillage:</span> {projet.remesh_option || 'triangle'}
                          </div>
                          <div>
                            <span className="font-medium">Ratio:</span> {projet.foreground_ratio || 0.85}
                          </div>
                          {projet.processing_time && (
                            <div>
                              <span className="font-medium">Temps:</span> {projet.processing_time}s
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Format:</span> GLB
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Résultat */}
        {ongletActif === 'resultat' && resultatTransformation && (
          <div className="space-y-8">
            {/* En-tête du résultat */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={styles.subheader}>{resultatTransformation.title}</h2>
                  {resultatTransformation.description && (
                    <p className="text-gray-600 mt-1">{resultatTransformation.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Transformation réussie
                  </span>
                  <button
                    onClick={() => setOngletActif('nouveau-projet')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Nouveau projet
                  </button>
                </div>
              </div>
            </div>

            {/* Visualiseur 3D */}
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={styles.subheader}>Visualisation du Modèle 3D</h2>
                <span className={styles.badgePurple}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  Modèle GLB
                </span>
              </div>
              
              <ModelViewer
                glbUrl={resultatTransformation.output_glb_url}
                thumbnailUrl={resultatTransformation.thumbnail_url}
                fileName={`${resultatTransformation.title.replace(/\s+/g, '_').toLowerCase()}_${new Date(resultatTransformation.created_at).getTime()}.glb`}
              />
            </div>

            {/* Informations techniques */}
            <div className={styles.card}>
              <h2 className={styles.subheader}>Informations Techniques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Image Source</h4>
                  </div>
                  {resultatTransformation.input_image_url && (
                    <div className="space-y-3">
                      <a 
                        href={resultatTransformation.input_image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={resultatTransformation.input_image_url} 
                          alt="Image source" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </a>
                      <button
                        onClick={() => telechargerModele(
                          resultatTransformation.input_image_url,
                          'image_source.jpg'
                        )}
                        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Télécharger l'image source</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Détails du Modèle</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">GLB (Binary glTF)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taille:</span>
                      <span className="font-medium">
                        {resultatTransformation.file_size 
                          ? formaterTailleFichier(resultatTransformation.file_size)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Textures:</span>
                      <span className="font-medium">{resultatTransformation.texture_resolution}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maillage:</span>
                      <span className="font-medium">{resultatTransformation.remesh_option || 'triangle'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Performance</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date de génération:</span>
                      <span className="font-medium">{formaterDate(resultatTransformation.created_at)}</span>
                    </div>
                    {resultatTransformation.processing_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temps de traitement:</span>
                        <span className="font-medium">{resultatTransformation.processing_time} secondes</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className="font-medium text-green-600">Terminé</span>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => copierUrl(resultatTransformation.output_glb_url)}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copier l'URL du modèle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compatibilité et utilisation */}
            <div className={styles.card}>
              <h2 className={styles.subheader}>Compatibilité et Utilisation</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">🎮 Logiciels compatibles</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Blender (gratuit)</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Unity</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Unreal Engine</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Three.js (WebGL)</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Maya, 3ds Max, Cinema 4D</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">📚 Comment l'utiliser</h4>
                    <ol className="space-y-2 list-decimal list-inside text-gray-600">
                      <li>Téléchargez le fichier .glb</li>
                      <li>Importez-le dans votre logiciel 3D préféré</li>
                      <li>Modifiez, texturez ou animez selon vos besoins</li>
                      <li>Exportez dans le format de votre choix</li>
                      <li>Utilisez dans vos projets, jeux ou applications</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">⚡ Conseils d'optimisation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-purple-600 font-medium mb-1">Redimensionnement</div>
                      <p className="text-sm text-gray-600">Utilisez Blender pour optimiser la géométrie si nécessaire</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-purple-600 font-medium mb-1">Textures</div>
                      <p className="text-sm text-gray-600">Réduisez la résolution des textures pour les applications web</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-purple-600 font-medium mb-1">Export</div>
                      <p className="text-sm text-gray-600">Exportez en FBX ou OBJ pour une compatibilité maximale</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setOngletActif('nouveau-projet')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors shadow-md"
              >
                Créer un nouveau projet
              </button>
              
              <button
                onClick={() => setOngletActif('historique')}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
              >
                Voir l'historique
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
// app/dashboard/settings/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const [activeTab, setActiveTab] = useState('design')

  // États pour les paramètres
  const [settings, setSettings] = useState({
    // Préférences Design
    defaultModel: 'Stable Diffusion 3 Medium (Diffusers)',
    autoSave: true,
    saveInterval: 5,
    imageQuality: 'high',
    defaultAspect: 'DFM',
    
    // Confidentialité
    profileVisibility: 'public',
    projectVisibility: 'private',
    
    // Compte
    accountDeletion: false
  })

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        await checkUser()
      } catch (error) {
        console.error('Erreur initialisation paramètres:', error)
        setMessage({
          type: 'error',
          content: 'Erreur lors du chargement des paramètres'
        })
        setLoading(false)
      }
    }

    initializeSettings()
  }, [])

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadUserSettings(currentUser.id)
  }

  const loadUserSettings = async (userId) => {
    try {
      // Charger les préférences depuis la base de données
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement préférences:', error)
      }

      if (preferences?.preferences) {
        const loadedSettings = {
          // Préférences Design
          defaultModel: preferences.preferences.design?.defaultModel || 'Stable Diffusion 3 Medium (Diffusers)',
          autoSave: preferences.preferences.design?.autoSave ?? true,
          saveInterval: preferences.preferences.design?.saveInterval || 5,
          imageQuality: preferences.preferences.design?.imageQuality || 'high',
          defaultAspect: preferences.preferences.design?.defaultAspect || 'DFM',
          
          // Confidentialité
          profileVisibility: preferences.preferences.privacy?.profileVisibility || 'public',
          projectVisibility: preferences.preferences.privacy?.projectVisibility || 'private',
          
          // Compte
          accountDeletion: false
        }

        setSettings(loadedSettings)
      }

      // Charger les informations utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userData) {
        setUser(prev => ({ ...prev, ...userData }))
        
        if (userData.is_profile_public !== undefined) {
          setSettings(prev => ({
            ...prev,
            profileVisibility: userData.is_profile_public ? 'public' : 'private'
          }))
        }
      }

    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    if (!user) return

    setSaving(true)
    setMessage({ type: '', content: '' })

    try {
      // Structurer les préférences
      const preferencesData = {
        design: {
          defaultModel: settings.defaultModel,
          autoSave: settings.autoSave,
          saveInterval: settings.saveInterval,
          imageQuality: settings.imageQuality,
          defaultAspect: settings.defaultAspect
        },
        privacy: {
          profileVisibility: settings.profileVisibility,
          projectVisibility: settings.projectVisibility
        }
      }

      // Vérifier si une entrée existe déjà
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let error

      if (existingPrefs) {
        // Mettre à jour l'entrée existante
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({
            preferences: preferencesData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        error = updateError
      } else {
        // Créer une nouvelle entrée
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            preferences: preferencesData
          })

        error = insertError
      }

      if (error) throw error

      // Mettre à jour la visibilité du profil
      const isProfilePublic = settings.profileVisibility === 'public'
      if (isProfilePublic !== user.is_profile_public) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            is_profile_public: isProfilePublic,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Erreur mise à jour profil:', profileError)
        }
      }

      setMessage({
        type: 'success',
        content: 'Paramètres sauvegardés avec succès!'
      })

      // Recharger la page pour appliquer les changements
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error)
      
      let errorMessage = 'Erreur lors de la sauvegarde des paramètres'
      if (error.code === '23505') {
        errorMessage = 'Erreur de duplication - veuillez réessayer'
      } else if (error.message) {
        errorMessage += ': ' + error.message
      }
      
      setMessage({
        type: 'error',
        content: errorMessage
      })
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      // Recharger les paramètres par défaut
      setSettings({
        defaultModel: 'Stable Diffusion 3 Medium (Diffusers)',
        autoSave: true,
        saveInterval: 5,
        imageQuality: 'high',
        defaultAspect: 'DFM',
        profileVisibility: 'public',
        projectVisibility: 'private',
        accountDeletion: false
      })

      setMessage({
        type: 'success',
        content: 'Paramètres réinitialisés aux valeurs par défaut'
      })

    } catch (error) {
      console.error('Erreur réinitialisation:', error)
      setMessage({
        type: 'error',
        content: 'Erreur lors de la réinitialisation'
      })
    }
  }

  const exportData = async () => {
    try {
      // Récupérer toutes les données utilisateur
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: projects } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', user.id)

      const { data: iterations } = await supabase
        .from('design_iterations')
        .select('*')
        .in('project_id', projects?.map(p => p.id) || [])

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const data = {
        user: userData,
        settings: preferences?.preferences || settings,
        projects: projects,
        iterations: iterations,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ideate-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setMessage({
        type: 'success',
        content: 'Données exportées avec succès!'
      })
    } catch (error) {
      console.error('Erreur export données:', error)
      setMessage({
        type: 'error',
        content: 'Erreur lors de l\'export des données'
      })
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Êtes-vous ABSOLUMENT SÛR de vouloir supprimer votre compte ? Cette action est IRREVERSIBLE et supprimera toutes vos données.')) {
      return
    }

    if (!confirm('CONFIRMATION FINALE : Cette action ne peut pas être annulée. Tous vos projets, itérations et données personnelles seront définitivement supprimés.')) {
      return
    }

    try {
      // Supprimer toutes les données associées
      const { data: projects } = await supabase
        .from('design_projects')
        .select('id')
        .eq('user_id', user.id)

      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id)
        
        // Supprimer les itérations
        await supabase
          .from('design_iterations')
          .delete()
          .in('project_id', projectIds)

        // Supprimer les projets
        await supabase
          .from('design_projects')
          .delete()
          .eq('user_id', user.id)
      }

      // Supprimer les préférences
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)

      // Supprimer l'utilisateur
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      // Supprimer le compte d'authentification
      await supabase.auth.signOut()

      // Redirection
      router.push('/')
      
    } catch (error) {
      console.error('Erreur suppression compte:', error)
      setMessage({
        type: 'error',
        content: 'Erreur lors de la suppression du compte: ' + error.message
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <DashboardHeader user={user} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                Paramètres
              </h1>
              <p className="mt-2 text-gray-600">
                Personnalisez votre expérience Ideate selon vos préférences
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <button
                onClick={resetSettings}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm"
              >
                Réinitialiser
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {message.content && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'error' 
              ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 shadow-sm' 
              : message.type === 'warning'
              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 text-yellow-800 shadow-sm'
              : message.type === 'info'
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 shadow-sm'
              : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 shadow-sm'
          }`}>
            <div className="flex items-center">
              {message.type === 'error' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.type === 'warning' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {message.type === 'info' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.type === 'success' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message.content}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation latérale - Design amélioré */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {[
                    { id: 'design', label: 'Préférences Design', icon: '🎨' },
                    { id: 'privacy', label: 'Confidentialité', icon: '🔒' },
                    { id: 'account', label: 'Compte', icon: '👤' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Actions rapides - Design amélioré */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={exportData}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Exporter mes données</span>
                  </button>
                  <Link
                    href="/dashboard/help"
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Aide et support</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu des paramètres */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {activeTab === 'design' && (
                <div className="p-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🎨</span>
                      Préférences Design
                    </h2>
                    <p className="text-gray-600 mt-2">Configurez vos paramètres de génération et de visualisation</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Section Modèles */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Modèles de Génération</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modèle par défaut
                          </label>
                          <select
                            value={settings.defaultModel}
                            onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                          >
                            <option value="Stable Diffusion 3 Medium (Diffusers)">Stable Diffusion 3 Medium</option>
                            <option value="Stable Diffusion 3.5 Large">Stable Diffusion 3.5 Large</option>
                            <option value="Stable Diffusion 3.5 Large Turbo">Stable Diffusion 3.5 Large Turbo</option>
                            <option value="FLUX.1 Schnell">FLUX.1 Schnell</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">
                            Sélectionnez le modèle IA utilisé par défaut pour vos générations
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aspect DfX par défaut
                          </label>
                          <select
                            value={settings.defaultAspect}
                            onChange={(e) => handleSettingChange('defaultAspect', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                          >
                            <option value="DFA">DFA (Assembly)</option>
                            <option value="DFM">DFM (Manufacturing)</option>
                            <option value="DFS">DFS (Service)</option>
                            <option value="DFSust">DFSust (Sustainability)</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">
                            Aspect Design for Excellence utilisé pour l'analyse
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qualité d'image
                          </label>
                          <select
                            value={settings.imageQuality}
                            onChange={(e) => handleSettingChange('imageQuality', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                          >
                            <option value="low">Rapide (512x512)</option>
                            <option value="medium">Équilibré (768x768)</option>
                            <option value="high">Haute qualité (1024x1024)</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-2">
                            Qualité de rendu des images générées
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section Sauvegarde */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde Automatique</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Sauvegarde automatique</p>
                            <p className="text-sm text-gray-600">Sauvegarde automatique des projets en cours</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.autoSave}
                              onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
                          </label>
                        </div>

                        {settings.autoSave && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Intervalle de sauvegarde : {settings.saveInterval} minute{settings.saveInterval > 1 ? 's' : ''}
                            </label>
                            <div className="space-y-3">
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={settings.saveInterval}
                                onChange={(e) => handleSettingChange('saveInterval', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                              />
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>1 min</span>
                                <span className="font-medium text-blue-600">{settings.saveInterval} min</span>
                                <span>10 min</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="p-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">🔒</span>
                      Confidentialité
                    </h2>
                    <p className="text-gray-600 mt-2">Gérez la visibilité de votre profil et de vos projets</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Visibilité du profil */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibilité du Profil</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statut de votre profil
                          </label>
                          <select
                            value={settings.profileVisibility}
                            onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                          >
                            <option value="public">Public</option>
                            <option value="private">Privé</option>
                            <option value="designers">Designers uniquement</option>
                          </select>
                          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {settings.profileVisibility === 'public' 
                                ? '🌐 Votre profil est visible par tous les visiteurs'
                                : settings.profileVisibility === 'private'
                                ? '🔒 Seul vous pouvez voir votre profil'
                                : '👥 Votre profil est visible uniquement par les autres designers'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visibilité des projets */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibilité des Projets</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibilité par défaut des projets
                          </label>
                          <select
                            value={settings.projectVisibility}
                            onChange={(e) => handleSettingChange('projectVisibility', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                          >
                            <option value="public">Public</option>
                            <option value="private">Privé</option>
                            <option value="unlisted">Non listé</option>
                          </select>
                          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {settings.projectVisibility === 'public' 
                                ? '🌐 Tous vos projets sont publics par défaut'
                                : settings.projectVisibility === 'private'
                                ? '🔒 Tous vos projets sont privés par défaut'
                                : '📄 Tous vos projets sont non listés par défaut'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="p-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="mr-3">👤</span>
                      Compte
                    </h2>
                    <p className="text-gray-600 mt-2">Gérez vos informations de compte et données</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Informations du compte */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du Compte</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-500">Adresse email</p>
                            <p className="text-gray-900 font-semibold">{user?.email}</p>
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                            <p className="text-gray-900 font-semibold">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-500">Dernière connexion</p>
                            <p className="text-gray-900 font-semibold">
                              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-500">Statut</p>
                            <p className="text-green-900 font-semibold flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Actif
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            href="/dashboard/profile"
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] shadow-sm"
                          >
                            Modifier le profil
                          </Link>
                          <button 
                            onClick={() => router.push('/dashboard/cha')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            Changer le mot de passe
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions dangereuses */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Zone Dangereuse
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                          <div className="flex-1">
                            <p className="font-medium text-red-900">Supprimer le compte</p>
                            <p className="text-sm text-red-700">
                              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                            </p>
                          </div>
                          <button
                            onClick={deleteAccount}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-[1.02] shadow-sm"
                          >
                            Supprimer le compte
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
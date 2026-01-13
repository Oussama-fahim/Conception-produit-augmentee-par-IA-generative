// app/designers/[id]/projects/[projectId]/page.js - VERSION COMPLÈTE ET AMÉLIORÉE
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DfxScoreDisplay from '@/components/DfxScoreDisplay'
import DfxMetricsPanel from '@/components/DfxMetricsPanel'

export default async function PublicProjectPage({ params }) {
  const supabase = await createClient()
  const { id, projectId } = await params

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Récupérer le projet avec TOUTES les informations
  const { data: project, error: projectError } = await supabase
    .from('design_projects')
    .select(`
      *,
      users!inner (
        id,
        full_name,
        avatar_url,
        bio,
        location,
        role,
        github_url,
        linkedin_url,
        website_url,
        is_profile_public
      )
    `)
    .eq('id', projectId)
    .eq('user_id', id)
    .eq('is_project_public', true)
    .single()

  if (!project || projectError) {
    console.log('Projet non trouvé ou erreur:', projectError)
    notFound()
  }

  // Récupérer toutes les données associées au projet
  const [
    { data: iterations },
    { data: refinements },
    { data: refinementHistory },
    { data: sketchData }
  ] = await Promise.all([
    supabase
      .from('design_iterations')
      .select('*')
      .eq('project_id', projectId)
      .order('iteration_number', { ascending: true }),
    
    supabase
      .from('design_refinements')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('dfx_refinement_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('design_projects')
      .select('sketch_data, sketch_url, sketch_metadata')
      .eq('id', projectId)
      .single()
  ])

  const designer = project.users
  const isIterativeProject = project.type === 'iterative'
  const hasSketch = sketchData?.sketch_url || sketchData?.sketch_data

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Brouillon', bg: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'En cours', bg: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Terminé', bg: 'bg-green-100 text-green-800' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg}`}>
        {config.label}
      </span>
    )
  }

  const getProjectTypeIcon = (type) => {
    const icons = {
      'standard': { icon: '⚡', label: 'Design Rapide', color: 'bg-blue-100 text-blue-800' },
      'iterative': { icon: '🔄', label: 'Design Itératif', color: 'bg-purple-100 text-purple-800' },
      '3d': { icon: '🎨', label: 'Design 3D', color: 'bg-orange-100 text-orange-800' }
    }
    const config = icons[type] || icons.standard
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span className="mr-1.5">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getGenerationModeBadge = (mode) => {
    const modes = {
      'text-to-image': { label: 'Texte → Image', color: 'bg-blue-100 text-blue-800', icon: '📝' },
      'sketch-to-image': { label: 'Croquis → Image', color: 'bg-yellow-100 text-yellow-800', icon: '🎨' },
      'refinement': { label: 'Raffinement', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
      '3d-generation': { label: 'Génération 3D', color: 'bg-orange-100 text-orange-800', icon: '🎨' }
    }
    const config = modes[mode] || modes['text-to-image']
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header Élégant avec Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              {/* Navigation Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                <Link 
                  href="/designers"
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Designers
                </Link>
                <span className="text-gray-300">/</span>
                <Link 
                  href={`/designers/${designer.id}`}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {designer.full_name}
                </Link>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-900 truncate max-w-xs">
                  {project.project_name}
                </span>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link 
                href={`/designers/${designer.id}`}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour au portfolio</span>
              </Link>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Mon espace
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bannière Héro avec Statistiques */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl mb-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="mb-6 lg:mb-0 lg:max-w-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{project.project_name}</h1>
                  {getProjectTypeIcon(project.type)}
                </div>
                <p className="text-blue-100 text-lg mb-6">{project.description}</p>
                
                {/* Tags et Métadonnées */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    {project.category}
                  </span>
                  {getStatusBadge(project.status)}
                  {project.design_focus && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white">
                      {project.design_focus}
                    </span>
                  )}
                  {project.dfx_best_score && (
                    <DfxScoreDisplay 
                      score={project.dfx_best_score}
                      size="sm"
                      showLabel={true}
                      className="bg-white/20 backdrop-blur-sm border border-white/30"
                    />
                  )}
                </div>
              </div>
              
              {/* Statistiques en Bannière */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/30">
                    <span className="text-2xl font-bold text-white">{iterations?.length || 0}</span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">Itérations</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/30">
                    <span className="text-2xl font-bold text-white">{refinements?.length || 0}</span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">Raffinements</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/30">
                    <span className="text-2xl font-bold text-white">
                      {iterations?.filter(i => i.dfx_score).length || 0}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">Scores DfX</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 border border-white/30">
                    <span className="text-2xl font-bold text-white">
                      {hasSketch ? '✓' : '—'}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium">Croquis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne Principale - Contenu Détaillé */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1 : Informations Générales et Prompt */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informations du Projet
                </h2>
                <div className="text-sm text-gray-500">
                  Créé le {formatDate(project.created_at)}
                </div>
              </div>

              <div className="space-y-6">
                {/* Prompt Principal */}
                {project.prompt && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Principal</label>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                      <p className="text-gray-800 leading-relaxed">{project.prompt}</p>
                    </div>
                  </div>
                )}

                {/* Grille de Spécifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Focus Design</p>
                    <p className="text-gray-900 font-semibold">{project.design_focus || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Style Design</p>
                    <p className="text-gray-900 font-semibold">{project.design_style || 'Non spécifié'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Aspect DfX</p>
                    <p className="text-gray-900 font-semibold">{project.aspect || 'DFM'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-500 mb-1">Type de projet</p>
                    <p className="text-gray-900 font-semibold capitalize">{project.type}</p>
                  </div>
                </div>

                {/* Description Complète */}
                {project.description && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description Détaillée</label>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {project.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 : Métriques DfX Globales */}
            {project.last_dfx_metrics && Object.keys(project.last_dfx_metrics).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Analyse DfX Globale
                  </h2>
                  {project.dfx_best_score && (
                    <DfxScoreDisplay 
                      score={project.dfx_best_score}
                      size="md"
                      showLabel={true}
                    />
                  )}
                </div>
                <DfxMetricsPanel 
                  metrics={project.last_dfx_metrics}
                  aspect={project.aspect}
                  score={project.dfx_best_score}
                  compact={false}
                />
              </div>
            )}

            {/* Section 3 : Itérations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Itérations ({iterations?.length || 0})
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {iterations?.filter(i => i.dfx_score).length || 0} avec score DfX
                    </span>
                    {isIterativeProject && (
                      <span className="text-sm text-purple-600 font-medium">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Mode Itératif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {iterations && iterations.length > 0 ? (
                  iterations.map((iteration, index) => (
                    <div key={iteration.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="mb-4">
                        {/* En-tête de l'itération */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {iteration.iteration_number}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Itération {iteration.iteration_number}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">
                                  {formatDate(iteration.created_at)}
                                </span>
                                {iteration.generation_mode && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    {getGenerationModeBadge(iteration.generation_mode)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {iteration.dfx_score !== null && iteration.dfx_score !== undefined && (
                              <DfxScoreDisplay score={iteration.dfx_score} compact={true} />
                            )}
                            {iteration.model_used && (
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {iteration.model_used}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contenu de l'itération */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Image */}
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Image Générée</label>
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 aspect-square">
                              {iteration.image_url ? (
                                <img
                                  src={iteration.image_url}
                                  alt={`Itération ${iteration.iteration_number}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Détails */}
                          <div className="space-y-4">
                            {/* Prompt */}
                            {iteration.prompt && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt</label>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                  {iteration.prompt}
                                </p>
                              </div>
                            )}

                            {/* Feedback */}
                            {iteration.feedback_text && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                                <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                                  {iteration.feedback_text}
                                </p>
                              </div>
                            )}

                            {/* Paramètres Techniques */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Paramètres</label>
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

                            {/* Métriques DfX de l'itération */}
                            {iteration.dfx_metrics && Object.keys(iteration.dfx_metrics).length > 0 && (
                              <div className="pt-4 border-t border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Analyse DfX</label>
                                <DfxMetricsPanel 
                                  metrics={iteration.dfx_metrics}
                                  aspect={iteration.dfx_aspect || project.aspect}
                                  score={iteration.dfx_score}
                                  compact={true}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune itération générée</h3>
                    <p className="text-gray-500">Ce projet ne contient pas encore d'itérations.</p>
                  </div>
                )}
              </div>

              {/* Statistiques des Itérations */}
              {iterations && iterations.length > 1 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h4 className="font-semibold text-gray-700 mb-4">📊 Statistiques des Itérations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-gray-800">{iterations.length}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.max(...iterations.filter(i => i.dfx_score).map(i => i.dfx_score * 100), 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Meilleur score</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-blue-600">
                        {iterations.filter(i => i.generation_mode === 'sketch-to-image').length}
                      </p>
                      <p className="text-sm text-gray-600">Avec croquis</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-purple-600">
                        {iterations.filter(i => i.generation_mode === 'refinement').length}
                      </p>
                      <p className="text-sm text-gray-600">Raffinements</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4 : Croquis (si disponible) */}
            {hasSketch && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Croquis Original
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Aperçu du croquis */}
                  <div>
                    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 aspect-square">
                      {sketchData.sketch_url ? (
                        <img
                          src={sketchData.sketch_url}
                          alt="Croquis du projet"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <p className="text-sm text-gray-500">Croquis disponible</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Métadonnées du croquis */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Métadonnées du Croquis</label>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {sketchData.sketch_metadata && Object.keys(sketchData.sketch_metadata).length > 0 ? (
                          <div className="space-y-2 text-sm">
                            {sketchData.sketch_metadata.filename && (
                              <p><span className="font-medium">Fichier:</span> {sketchData.sketch_metadata.filename}</p>
                            )}
                            {sketchData.sketch_metadata.size && (
                              <p><span className="font-medium">Taille:</span> {sketchData.sketch_metadata.size}</p>
                            )}
                            {sketchData.sketch_metadata.type && (
                              <p><span className="font-medium">Type:</span> {sketchData.sketch_metadata.type}</p>
                            )}
                            {sketchData.sketch_metadata.created_at && (
                              <p><span className="font-medium">Date de création:</span> {formatDate(sketchData.sketch_metadata.created_at)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucune métadonnée disponible</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Information</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Ce croquis a été utilisé comme référence pour les générations d'images. 
                            Il guide la structure et la composition des designs générés.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5 : Raffinements */}
            {refinements && refinements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Raffinements ({refinements.length})
                </h2>
                <div className="space-y-4">
                  {refinements.map((refinement) => (
                    <div key={refinement.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-purple-700 mb-1">Original</p>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">{refinement.original_prompt}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700 mb-1">Raffiné</p>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">{refinement.refined_prompt}</p>
                        </div>
                        {refinement.improvement_suggestions && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-purple-700 mb-1">Suggestions d'amélioration</p>
                            <p className="text-sm text-gray-700">{refinement.improvement_suggestions}</p>
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {formatDate(refinement.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6 : Historique DfX */}
            {refinementHistory && refinementHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Historique DfX ({refinementHistory.length})
                </h2>
                <div className="space-y-4">
                  {refinementHistory.map((history) => (
                    <div key={history.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Amélioration</p>
                          <p className="text-lg font-bold text-green-600">
                            +{history.improvement_percentage || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Score initial</p>
                          <p className="text-sm text-gray-600">{((history.original_score || 0) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Score final</p>
                          <p className="text-sm text-gray-600">{((history.refined_score || 0) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Date</p>
                          <p className="text-sm text-gray-600">{formatDate(history.created_at)}</p>
                        </div>
                      </div>
                      {history.recommendations_applied && Array.isArray(history.recommendations_applied) && history.recommendations_applied.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Recommandations appliquées:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                            {history.recommendations_applied.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne Latérale - Informations Secondaires */}
          <div className="space-y-6">
            {/* Carte du Designer */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h3 className="text-lg font-semibold text-white">👤 Designer</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                    {designer.avatar_url ? (
                      <Image
                        src={designer.avatar_url}
                        alt={designer.full_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      designer.full_name?.charAt(0)?.toUpperCase() || 'D'
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{designer.full_name}</p>
                    <p className="text-gray-600 capitalize">{designer.role || 'designer'}</p>
                    {designer.location && (
                      <p className="text-gray-500 text-sm flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {designer.location}
                      </p>
                    )}
                  </div>
                </div>

                {designer.bio && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 italic text-center">"{designer.bio}"</p>
                  </div>
                )}

                {/* Liens Sociaux */}
                <div className="flex justify-center space-x-3 mb-4">
                  {designer.github_url && (
                    <a href={designer.github_url} target="_blank" rel="noopener noreferrer" 
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {designer.linkedin_url && (
                    <a href={designer.linkedin_url} target="_blank" rel="noopener noreferrer" 
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {designer.website_url && (
                    <a href={designer.website_url} target="_blank" rel="noopener noreferrer" 
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:scale-110">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </a>
                  )}
                </div>

                <Link 
                  href={`/designers/${designer.id}`}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-colors text-center block font-medium shadow-md hover:shadow-lg"
                >
                  Voir le portfolio complet
                </Link>
              </div>
            </div>

            {/* Détails du Projet */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Détails du Projet</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom du projet</p>
                  <p className="text-gray-900 font-medium text-lg">{project.project_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Catégorie</p>
                    <p className="text-gray-900 font-semibold capitalize">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Focus design</p>
                    <p className="text-gray-900 font-semibold">{project.design_focus || '—'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Style</p>
                    <p className="text-gray-900 font-semibold">{project.design_style || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aspect DfX</p>
                    <p className="text-gray-900 font-semibold">{project.aspect || 'DFM'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Type de projet</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getProjectTypeIcon(project.type)}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <div className="mt-1">
                    {getStatusBadge(project.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-gray-500">Créé le</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(project.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {project.updated_at && project.updated_at !== project.created_at && (
                    <div>
                      <p className="text-gray-500">Modifié le</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Itérations</span>
                  <span className="font-bold text-gray-900">{iterations?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Dernière itération</span>
                  <span className="font-bold text-gray-900">
                    {iterations && iterations.length > 0 ? 
                      `#${iterations[iterations.length - 1].iteration_number}` : 'Aucune'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Améliorations</span>
                  <span className="font-bold text-gray-900">
                    {iterations?.filter(i => i.feedback_text).length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Visibilité</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Public
                  </span>
                </div>
              </div>
            </div>

            {/* Score DfX Global */}
            {project.dfx_best_score && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🏆 Score DfX Global</h3>
                <div className="text-center">
                  <DfxScoreDisplay 
                    score={project.dfx_best_score}
                    size="xl"
                    showLabel={true}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Score basé sur {iterations?.filter(i => i.dfx_score).length || 0} analyse(s) DfX
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-lg font-bold text-gray-900">Ideate Studio</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Plateforme collaborative de design industriel
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/designers" className="text-sm text-gray-600 hover:text-blue-600">
                Galerie des designers
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                Tableau de bord
              </Link>
              <Link href={`/designers/${designer.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ← Retour au portfolio
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
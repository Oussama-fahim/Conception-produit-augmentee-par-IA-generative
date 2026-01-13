// app/designers/[id]/page.js - VERSION CORRIGÉE SANS ERREURS
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DfxScoreDisplay from '@/components/DfxScoreDisplay'

export default async function DesignerProfilePage({ params }) {
  const supabase = await createClient()
  const { id } = params // Pas besoin de await sur params

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Récupérer le designer
  const { data: designer } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('is_profile_public', true)
    .single()

  if (!designer) {
    notFound()
  }

  // Récupérer les projets publics du designer
  const { data: publicProjects } = await supabase
    .from('design_projects')
    .select('*')
    .eq('user_id', id)
    .eq('is_project_public', true)
    .order('created_at', { ascending: false })

  console.log('Projets publics pour designer', id, ':', publicProjects?.length, 'projets')

  // Récupérer toutes les itérations pour ces projets
  const projectIds = publicProjects?.map(p => p.id) || []
  let allIterations = []
  
  if (projectIds.length > 0) {
    const { data: iterations } = await supabase
      .from('design_iterations')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: true })
    
    allIterations = iterations || []
  }

  console.log('Itérations trouvées:', allIterations.length)

  // Enrichir les projets avec les itérations
  const enrichedProjects = (publicProjects || []).map(project => {
    const projectIterations = allIterations.filter(iter => iter.project_id === project.id)
    const latestIteration = projectIterations.length > 0 
      ? projectIterations.reduce((latest, current) => 
          new Date(current.created_at) > new Date(latest.created_at) ? current : latest
        )
      : null
    
    // Calculer le meilleur score DfX
    const bestDfxScore = projectIterations.reduce((max, iter) => {
      const score = iter.dfx_score || 0
      return score > max ? score : max
    }, 0)
    
    return {
      ...project,
      iterations: projectIterations,
      latestIteration,
      iterationCount: projectIterations.length,
      bestDfxScore
    }
  })

  console.log('Projets enrichis:', enrichedProjects.length)

  // Statistiques
  const totalIterations = enrichedProjects.reduce((sum, p) => sum + p.iterationCount, 0)
  const uniqueCategories = new Set(enrichedProjects.map(p => p.category)).size
  const totalDfxScore = enrichedProjects.reduce((sum, p) => sum + (p.bestDfxScore || 0), 0)
  const avgDfxScore = enrichedProjects.length > 0 
    ? (totalDfxScore / enrichedProjects.length) 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header avec navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link 
                href="/designers"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Tableau de bord
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {enrichedProjects.length} projets publics
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section profil élégante */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl mb-12">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 overflow-hidden">
                    {designer.avatar_url ? (
                      <Image
                        src={designer.avatar_url}
                        alt={designer.full_name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {designer.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2 border-4 border-white shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{designer.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30">
                      {designer.role || 'Designer Industriel'}
                    </span>
                    {designer.location && (
                      <span className="inline-flex items-center text-white/90 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {designer.location}
                      </span>
                    )}
                  </div>
                  {designer.bio && (
                    <p className="text-white/80 max-w-2xl leading-relaxed">{designer.bio}</p>
                  )}
                </div>
              </div>

              {/* Liens sociaux */}
              <div className="flex items-center space-x-3">
                {designer.github_url && (
                  <a 
                    href={designer.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {designer.linkedin_url && (
                  <a 
                    href={designer.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{enrichedProjects.length}</p>
                <p className="text-sm text-gray-500">Projets publics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalIterations}</p>
                <p className="text-sm text-gray-500">Itérations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{uniqueCategories}</p>
                <p className="text-sm text-gray-500">Catégories</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{(avgDfxScore * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Score DfX moyen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section projets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Portfolio Public</h2>
              <p className="text-gray-600 mt-1">Découvrez les projets partagés par {designer.full_name}</p>
            </div>
            <span className="text-sm text-gray-500">
              {enrichedProjects.length} projet{enrichedProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {enrichedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrichedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/designers/${designer.id}/projects/${project.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    {/* Image du projet */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {project.latestIteration?.image_url ? (
                        <img
                          src={project.latestIteration.image_url}
                          alt={project.project_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-500">Aucune image</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                          {project.category}
                        </span>
                        {project.bestDfxScore > 0 && (
                          <DfxScoreDisplay 
                            score={project.bestDfxScore}
                            compact={true}
                            size="sm"
                          />
                        )}
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {project.iterationCount} itér.
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {project.project_name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {project.description || 'Aucune description'}
                        </p>
                      </div>

                      {/* Prompt de la dernière itération */}
                      {project.latestIteration?.prompt && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-1">Prompt :</p>
                          <p className="text-gray-700 text-sm line-clamp-2 bg-gray-50 p-2 rounded-lg">
                            {project.latestIteration.prompt}
                          </p>
                        </div>
                      )}

                      {/* Détails */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Focus</p>
                          <p className="font-medium text-gray-900">{project.design_focus || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Style</p>
                          <p className="font-medium text-gray-900">{project.design_style || '-'}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'completed' ? '✓ Terminé' : 
                             project.status === 'in_progress' ? '⟳ En cours' : '📝 Brouillon'}
                          </span>
                          
                          <span className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 group-hover:underline">
                            Voir le projet
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun projet public</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {designer.full_name} n'a pas encore partagé de projets publics.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
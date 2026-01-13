// app/designers/page.js
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'

export default async function DesignersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Récupérer tous les designers avec profil public
  const { data: designers } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      avatar_url,
      bio,
      location,
      role,
      is_profile_public,
      created_at,
      design_projects!inner (
        id,
        is_project_public
      )
    `)
    .eq('is_profile_public', true)
    .eq('design_projects.is_project_public', true)
    .order('full_name', { ascending: true })

  // Pour chaque designer, récupérer les statistiques
  const designersWithStats = await Promise.all(
    (designers || []).map(async (designer) => {
      // Nombre de projets publics
      const { count: projectCount } = await supabase
        .from('design_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', designer.id)
        .eq('is_project_public', true)

      // Récupérer le dernier projet pour l'image de couverture
      const { data: latestProject } = await supabase
        .from('design_projects')
        .select('id')
        .eq('user_id', designer.id)
        .eq('is_project_public', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      let coverImage = null
      if (latestProject) {
        const { data: latestIteration } = await supabase
          .from('design_iterations')
          .select('image_url')
          .eq('project_id', latestProject.id)
          .order('iteration_number', { ascending: false })
          .limit(1)
          .single()
        
        coverImage = latestIteration?.image_url
      }

      // Compter les catégories uniques
      const { data: projects } = await supabase
        .from('design_projects')
        .select('category')
        .eq('user_id', designer.id)
        .eq('is_project_public', true)

      const uniqueCategories = new Set(projects?.map(p => p.category)).size

      return {
        ...designer,
        stats: {
          projects: projectCount || 0,
          categories: uniqueCategories,
          memberSince: new Date(designer.created_at).getFullYear()
        },
        coverImage
      }
    })
  )

  // Grouper les designers par spécialité (role)
  const designersByRole = designersWithStats.reduce((acc, designer) => {
    const role = designer.role || 'Designer'
    if (!acc[role]) {
      acc[role] = []
    }
    acc[role].push(designer)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Galerie des Designers
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Découvrez le talent de notre communauté de designers industriels. Chaque projet est une source d'inspiration.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-200">{designersWithStats.length} designers actifs</span>
              </div>
              <span className="text-blue-300">•</span>
              <span className="text-blue-200">
                {designersWithStats.reduce((sum, d) => sum + d.stats.projects, 0)} projets publics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par spécialité */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium whitespace-nowrap">
              Tous les designers
            </button>
            {Object.keys(designersByRole).map((role) => (
              <button
                key={role}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium whitespace-nowrap transition-colors"
              >
                {role}s ({designersByRole[role].length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des designers */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a4 4 0 00-5.545-5.545" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{designersWithStats.length}</p>
                <p className="text-sm text-gray-500">Designers actifs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {designersWithStats.reduce((sum, d) => sum + d.stats.projects, 0)}
                </p>
                <p className="text-sm text-gray-500">Projets publics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(designersWithStats.flatMap(d => d.role || 'Designer')).size}
                </p>
                <p className="text-sm text-gray-500">Spécialités</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {designersWithStats.reduce((sum, d) => sum + d.stats.categories, 0)}
                </p>
                <p className="text-sm text-gray-500">Catégories couvertes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des designers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designersWithStats.map((designer) => (
            <Link
              key={designer.id}
              href={`/designers/${designer.id}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                {/* Image de couverture */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {designer.coverImage ? (
                    <ImageWithFallback
                      src={designer.coverImage}
                      alt={`Projet de ${designer.full_name}`}
                      width={400}
                      height={192}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-sm text-gray-500">Aucune image de projet</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badge du nombre de projets */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-gray-900">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {designer.stats.projects} projets
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                        {designer.avatar_url ? (
                          <ImageWithFallback
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
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {designer.full_name}
                      </h3>
                      <p className="text-gray-600 capitalize">{designer.role || 'Designer'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {designer.bio && (
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {designer.bio}
                    </p>
                  )}

                  {/* Localisation */}
                  {designer.location && (
                    <div className="flex items-center text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {designer.location}
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{designer.stats.projects}</p>
                      <p className="text-xs text-gray-500">Projets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{designer.stats.categories}</p>
                      <p className="text-xs text-gray-500">Catégories</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <button className="w-full py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 flex items-center justify-center group-hover:shadow-md">
                      Voir le portfolio
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {designersWithStats.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun designer disponible</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Aucun designer n'a encore rendu son profil public. Soyez le premier à partager votre travail !
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-lg font-bold text-gray-900">Ideate Studio</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Plateforme de design industriel collaboratif
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                Tableau de bord
              </Link>
              <Link href="/dashboard/design" className="text-sm text-gray-600 hover:text-blue-600">
                Nouveau projet
              </Link>
              <Link href="/dashboard/profile" className="text-sm text-gray-600 hover:text-blue-600">
                Mon profil
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
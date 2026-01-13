import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Élégante */}
      <nav className="fixed w-full z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Ideate Design Studio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="hidden md:block text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Améliorée */}
      <main className="relative overflow-hidden pt-24 pb-20">
        {/* Effets de fond */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
              <span className="text-sm font-medium text-blue-300">✨ Plateforme IA de Design Industriel</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-white leading-tight">Concevez l'Innovation</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">avec l'Intelligence Artificielle</span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
              Transformez vos idées en designs industriels optimisés grâce à l'IA générative. 
              Créez, itérez et optimisez vos produits pour la fabrication, l'assemblage et la durabilité.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-2 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Démarrer gratuitement</span>
              </Link>
              
              {/* Bouton Entrer comme visiteur */}
              <Link
                href="/designers"
                className="group px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:rotate-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Explorer les designers</span>
              </Link>
            </div>
            
           
          </div>
        </div>
      </main>

      {/* Features Section Améliorée */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Fonctionnalités Puissantes</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour transformer vos idées en designs exceptionnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Génération Intelligente</h3>
              <p className="text-gray-400 leading-relaxed">
                Utilisez les modèles IA les plus avancés comme Stable Diffusion et SDXL pour générer des concepts de produits innovants en quelques secondes.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Génération à partir de croquis
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Raffinement automatique
                  </li>
                </ul>
              </div>
            </div>

            {/* Carte 2 */}
            <div className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:border-purple-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Optimisation DfX Complète</h3>
              <p className="text-gray-400 leading-relaxed">
                Appliquez les principes DfA, DfM, DFS et DFSust pour des designs optimisés pour la fabrication, l'assemblage et la durabilité.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Analyse DfA (Design for Assembly)
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Optimisation DfM (Design for Manufacturing)
                  </li>
                </ul>
              </div>
            </div>

            {/* Carte 3 */}
            <div className="group bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transition-all duration-300 hover:border-pink-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Processus Itératif Avancé</h3>
              <p className="text-gray-400 leading-relaxed">
                Améliorez continuellement vos designs grâce à un processus itératif guidé par l'IA, avec feedback et améliorations en temps réel.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-700">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Design itératif collaboratif
                  </li>
                  <li className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Feedback AI instantané
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Community */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-2/3 mb-8 lg:mb-0">
                <h2 className="text-3xl font-bold text-white mb-4">Rejoignez notre communauté de designers</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Découvrez le travail de designers talentueux, inspirez-vous de leurs projets publics et partagez vos propres créations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/designers"
                    className="group px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a4 4 0 00-5.545-5.545" />
                    </svg>
                    <span>Explorer les designers</span>
                  </Link>
                  <Link
                    href="/login"
                    className="group px-6 py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-lg hover:border-gray-500 hover:bg-gray-800/30 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Rejoindre la communauté</span>
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-700/40 to-purple-700/40 rounded-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="text-lg font-bold text-white">Ideate Design Studio</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plateforme de design industriel assistée par IA
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                Connexion
              </Link>
              <Link href="/designers" className="text-gray-400 hover:text-white text-sm transition-colors">
                Designers
              </Link>
              <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Créer un compte
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Ideate Design Studio. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
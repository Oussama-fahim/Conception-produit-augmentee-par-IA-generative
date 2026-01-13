// app/dashboard/about/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import Link from 'next/link'

export default function AboutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadSystemStats()
    loadTeamInfo()
  }

  const loadSystemStats = async () => {
    try {
      // Récupérer les statistiques globales
      const [
        projectsCount,
        iterationsCount,
        usersCount,
        publicProjectsCount,
        categories
      ] = await Promise.all([
        supabase
          .from('design_projects')
          .select('id', { count: 'exact', head: true }),
        
        supabase
          .from('design_iterations')
          .select('id', { count: 'exact', head: true }),
        
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true }),
        
        supabase
          .from('design_projects')
          .select('id', { count: 'exact', head: true })
          .eq('is_project_public', true),
        
        supabase
          .from('design_projects')
          .select('category')
      ])

      // Calculer les statistiques DfX moyennes
      const { data: iterationsWithScore } = await supabase
        .from('design_iterations')
        .select('dfx_score')
        .not('dfx_score', 'is', null)

      const scores = iterationsWithScore?.map(i => i.dfx_score) || []
      const averageDfxScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0

      // Catégories uniques
      const uniqueCategories = [...new Set(categories.data?.map(p => p.category).filter(Boolean))]

      // Statistiques par utilisateur
      const userProjectsCount = await supabase
        .from('design_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      const userIterationsCount = await supabase
        .from('design_iterations')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', user?.id ? 
          supabase.from('design_projects').select('id').eq('user_id', user.id) 
          : null)

      setStats({
        totalProjects: projectsCount.count || 0,
        totalIterations: iterationsCount.count || 0,
        totalUsers: usersCount.count || 0,
        publicProjects: publicProjectsCount.count || 0,
        uniqueCategories: uniqueCategories.length || 0,
        averageDfxScore,
        iterationsWithScores: scores.length,
        userProjects: userProjectsCount.count || 0,
        userIterations: userIterationsCount.count || 0
      })
    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
      setStats({
        totalProjects: 0,
        totalIterations: 0,
        totalUsers: 0,
        publicProjects: 0,
        uniqueCategories: 0,
        averageDfxScore: 0,
        iterationsWithScores: 0,
        userProjects: 0,
        userIterations: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTeamInfo = async () => {
    try {
      const { data: creatorData } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .ilike('full_name', '%Oussama Fahim%')
        .single()

      setTeam({
        creator: creatorData || {
          full_name: 'Oussama Fahim',
          bio: 'Élève ingénieur à l\'ENSAM - Concepteur et développeur de la plateforme Ideate Studio',
          role: 'Développeur Full-Stack & Concepteur',
          avatar_url: null
        },
        supervisors: [
          {
            name: 'Monsieur Tawfik Masrour',
            role: 'Encadrant et chef de filière - Expert en Génie Industriel et intelligence artificielle',
            institution: 'ENSAM',
            expertise: 'Génie Industriel, Design for Manufacturing'
          },
          {
            name: 'Madame Ibtissam El Hassani',
            role: 'Encadrante - Expert en Design Industriel',
            institution: 'ENSAM',
            expertise: 'Design Industriel, Innovation Produit'
          }
        ],
        institution: {
          name: 'École Nationale Supérieure d\'Arts et Métiers (ENSAM)',
          location: 'Meknès, Maroc',
          website: 'https://www.ensam.um5.ac.ma/',
          description: 'École d\'ingénieurs prestigieuse spécialisée en génie industriel et mécanique'
        }
      })
    } catch (error) {
      console.error('Erreur chargement info équipe:', error)
      setTeam({
        creator: {
          full_name: 'Oussama Fahim',
          bio: 'Élève ingénieur à l\'ENSAM - Concepteur et développeur de la plateforme Ideate Studio',
          role: 'Développeur Full-Stack & Concepteur',
          avatar_url: null
        },
        supervisors: [
          {
            name: 'Monsieur Tawfik Masrour',
            role: 'Encadrant et chef de filière - Expert en Génie Industriel et intelligence artificielle',
            institution: 'ENSAM',
            expertise: 'Génie Industriel, Design for Manufacturing'
          },
          {
            name: 'Madame Ibtissam El Hassani',
            role: 'Encadrante - Expert en Design Industriel',
            institution: 'ENSAM',
            expertise: 'Design Industriel, Innovation Produit'
          }
        ],
        institution: {
          name: 'École Nationale Supérieure d\'Arts et Métiers (ENSAM)',
          location: 'Meknès, Maroc',
          website: 'https://www.ensam.um5.ac.ma/',
          description: 'École d\'ingénieurs prestigieuse spécialisée en génie industriel et mécanique'
        }
        
      })
    }
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <DashboardHeader user={user} />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              À propos d'Ideate Studio
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Plateforme de Design Industriel Intelligent - Projet d'Expertise ENSAM
            </p>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalProjects.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Projets totaux</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.totalIterations.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Itérations</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Designers</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.publicProjects.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Publics</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.uniqueCategories}</div>
                <div className="text-sm text-gray-600">Catégories</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-indigo-600 mb-1">{(stats.averageDfxScore * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Score DfX</div>
              </div>
            </div>
          )}
        </div>

        {/* Vos statistiques */}
        {stats && stats.userProjects > 0 && (
          <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">Votre contribution</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.userProjects}</div>
                <div className="text-sm text-gray-600">Vos projets</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.userIterations}</div>
                <div className="text-sm text-gray-600">Vos itérations</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.userProjects > 0 ? Math.round(stats.userIterations / stats.userProjects) : 0}
                </div>
                <div className="text-sm text-gray-600">Itérations/projet</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Link 
                  href="/dashboard/projects" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir vos projets
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Section Contexte */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contexte du Projet</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Projet d'Expertise ENSAM</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Ideate Studio est une plateforme innovante développée dans le cadre d'un projet d'expertise à l'École Nationale Supérieure d'Arts et Métiers (ENSAM) de Meknès. Elle représente une avancée significative dans le domaine du design industriel en intégrant l'intelligence artificielle générative avec les principes du Design for Excellence (DfX).
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Cette plateforme a été conçue pour moderniser le processus de conception industrielle, offrant aux designers des outils avancés de génération d'images, d'analyse de fabricabilité et de collaboration.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">ENSAM Meknès</h4>
                  <p className="text-gray-600">École Nationale Supérieure d'Arts et Métiers</p>
                  <p className="text-gray-500 text-sm mt-2">Université Moulay Ismail</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Équipe */}
        {team && (
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">L'Équipe du Projet</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Concepteur Principal */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {team.creator.avatar_url ? (
                      <img 
                        src={team.creator.avatar_url} 
                        alt={team.creator.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      'OF'
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{team.creator.full_name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{team.creator.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {team.creator.bio}
                  </p>
                  <div className="mt-4 flex items-center text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm">{team.institution.name}</span>
                  </div>
                </div>
              </div>

              {/* Encadrants */}
              {team.supervisors.map((supervisor, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-green-500 to-teal-600' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-600'
                    }`}>
                      {supervisor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{supervisor.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{supervisor.role}</p>
                    <p className="text-gray-600 text-sm mb-2">{supervisor.expertise}</p>
                    <div className="mt-3 flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm">{supervisor.institution}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Fonctionnalités */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Principales</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Génération IA</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Texte → Image avec SD3/FLUX
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Croquis → Image avec ControlNet
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Raffinement itératif
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Analyse DfX</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Évaluation DFM/DFA/DFS
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recommandations automatiques
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Rapports détaillés
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Gestion Projets</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Organisation par catégories
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Historique des itérations
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Export PNG/JSON/ZIP
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section Architecture */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Architecture Technique</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Frontend</h4>
                    <p className="text-blue-200 text-sm">Next.js 14, React, Tailwind CSS</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Backend & Base de données</h4>
                    <p className="text-blue-200 text-sm">Supabase (Auth + PostgreSQL)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">IA Générative</h4>
                    <p className="text-blue-200 text-sm">Hugging Face + Stability AI</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Analyse DfX</h4>
                    <p className="text-blue-200 text-sm">Système basé sur règles et ML</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-4">Stack Technologique</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">Next.js</span>
                    <span className="px-3 py-1 bg-green-600 rounded-full text-sm">React</span>
                    <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">Tailwind</span>
                    <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">Supabase</span>
                    <span className="px-3 py-1 bg-red-600 rounded-full text-sm">PostgreSQL</span>
                    <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm">Hugging Face</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer de la page */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ideate Studio</h3>
                  <p className="text-gray-500 text-sm">Plateforme de Design Industriel</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Développé dans le cadre d'un projet d'expertise à l'ENSAM sous la supervision de Monsieur Tawfik Masrour et Madame Ibtissam El Hassani.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Informations</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Version: 1.0.0</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Dernière mise à jour: {formatDate()}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>ENSAM, Université Moulay Ismail, Meknès</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Ideate Studio - Projet développé par Oussama Fahim, élève ingénieur à l'ENSAM.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
// components/DashboardHeader.jsx (version corrigée)
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function DashboardHeader({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userSettings, setUserSettings] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    loadUserSettings()
  }, [user])

  const loadUserSettings = async () => {
    if (!user?.id) return
    
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.log('Aucune préférence trouvée, utilisation des valeurs par défaut')
        return
      }

      if (preferences?.preferences) {
        setUserSettings(preferences.preferences)
        
        // Appliquer le thème de manière sûre
        const theme = preferences.preferences?.general?.theme
        
        if (theme && theme !== 'system') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  // Navigation mise à jour
  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Designers', href: '/designers', current: pathname === '/designers' },
    { name: 'Conception Rapide', href: '/dashboard/design', current: pathname === '/dashboard/design' },
    { name: 'Design Itératif', href: '/dashboard/iterative-design', current: pathname === '/dashboard/iterative-design' },
    { name: 'Design 3D', href: '/dashboard/design-3d', current: pathname === '/dashboard/design-3d' },
    { name: 'Projets', href: '/dashboard/projects', current: pathname === '/dashboard/projects' },
    { name: 'Aide', href: '/dashboard/help', current: pathname === '/dashboard/help' },
    { name: 'À Propos', href: '/dashboard/about', current: pathname === '/dashboard/about' },
    { name: 'Paramètres', href: '/dashboard/settings', current: pathname === '/dashboard/settings' },
    { name: 'Profil', href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
  ]

  // Valeurs par défaut sécurisées pour l'utilisateur
  const userName = user?.full_name || user?.email || 'Utilisateur'
  const userEmail = user?.email || ''
  const userRole = user?.role || 'designer'
  const userTier = user?.subscription_tier || 'free'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo et navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Ideate Design
              </h1>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    item.current 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Utilisateur et menu */}
          <div className="flex items-center space-x-4">

            {/* Menu utilisateur */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userRole} • {userTier}
                    </p>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 transition-all duration-200 transform origin-top-right ${
                isDropdownOpen 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
              }`}>
                {/* En-tête du dropdown */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                      {user?.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-lg">{userInitial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userEmail}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {userRole}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 ml-1 capitalize">
                          {userTier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu items */}
                <div className="p-2">
                  <Link 
                    href="/dashboard/profile" 
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Mon Profil</p>
                      <p className="text-xs text-gray-500">Gérer votre profil</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/dashboard/iterative-design" 
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Design Itératif</p>
                      <p className="text-xs text-gray-500">Processus d'amélioration</p>
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/projects" 
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Mes Projets</p>
                      <p className="text-xs text-gray-500">Voir mes créations</p>
                    </div>
                  </Link>

                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-150 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Paramètres</p>
                      <p className="text-xs text-gray-500">Préférences et configuration</p>
                    </div>
                  </Link>
                </div>
                
                {/* Séparateur */}
                <div className="border-t border-gray-200"></div>
                
                {/* Déconnexion */}
                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 group"
                  >
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Déconnexion</p>
                      <p className="text-xs text-red-500">Se déconnecter du compte</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden pb-4">
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  item.current 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
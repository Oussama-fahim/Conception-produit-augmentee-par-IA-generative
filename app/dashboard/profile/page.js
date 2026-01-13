﻿// app/dashboard/profile/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import Image from 'next/image'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    phone: '',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    location: '',
    avatar_url: '',
    is_profile_public: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

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
    loadUserProfile(currentUser.id)
  }

  const loadUserProfile = async (userId) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erreur chargement profil:', error)
        // Si l'utilisateur n'existe pas dans la table users, le créer
        if (error.code === 'PGRST116') {
          await createUserProfile(userId)
          return
        }
        throw error
      }

      if (userData) {
        setProfile({
          full_name: userData.full_name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          github_url: userData.github_url || '',
          linkedin_url: userData.linkedin_url || '',
          website_url: userData.website_url || '',
          location: userData.location || '',
          avatar_url: userData.avatar_url || '',
          is_profile_public: userData.is_profile_public || false
        })
        setAvatarPreview(userData.avatar_url || '')
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
      setMessage({ type: 'error', content: 'Erreur lors du chargement du profil' })
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || '',
          bio: '',
          phone: '',
          github_url: '',
          linkedin_url: '',
          website_url: '',
          location: '',
          avatar_url: '',
          is_profile_public: false
        })
        .select()
        .single()

      if (error) throw error

      setProfile({
        full_name: newUser.full_name || '',
        email: newUser.email || '',
        bio: newUser.bio || '',
        phone: newUser.phone || '',
        github_url: newUser.github_url || '',
        linkedin_url: newUser.linkedin_url || '',
        website_url: newUser.website_url || '',
        location: newUser.location || '',
        avatar_url: newUser.avatar_url || '',
        is_profile_public: newUser.is_profile_public || false
      })
    } catch (error) {
      console.error('Erreur création profil:', error)
      setMessage({ type: 'error', content: 'Erreur lors de la création du profil' })
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', content: 'Veuillez sélectionner un fichier image valide' })
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', content: 'L\'image ne doit pas dépasser 5MB' })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const uploadAvatar = async (file, userId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('🔄 Tentative d\'upload vers:', filePath);
      console.log('👤 User ID:', userId);

      // Vérifier si l'utilisateur est authentifié
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier que l'userId correspond à l'utilisateur authentifié
      if (authUser.id !== userId) {
        throw new Error('Tentative d\'upload pour un autre utilisateur');
      }

      // Upload vers Supabase Storage avec overwrite
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('❌ Erreur détaillée upload:', uploadError);
        
        // Si l'erreur est due à un conflit, essayer de supprimer d'abord
        if (uploadError.message?.includes('already exists')) {
          // Supprimer l'ancien fichier
          await supabase.storage
            .from('avatars')
            .remove([filePath]);
          
          // Réessayer l'upload
          const { error: retryError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
              upsert: true,
              cacheControl: '3600'
            });
          
          if (retryError) {
            throw retryError;
          }
        } else {
          throw uploadError;
        }
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Upload réussi, URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('❌ Erreur upload avatar détaillée:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw new Error(`Erreur lors de l'upload de l'avatar: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', content: '' })

    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !currentUser) {
        throw new Error('Session utilisateur invalide. Veuillez vous reconnecter.')
      }

      let avatarUrl = profile.avatar_url

      // Upload de la nouvelle image si elle existe
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile, currentUser.id)
        } catch (uploadError) {
          console.error('Erreur upload:', uploadError)
          
          // Si l'upload échoue, on continue sans l'avatar mais on affiche un avertissement
          setMessage({
            type: 'warning',
            content: 'Profil mis à jour mais l\'avatar n\'a pas pu être uploadé. Vous pouvez réessayer plus tard.'
          })
          // On garde l'ancienne URL d'avatar
          avatarUrl = profile.avatar_url
        }
      }

      // Mise à jour du profil dans la table users
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          phone: profile.phone,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          website_url: profile.website_url,
          location: profile.location,
          avatar_url: avatarUrl,
          is_profile_public: profile.is_profile_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)

      if (updateError) {
        console.error('Erreur détaillée update:', updateError)
        
        // Gestion spécifique des erreurs RLS
        if (updateError.message.includes('row-level security policy')) {
          throw new Error('Erreur de sécurité. Vérifiez vos permissions.')
        }
        
        throw updateError
      }

      setMessage({ 
        type: 'success', 
        content: 'Profil mis à jour avec succès!' 
      })

      // Recharger les données utilisateur
      setUser({ ...user, avatar_url: avatarUrl })
      
      // Forcer le rechargement de la page pour mettre à jour le header
      setTimeout(() => {
        router.refresh()
      }, 1000)
      
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error)
      
      let errorMessage = error.message || 'Erreur lors de la mise à jour du profil'
      
      // Messages d'erreur plus user-friendly
      if (error.message.includes('row-level security policy')) {
        errorMessage = 'Erreur de sécurité. Vérifiez que vous êtes bien connecté.'
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.'
      }
      
      setMessage({ 
        type: 'error', 
        content: errorMessage 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de la page */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="mt-2 text-gray-600">
              Gérez vos informations personnelles et votre présence sur la plateforme
            </p>
          </div>

          {message.content && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : message.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-green-50 border border-green-200 text-green-800'
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
                {message.type === 'success' && (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.content}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Avatar et liens rapides */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {profile.full_name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile.full_name || 'Utilisateur'}</h2>
                  <p className="text-gray-500 text-sm">{profile.email}</p>
                  {profile.location && (
                    <p className="text-gray-500 text-sm mt-1 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                </div>

                {/* Statut de visibilité */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Profil public</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.is_profile_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.is_profile_public ? 'Public' : 'Privé'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {profile.is_profile_public 
                      ? 'Votre profil est visible dans la galerie des designers' 
                      : 'Votre profil est privé et non visible par les autres'
                    }
                  </p>
                </div>

                {/* Liens sociaux */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Réseaux sociaux</h3>
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                      <span className="text-sm">Site Web</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne de droite - Formulaire */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Informations Personnelles */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations Personnelles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom Complet *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={profile.full_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Décrivez-vous en quelques mots... Partagez votre expérience, vos spécialités ou votre vision du design."
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/500 caractères</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profile.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Paramètres de Visibilité */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de Visibilité</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Profil public</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Rendre votre profil visible dans la galerie des designers. Les autres utilisateurs pourront voir votre profil et vos projets publics.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_profile_public"
                          checked={profile.is_profile_public}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {profile.is_profile_public && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Votre profil est public</p>
                            <p className="text-sm text-blue-700">
                              Les autres utilisateurs peuvent maintenant découvrir votre travail dans la galerie des designers. 
                              Ils pourront voir votre profil, votre bio et vos projets marqués comme publics.
                            </p>
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <a href="/designers" className="hover:underline">
                                Voir la galerie des designers
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!profile.is_profile_public && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-800 mb-1">Votre profil est privé</p>
                            <p className="text-sm text-gray-600">
                              Votre profil n'est pas visible dans la galerie des designers. Seuls vous pouvez voir vos projets et informations.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Liens et Réseaux Sociaux */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Liens et Réseaux Sociaux</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        id="github_url"
                        name="github_url"
                        value={profile.github_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://github.com/votre-username"
                      />
                    </div>

                    <div>
                      <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={profile.linkedin_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://linkedin.com/in/votre-profil"
                      />
                    </div>

                    <div>
                      <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Web Personnel
                      </label>
                      <input
                        type="url"
                        id="website_url"
                        name="website_url"
                        value={profile.website_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="https://votre-site.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Sauvegarder les modifications</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (token_hash && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup'
          })

          if (error) {
            throw error
          }

          setStatus('success')
          setMessage('Votre email a été confirmé avec succès !')
        } catch (error) {
          console.error('Erreur confirmation email:', error)
          setStatus('error')
          setMessage('Le lien de confirmation est invalide ou a expiré.')
        }
      } else {
        setStatus('error')
        setMessage('Lien de confirmation invalide.')
      }
    }

    confirmEmail()
  }, [searchParams, supabase.auth])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Confirmation de votre email en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-card border border-gray-200 text-center">
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Félicitations !
              </h2>
              <p className="text-gray-600 mb-2">
                Votre compte a été créé avec succès.
              </p>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Accéder au Tableau de Bord
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Erreur de confirmation
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
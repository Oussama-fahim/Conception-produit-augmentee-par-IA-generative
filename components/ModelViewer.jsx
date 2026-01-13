'use client'

import { useState, useEffect, useRef } from 'react'

export default function ModelViewer({ 
  glbUrl,
  thumbnailUrl,
  fileName = 'model.glb',
  className = ''
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!glbUrl) return
    
    setLoading(true)
    setError(null)
    setProgress(0)
    
    // Simuler le chargement
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    return () => clearInterval(interval)
  }, [glbUrl])

  const handleLoad = () => {
    setLoading(false)
    setProgress(100)
  }

  const handleError = (err) => {
    setError('Impossible de charger le modèle 3D')
    setLoading(false)
    console.error('Erreur chargement modèle:', err)
  }

  const downloadModel = async () => {
    try {
      const response = await fetch(glbUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('URL copiée dans le presse-papier !')
      })
      .catch(err => {
        console.error('Erreur copie:', err)
      })
  }

  const getFileSize = async () => {
    try {
      const response = await fetch(glbUrl, { method: 'HEAD' })
      const size = response.headers.get('content-length')
      return size ? `${(parseInt(size) / 1024 / 1024).toFixed(2)} MB` : 'Inconnu'
    } catch {
      return 'Inconnu'
    }
  }

  const [fileSize, setFileSize] = useState('Chargement...')

  useEffect(() => {
    if (glbUrl) {
      getFileSize().then(setFileSize)
    }
  }, [glbUrl])

  if (!glbUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p>Aucun modèle 3D disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800" style={{ minHeight: '400px' }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-10">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white mb-2">Chargement du modèle 3D...</p>
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">{progress}%</p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-96">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-lg mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="h-full">
            {/* Aperçu du modèle avec viewer simple */}
            <div className="relative h-full">
              {thumbnailUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={thumbnailUrl} 
                    alt="Aperçu du modèle"
                    className="max-w-full max-h-full object-contain opacity-50"
                  />
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white bg-black bg-opacity-50 p-6 rounded-xl">
                  <svg className="w-16 h-16 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">Modèle 3D Généré</h3>
                  <p className="text-gray-300 mb-4">Utilisez les boutons ci-dessous pour télécharger ou visualiser</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contrôles */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          <button
            onClick={downloadModel}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Télécharger GLB</span>
          </button>
          
          <button
            onClick={() => window.open(glbUrl, '_blank')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Ouvrir dans nouvel onglet</span>
          </button>
        </div>
      </div>

      {/* Infos techniques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h4 className="font-semibold text-white">Fichier</h4>
          </div>
          <p className="text-sm text-gray-300">Format: GLB</p>
          <p className="text-sm text-gray-300">Taille: {fileSize}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-white">Compatible avec</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Blender</span>
            <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Unity</span>
            <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded">Unreal Engine</span>
            <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">Three.js</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h4 className="font-semibold text-white">Actions rapides</h4>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => copyToClipboard(glbUrl)}
              className="w-full text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copier l'URL GLB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Comment utiliser votre modèle 3D
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-medium mb-2">🎮 Avec Blender:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Fichier → Importer → glTF 2.0 (.glb/.gltf)</li>
              <li>Sélectionnez votre fichier téléchargé</li>
              <li>Modifiez, texturez ou exportez dans d'autres formats</li>
            </ol>
          </div>
          <div>
            <p className="font-medium mb-2">🌐 Avec Three.js:</p>
            <code className="block bg-gray-900 p-2 rounded text-xs font-mono overflow-x-auto">
              {'const loader = new GLTFLoader();\nloader.load(modelUrl, (gltf) => {\n  scene.add(gltf.scene);\n});'}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
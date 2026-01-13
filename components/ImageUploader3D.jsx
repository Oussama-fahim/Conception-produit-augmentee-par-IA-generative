'use client'

import { useState, useRef } from 'react'

export default function ImageUploader3D({ 
  onImageUpload, 
  disabled = false,
  accept = 'image/png,image/jpeg,image/jpg',
  maxSize = 20 * 1024 * 1024 // 20MB
}) {
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(null)
  const [dimensions, setDimensions] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = async (file) => {
    setError('')
    
    if (!file) return

    // Vérifier le type de fichier
    const acceptedTypes = accept.split(',').map(type => type.trim())
    if (!acceptedTypes.some(type => file.type.match(type.replace('*', '.*')))) {
      setError('Format de fichier non supporté. Utilisez PNG, JPEG ou JPG.')
      return
    }

    // Vérifier la taille
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux. Taille maximum: ${(maxSize / 1024 / 1024).toFixed(0)}MB.`)
      return
    }

    setFileName(file.name)
    setFileSize(file.size)
    
    // Créer un aperçu
    const reader = new FileReader()
    reader.onloadend = (e) => {
      const img = new Image()
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height })
        setPreview(e.target.result)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
    
    // Notifier le parent
    onImageUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName('')
    setFileSize(null)
    setDimensions(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUpload(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image source pour la transformation 3D
        </label>
        
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => handleFileChange(e.target.files[0])}
            disabled={disabled}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                Glissez-déposez votre image ici
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ou cliquez pour parcourir vos fichiers
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                PNG, JPEG, JPG
              </span>
              <span>•</span>
              <span>Max {maxSize / 1024 / 1024}MB</span>
              <span>•</span>
              <span>Recommandé: 1024×1024px</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="relative">
            <img
              src={preview}
              alt="Aperçu de l'image"
              className="w-full h-64 object-contain bg-gray-50"
            />
            
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleClear}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-colors"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileSize)} • {dimensions?.width}×{dimensions?.height}px
                    </p>
                  </div>
                </div>
                
                <span className="text-xs text-white bg-purple-600 px-2 py-1 rounded-full font-medium">
                  Prêt pour 3D
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-white p-2 rounded border border-gray-200">
                  <span className="font-medium">Taille:</span> {formatFileSize(fileSize)}
                </div>
                <div className="bg-white p-2 rounded border border-gray-200">
                  <span className="font-medium">Dimensions:</span> {dimensions?.width}×{dimensions?.height}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-purple-800 space-y-1">
            <p className="font-medium">🎯 Conseils pour un meilleur résultat 3D:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Utilisez une image avec un objet bien défini et centré</li>
              <li>Fond uni recommandé (blanc ou contrasté)</li>
              <li>Évitez les images trop complexes ou texturées</li>
              <li>Format idéal: carré 1024×1024px</li>
              <li>Résolution minimum: 512×512px</li>
              <li>Temps de traitement: 1-3 minutes selon la complexité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
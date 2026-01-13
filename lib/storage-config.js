// lib/storage-config.js
import { createClient } from '@/lib/supabase/client'

export async function checkStorageConfig() {
  const supabase = createClient()
  
  try {
    console.log('🔍 Vérification de la configuration Storage...')
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    // Vérifier que le bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      throw new Error(`Erreur liste buckets: ${bucketsError.message}`)
    }

    const avatarsBucket = buckets.find(b => b.name === 'avatars')
    if (!avatarsBucket) {
      throw new Error('Bucket "avatars" non trouvé')
    }

    console.log('✅ Bucket avatars trouvé:', avatarsBucket)

    // Tester un upload simple
    const testFilePath = `${user.id}/test-config.txt`
    const testContent = new Blob(['Test configuration'], { type: 'text/plain' })

    const { error: testUploadError } = await supabase.storage
      .from('avatars')
      .upload(testFilePath, testContent, { upsert: true })

    if (testUploadError) {
      throw new Error(`Erreur test upload: ${testUploadError.message}`)
    }

    // Nettoyer le fichier test
    await supabase.storage
      .from('avatars')
      .remove([testFilePath])

    console.log('✅ Configuration Storage validée avec succès!')
    return { success: true, user }

  } catch (error) {
    console.error('❌ Erreur configuration Storage:', error)
    return { success: false, error: error.message }
  }
}
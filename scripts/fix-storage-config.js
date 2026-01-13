// scripts/fix-storage-config.js
const { createClient } = require('@supabase/supabase-js')

async function fixStorageConfig() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔧 Correction de la configuration Storage...')

  try {
    // Vérifier la connexion
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(`Erreur auth: ${error.message}`)
    }

    // Exécuter les corrections SQL
    const corrections = [
      `INSERT INTO storage.buckets (id, name, public) 
       VALUES ('avatars', 'avatars', true)
       ON CONFLICT (id) DO NOTHING;`,
       
      `DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
       CREATE POLICY "Avatar images are publicly accessible" 
       ON storage.objects FOR SELECT USING (bucket_id = 'avatars');`,
       
      `DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
       CREATE POLICY "Users can upload their own avatar" 
       ON storage.objects FOR INSERT WITH CHECK (
         bucket_id = 'avatars' 
         AND (auth.role() = 'authenticated')
         AND (storage.foldername(name))[1] = auth.uid()::text
       );`
    ]

    for (const sql of corrections) {
      console.log('Exécution:', sql.split('\n')[0])
      // Note: Ces commandes doivent être exécutées dans l'éditeur SQL Supabase
    }

    console.log('✅ Corrections appliquées!')
    console.log('📋 Copiez-collez les commandes SQL dans l\'éditeur SQL Supabase')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

fixStorageConfig()
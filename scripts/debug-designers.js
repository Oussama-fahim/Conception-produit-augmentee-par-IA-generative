// scripts/debug-designers.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    if (!fs.existsSync(envPath)) {
      const envPath2 = path.join(__dirname, '..', '.env')
      if (!fs.existsSync(envPath2)) {
        throw new Error('Aucun fichier .env trouvé')
      }
      return fs.readFileSync(envPath2, 'utf8')
    }
    return fs.readFileSync(envPath, 'utf8')
  } catch (error) {
    return ''
  }
}

function parseEnvFile(content) {
  const envVars = {}
  const lines = content.split('\n')
  
  lines.forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      envVars[match[1]] = value
    }
  })
  
  return envVars
}

async function debugDesigners() {
  console.log('🐛 Debug complet de la fonctionnalité Designers\n')

  const envContent = loadEnvFile()
  const envVars = parseEnvFile(envContent)

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variables Supabase manquantes')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Vérifier les designers publics
    console.log('1. 🧑‍🎨 Designers publics:')
    const { data: designers, error: designersError } = await supabase
      .from('users')
      .select('id, full_name, is_profile_public')
      .eq('is_profile_public', true)

    if (designersError) throw designersError

    console.log(`   ✅ ${designers.length} designer(s) public(s) trouvé(s)`)
    designers.forEach(d => console.log(`      - ${d.full_name} (${d.id})`))

    // 2. Pour chaque designer, vérifier les projets publics
    console.log('\n2. 📁 Projets publics par designer:')
    for (const designer of designers) {
      console.log(`\n   👤 ${designer.full_name}:`)
      
      const { data: projects, error: projectsError } = await supabase
        .from('design_projects')
        .select('id, project_name, is_project_public')
        .eq('user_id', designer.id)
        .eq('is_project_public', true)

      if (projectsError) throw projectsError

      console.log(`      ${projects.length} projet(s) public(s)`)
      
      for (const project of projects) {
        console.log(`      📋 ${project.project_name} (${project.id})`)
        
        // Vérifier les itérations
        const { data: iterations, error: iterationsError } = await supabase
          .from('design_iterations')
          .select('id, iteration_number, image_url')
          .eq('project_id', project.id)
          .order('iteration_number', { ascending: false })

        if (iterationsError) throw iterationsError

        console.log(`         ${iterations.length} itération(s)`)
        
        iterations.forEach(iter => {
          const hasImage = !!iter.image_url
          console.log(`         ↳ Itération ${iter.iteration_number}: ${hasImage ? '🖼️  Avec image' : '❌ Sans image'}`)
          if (hasImage) {
            console.log(`           Format: ${iter.image_url.startsWith('data:image/') ? 'Base64' : 'URL'}`)
            console.log(`           Taille: ${iter.image_url.length} caractères`)
          }
        })
      }
    }

    // 3. Vérifier un projet spécifique en détail
    console.log('\n3. 🔍 Exemple détaillé du premier projet trouvé:')
    if (designers.length > 0 && designers[0]) {
      const { data: sampleProjects } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', designers[0].id)
        .eq('is_project_public', true)
        .limit(1)

      if (sampleProjects && sampleProjects.length > 0) {
        const project = sampleProjects[0]
        console.log(`   Projet: ${project.project_name}`)
        console.log(`   ID: ${project.id}`)
        console.log(`   Catégorie: ${project.category}`)
        console.log(`   Statut: ${project.status}`)
        
        const { data: iterations } = await supabase
          .from('design_iterations')
          .select('*')
          .eq('project_id', project.id)

        console.log(`   Itérations: ${iterations?.length || 0}`)
        
        if (iterations && iterations.length > 0) {
          const iter = iterations[0]
          console.log(`   Dernière itération:`)
          console.log(`     - ID: ${iter.id}`)
          console.log(`     - Numéro: ${iter.iteration_number}`)
          console.log(`     - Modèle: ${iter.model_used}`)
          console.log(`     - Image: ${iter.image_url ? '✅ Présente' : '❌ Absente'}`)
          console.log(`     - Prompt: ${iter.prompt ? '✅ Présent' : '❌ Absent'}`)
          if (iter.image_url) {
            console.log(`     - Début image: ${iter.image_url.substring(0, 100)}...`)
          }
        }
      }
    }

    console.log('\n✅ Debug terminé avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error.message)
  }
}

debugDesigners().catch(console.error)
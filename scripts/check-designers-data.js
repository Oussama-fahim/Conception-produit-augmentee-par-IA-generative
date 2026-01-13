// scripts/check-designers-data.js
const { createClient } = require('@supabase/supabase-js')

async function checkDesignersData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔍 Diagnostic des données designers...\n')

  try {
    // 1. Vérifier les designers avec profil public
    const { data: designers, error: designersError } = await supabase
      .from('users')
      .select('id, full_name, is_profile_public')
      .eq('is_profile_public', true)

    if (designersError) throw designersError

    console.log('📊 Designers avec profil public:')
    designers.forEach(designer => {
      console.log(`   - ${designer.full_name} (${designer.id})`)
    })

    // 2. Pour chaque designer, vérifier les projets publics
    for (const designer of designers) {
      console.log(`\n🔍 Vérification des projets de ${designer.full_name}:`)
      
      const { data: projects, error: projectsError } = await supabase
        .from('design_projects')
        .select('id, project_name, is_project_public, design_iterations(id)')
        .eq('user_id', designer.id)
        .eq('is_project_public', true)

      if (projectsError) throw projectsError

      console.log(`   Projets publics: ${projects?.length || 0}`)
      
      projects?.forEach(project => {
        console.log(`     - ${project.project_name} (${project.design_iterations?.length || 0} itérations)`)
      })
    }

    console.log('\n✅ Diagnostic terminé!')

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  }
}

checkDesignersData()
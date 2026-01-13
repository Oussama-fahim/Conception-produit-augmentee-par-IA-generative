// scripts/verify-project-data.js
const { createClient } = require('@supabase/supabase-js')

async function verifyProjectData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('🔍 Vérification des données de projet...\n')

  try {
    // 1. Vérifier tous les projets publics
    const { data: publicProjects, error: projectsError } = await supabase
      .from('design_projects')
      .select('id, project_name, user_id, is_project_public')
      .eq('is_project_public', true)

    if (projectsError) throw projectsError

    console.log('📊 Projets publics trouvés:', publicProjects.length)
    
    for (const project of publicProjects) {
      console.log(`\n🔍 Projet: ${project.project_name} (${project.id})`)
      
      // 2. Vérifier les itérations de chaque projet
      const { data: iterations, error: iterationsError } = await supabase
        .from('design_iterations')
        .select('id, iteration_number, image_url, project_id')
        .eq('project_id', project.id)
        .order('iteration_number', { ascending: false })

      if (iterationsError) throw iterationsError

      console.log(`   Itérations: ${iterations.length}`)
      iterations.forEach(iteration => {
        console.log(`   - Itération ${iteration.iteration_number}: ${iteration.image_url ? '✅ Avec image' : '❌ Sans image'}`)
      })

      // 3. Vérifier le propriétaire du projet
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .select('full_name, is_profile_public')
        .eq('id', project.user_id)
        .single()

      if (ownerError) {
        console.log('   ❌ Propriétaire non trouvé')
      } else {
        console.log(`   👤 Propriétaire: ${owner.full_name} (${owner.is_profile_public ? 'Profil public' : 'Profil privé'})`)
      }
    }

    console.log('\n✅ Vérification terminée!')

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  }
}

verifyProjectData()
// app/dashboard/projects/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import Link from 'next/link'
import DfxScoreDisplay from '@/components/DfxScoreDisplay'
import DfxMetricsPanel from '@/components/DfxMetricsPanel'
import LoadingSpinner from '@/components/LoadingSpinner'
import Image from 'next/image'
import DownloadButton from '@/components/DownloadButton'
import IterationCard from '@/components/IterationCard'

// Styles professionnels
const styles = {
  card: "border border-gray-200 rounded-xl p-6 bg-white shadow-lg transition-all duration-300 hover:shadow-xl",
  header: "text-3xl font-bold text-gray-800 mb-2",
  subheader: "text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-4",
  input: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  select: "w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors",
  button: "p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md",
  label: "block text-sm font-semibold text-gray-700 mb-2 flex items-center",
  badge: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
  badgeSuccess: "bg-green-100 text-green-800",
  badgeWarning: "bg-yellow-100 text-yellow-800",
  badgeError: "bg-red-100 text-red-800",
  badgeInfo: "bg-blue-100 text-blue-800",
  badgePurple: "bg-purple-100 text-purple-800",
  badgeOrange: "bg-orange-100 text-orange-800",
  badgePink: "bg-pink-100 text-pink-800",
  badgeIndigo: "bg-indigo-100 text-indigo-800"
}

// Composant de bouton de téléchargement amélioré
const EnhancedDownloadButton = ({ href, filename, children, className = '' }) => {
  return (
    <DownloadButton
      href={href}
      filename={filename}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      {children}
    </DownloadButton>
  )
}

// Composant de carte d'itération amélioré
const EnhancedIterationCard = ({ iteration, project, onSelect, isSelected, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  const getGenerationModeBadge = (mode) => {
    const modes = {
      'text-to-image': { label: 'Texte → Image', color: styles.badgeInfo, icon: '📝' },
      'sketch-to-image': { label: 'Croquis → Image', color: styles.badgeWarning, icon: '🎨' },
      'refinement': { label: 'Raffinement', color: styles.badgePurple, icon: '🔄' }
    }
    const config = modes[mode] || modes['text-to-image']
    return (
      <span className={`${styles.badge} ${config.color} text-xs`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) return null
    const qualifier = score >= 0.8 ? 'Excellent' : score >= 0.6 ? 'Bon' : 'À améliorer'
    const color = score >= 0.8 ? styles.badgeSuccess : score >= 0.6 ? styles.badgeWarning : styles.badgeError
    return (
      <span className={`${styles.badge} ${color} text-xs`}>
        {(score * 100).toFixed(1)}% - {qualifier}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* En-tête */}
      <div 
        className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            {iteration.iteration_number}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-gray-800">
                Itération {iteration.iteration_number}
              </h4>
              {iteration.generation_mode && getGenerationModeBadge(iteration.generation_mode)}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span>{formatDate(iteration.created_at)}</span>
              {iteration.model_used && (
                <>
                  <span>•</span>
                  <span className="font-medium">{iteration.model_used}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {iteration.dfx_score !== null && iteration.dfx_score !== undefined && (
            <div className="text-right">
              {getScoreBadge(iteration.dfx_score)}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu détaillé */}
      {expanded && (
        <div className="p-6 space-y-6 bg-white">
          {/* Image et actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Image Générée</label>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 aspect-square">
                {iteration.image_url ? (
                  <img
                    src={iteration.image_url}
                    alt={`Itération ${iteration.iteration_number}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNNjAgNzVINjBWODVINjBWNzVaTTE0MCA3NUg4NVY4NUgxNDBWNzVaTTYwIDEwMEg2MFYxMTBINjBWMTBaTTE0MCAxMDBIODVWMTEwSDE0MFYxMDJaTTYwIDEyNUg2MFYxMzVINjBWMTI1Wk0xNDAgMTI1SDg1VjEzNUgxNDBWMTI1WiIgZmlsbD0iI2I4YjhiOCIvPjwvc3ZnPg=='
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="grid grid-cols-2 gap-3">
                {iteration.image_url && (
                  <EnhancedDownloadButton
                    href={iteration.image_url}
                    filename={`iteration-${iteration.iteration_number}-${project.project_name || project.title}.png`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger
                  </EnhancedDownloadButton>
                )}
                
                <button
                  onClick={() => onSelect && onSelect(iteration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            </div>

            {/* Détails techniques */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Prompt</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                  {iteration.prompt || 'Aucun prompt'}
                </p>
              </div>

              {iteration.feedback_text && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2">Feedback</label>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                    {iteration.feedback_text}
                  </p>
                </div>
              )}

              {/* Paramètres techniques */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Paramètres</label>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-2">
                  {iteration.seed && (
                    <p><span className="font-medium">Seed:</span> {iteration.seed}</p>
                  )}
                  {iteration.specifications && typeof iteration.specifications === 'object' && (
                    <>
                      {iteration.specifications.point_vue && (
                        <p><span className="font-medium">Point de vue:</span> {iteration.specifications.point_vue}</p>
                      )}
                      {iteration.specifications.hauteur && iteration.specifications.largeur && (
                        <p><span className="font-medium">Dimensions:</span> {iteration.specifications.largeur}×{iteration.specifications.hauteur}px</p>
                      )}
                    </>
                  )}
                  {iteration.control_strength && (
                    <p><span className="font-medium">Force ControlNet:</span> {iteration.control_strength}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Métriques DfX */}
          {iteration.dfx_metrics && Object.keys(iteration.dfx_metrics).length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Analyse DfX</label>
              <DfxMetricsPanel 
                metrics={iteration.dfx_metrics}
                aspect={iteration.dfx_aspect || project.aspect}
                score={iteration.dfx_score}
                compact={true}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              ID: {iteration.id?.substring(0, 8)}...
            </div>
            <div className="flex items-center space-x-2">
              {onDelete && (
                <button
                  onClick={() => onDelete(iteration.id)}
                  className="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null)
  const [selectedIteration, setSelectedIteration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [completeLoading, setCompleteLoading] = useState(null)
  const [iterationDeleteLoading, setIterationDeleteLoading] = useState(null)
  const [expandedDetails, setExpandedDetails] = useState({})
  const [detailedView, setDetailedView] = useState(true)
  const [sketchData, setSketchData] = useState({})

  const [stats, setStats] = useState({
    total: 0,
    drafts: 0,
    inProgress: 0,
    completed: 0,
    standard: 0,
    iterative: 0,
    categories: new Set()
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter, categoryFilter, typeFilter])

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject.id)
      loadSketchData(selectedProject.id)
    }
  }, [selectedProject])

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    loadUserProjects(currentUser.id)
  }

  const loadUserProjects = async (userId) => {
    try {
      setLoading(true)
      
      // Charger les projets
      const { data: projectsData, error } = await supabase
        .from('design_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur Supabase:', error)
        throw error
      }

      // Charger les itérations pour chaque projet
      const projectsWithIterations = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: iterations } = await supabase
            .from('design_iterations')
            .select('*')
            .eq('project_id', project.id)
            .order('iteration_number', { ascending: true })

          return {
            ...project,
            design_iterations: iterations || []
          }
        })
      )

      setProjects(projectsWithIterations)
      calculateStats(projectsWithIterations)
      
      if (projectsWithIterations.length > 0) {
        setSelectedProject(projectsWithIterations[0])
        if (projectsWithIterations[0].design_iterations?.length > 0) {
          setSelectedIteration(projectsWithIterations[0].design_iterations[0])
        }
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error.message || error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectDetails = async (projectId) => {
    if (!projectId) return
    
    setDetailsLoading(true)
    try {
      // Charger les raffinements
      const { data: refinements } = await supabase
        .from('design_refinements')
        .select('*')
        .eq('project_id', projectId)

      // Charger l'historique de raffinements DfX
      const { data: refinementHistory } = await supabase
        .from('dfx_refinement_history')
        .select('*')
        .eq('project_id', projectId)

      // Charger les métadonnées du croquis
      const { data: sketchMetadata } = await supabase
        .from('design_projects')
        .select('sketch_metadata')
        .eq('id', projectId)
        .single()

      setSelectedProjectDetails({
        design_refinements: refinements || [],
        dfx_refinement_history: refinementHistory || [],
        sketch_metadata: sketchMetadata?.sketch_metadata || {}
      })
    } catch (error) {
      console.error('Erreur chargement détails projet:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const loadSketchData = async (projectId) => {
    if (!projectId) return
    
    try {
      const { data: project } = await supabase
        .from('design_projects')
        .select('sketch_data, sketch_url, sketch_metadata')
        .eq('id', projectId)
        .single()

      if (project) {
        setSketchData({
          sketch_data: project.sketch_data,
          sketch_url: project.sketch_url,
          sketch_metadata: project.sketch_metadata
        })
      }
    } catch (error) {
      console.error('Erreur chargement croquis:', error)
    }
  }

  const calculateStats = (projectsData) => {
    const categories = new Set()
    let drafts = 0
    let inProgress = 0
    let completed = 0
    let standard = 0
    let iterative = 0

    projectsData.forEach(project => {
      categories.add(project.category)
      switch (project.status) {
        case 'draft': drafts++; break
        case 'in_progress': inProgress++; break
        case 'completed': completed++; break
      }
      
      if (project.type === 'iterative') {
        iterative++
      } else {
        standard++
      }
    })

    setStats({
      total: projectsData.length,
      drafts,
      inProgress,
      completed,
      standard,
      iterative,
      categories
    })
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.design_focus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.design_style?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(project => project.category === categoryFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(project => project.type === typeFilter)
    }

    setFilteredProjects(filtered)
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les itérations associées seront également supprimées. Cette action est irréversible.')) {
      return
    }

    setDeleteLoading(projectId)
    try {
      // Supprimer d'abord les raffinements associés
      await supabase
        .from('design_refinements')
        .delete()
        .eq('project_id', projectId)

      // Supprimer l'historique de raffinements
      await supabase
        .from('dfx_refinement_history')
        .delete()
        .eq('project_id', projectId)

      // Supprimer les itérations associées
      await supabase
        .from('design_iterations')
        .delete()
        .eq('project_id', projectId)

      // Puis supprimer le projet
      const { error } = await supabase
        .from('design_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
        setSelectedProjectDetails(null)
        setSelectedIteration(null)
      }
    } catch (error) {
      console.error('Erreur suppression projet:', error)
      alert('Erreur lors de la suppression du projet')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDeleteIteration = async (iterationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette itération ? Cette action est irréversible.')) {
      return
    }

    setIterationDeleteLoading(iterationId)
    try {
      const { error } = await supabase
        .from('design_iterations')
        .delete()
        .eq('id', iterationId)

      if (error) throw error

      // Mettre à jour les projets localement
      setProjects(prev => prev.map(project => {
        if (project.design_iterations?.some(iter => iter.id === iterationId)) {
          return {
            ...project,
            design_iterations: project.design_iterations.filter(iter => iter.id !== iterationId)
          }
        }
        return project
      }))
      
      if (selectedProject) {
        const updatedIterations = selectedProject.design_iterations.filter(iter => iter.id !== iterationId)
        setSelectedProject({
          ...selectedProject,
          design_iterations: updatedIterations
        })
        
        if (selectedIteration?.id === iterationId) {
          setSelectedIteration(updatedIterations.length > 0 ? updatedIterations[0] : null)
        }
      }

    } catch (error) {
      console.error('Erreur suppression itération:', error)
      alert('Erreur lors de la suppression de l\'itération')
    } finally {
      setIterationDeleteLoading(null)
    }
  }

  const handleCompleteProject = async (projectId) => {
    setCompleteLoading(projectId)
    try {
      const { error } = await supabase
        .from('design_projects')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) throw error

      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status: 'completed' } : p
      ))

      calculateStats(projects.map(p =>
        p.id === projectId ? { ...p, status: 'completed' } : p
      ))
    } catch (error) {
      console.error('Erreur complétion projet:', error)
      alert('Erreur lors de la finalisation du projet')
    } finally {
      setCompleteLoading(null)
    }
  }

  const handleEditProject = (project) => {
    const params = new URLSearchParams({
      edit: project.id,
      title: project.project_name || '',
      category: project.category || '',
      focus: project.design_focus || '',
      style: project.design_style || '',
      aspect: project.aspect || 'DFM',
      description: project.description || '',
      prompt: project.prompt || '',
      sketch: project.sketch_url || ''
    })

    if (project.type === 'iterative') {
      router.push(`/dashboard/iterative-design?${params.toString()}`)
    } else {
      router.push(`/dashboard/design?${params.toString()}`)
    }
  }

  const handleContinueIterativeProject = (project) => {
    router.push(`/dashboard/iterative-design?continue=${project.id}`)
  }

  const toggleExpand = (section) => {
    setExpandedDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: styles.badge, bg: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'En cours', color: styles.badge, bg: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Terminé', color: styles.badge, bg: 'bg-green-100 text-green-800' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`${config.color} ${config.bg}`}>
        {config.label}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      standard: { label: 'Standard', color: styles.badgeInfo, icon: '⚡' },
      iterative: { label: 'Itératif', color: styles.badgePurple, icon: '🔄' }
    }
    const config = typeConfig[type] || typeConfig.standard
    return (
      <span className={`${styles.badge} ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const getCategoryBadge = (category) => {
    const colors = {
      'Électronique Grand Public': 'bg-blue-100 text-blue-800',
      'Mobilier': 'bg-green-100 text-green-800',
      'Transport': 'bg-purple-100 text-purple-800',
      'Électroménager': 'bg-orange-100 text-orange-800',
      'Équipement Industriel': 'bg-red-100 text-red-800',
      'Éclairage': 'bg-indigo-100 text-indigo-800',
      'Vêtements Connectés': 'bg-pink-100 text-pink-800',
      'Vêtements': 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getScoreColor = (score) => {
    if (!score) return styles.badgeInfo
    if (score >= 0.8) return styles.badgeSuccess
    if (score >= 0.6) return styles.badgeWarning
    return styles.badgeError
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderSketchSection = (project, sketchData) => {
    if (!sketchData.sketch_url && !sketchData.sketch_data) return null

    return (
      <div className={styles.card}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Croquis Original</h3>
          <span className={`${styles.badge} ${styles.badgeWarning}`}>🎨 Sketch</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aperçu du croquis */}
          <div>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 aspect-square">
              {sketchData.sketch_url ? (
                <img
                  src={sketchData.sketch_url}
                  alt="Croquis du projet"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNNjAgNzVINjBWODVINjBWNzVaTTE0MCA3NUg4NVY4NUgxNDBWNzVaTTYwIDEwMEg2MFYxMTBINjBWMTBaTTE0MCAxMDBIODVWMTEwSDE0MFYxMDJaTTYwIDEyNUg2MFYxMzVINjBWMTI1Wk0xNDAgMTI1SDg1VjEzNUgxNDBWMTI1WiIgZmlsbD0iI2I4YjhiOCIvPjwvc3ZnPg=='
                  }}
                />
              ) : sketchData.sketch_data ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <p className="text-sm text-gray-500">Croquis disponible</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Boutons de téléchargement */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {sketchData.sketch_url && (
                <EnhancedDownloadButton
                  href={sketchData.sketch_url}
                  filename={`croquis-${project.project_name || project.title}.png`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger PNG
                </EnhancedDownloadButton>
              )}

              {sketchData.sketch_data && (
                <button
                  onClick={() => {
                    const blob = new Blob([sketchData.sketch_data], { type: 'application/json' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `croquis-${project.project_name || project.title}.json`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger JSON
                </button>
              )}
            </div>
          </div>

          {/* Métadonnées du croquis */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2">Métadonnées du Croquis</label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {sketchData.sketch_metadata && Object.keys(sketchData.sketch_metadata).length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {sketchData.sketch_metadata.filename && (
                      <p><span className="font-medium">Fichier:</span> {sketchData.sketch_metadata.filename}</p>
                    )}
                    {sketchData.sketch_metadata.size && (
                      <p><span className="font-medium">Taille:</span> {sketchData.sketch_metadata.size}</p>
                    )}
                    {sketchData.sketch_metadata.type && (
                      <p><span className="font-medium">Type:</span> {sketchData.sketch_metadata.type}</p>
                    )}
                    {sketchData.sketch_metadata.created_at && (
                      <p><span className="font-medium">Date de création:</span> {formatDate(sketchData.sketch_metadata.created_at)}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune métadonnée disponible</p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Information</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ce croquis a été utilisé comme référence pour les générations d'images avec ControlNet. 
                    Il guide la structure et la composition des designs générés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderProjectDetails = (project) => {
    if (!project) return null

    const iterations = project.design_iterations || []
    const refinements = selectedProjectDetails?.design_refinements || []
    const refinementHistory = selectedProjectDetails?.dfx_refinement_history || []
    const hasSketch = sketchData.sketch_url || sketchData.sketch_data

    return (
      <div className="space-y-6">
        {/* En-tête du projet */}
        <div className={styles.card}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {project.project_name || project.title}
                </h2>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(project.status)}
                  {getTypeBadge(project.type)}
                  <span className={`${styles.badge} ${getCategoryBadge(project.category)}`}>
                    {project.category}
                  </span>
                  {project.is_project_public && (
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      🌐 Public
                    </span>
                  )}
                </div>
              </div>
              
              {/* Score DfX */}
              <div className="flex items-center space-x-4">
                {project.dfx_best_score !== null && project.dfx_best_score !== undefined && (
                  <DfxScoreDisplay 
                    score={project.dfx_best_score} 
                    qualifier={project.dfx_best_score >= 0.8 ? 'Excellent' : project.dfx_best_score >= 0.6 ? 'Bon' : 'À améliorer'}
                    showLabel={true}
                  />
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(project.created_at)}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {iterations.length} itération{iterations.length !== 1 ? 's' : ''}
                  </span>
                  {hasSketch && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Avec croquis
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton de téléchargement du projet complet */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => downloadProjectAsZip(project)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Télécharger ZIP
              </button>
            </div>
          </div>

          {/* Description et Prompt */}
          <div className="space-y-6 mt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2">Description du Projet</label>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {project.description || 'Aucune description fournie'}
              </p>
            </div>
            
            {project.prompt && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2">Prompt Principal</label>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-700">{project.prompt}</p>
                  <div className="mt-3">
                    <EnhancedDownloadButton
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(project.prompt)}`}
                      filename={`prompt-${project.project_name || project.title}.txt`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Télécharger le prompt
                    </EnhancedDownloadButton>
                  </div>
                </div>
              </div>
            )}

            {/* Détails techniques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Focus Design</p>
                <p className="text-gray-900 font-semibold">{project.design_focus || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Style</p>
                <p className="text-gray-900 font-semibold">{project.design_style || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Aspect DfX</p>
                <p className="text-gray-900 font-semibold">{project.aspect || 'DFM'}</p>
              </div>
            </div>
          </div>

          {/* Métriques DfX globales */}
          {project.last_dfx_metrics && Object.keys(project.last_dfx_metrics).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="text-sm font-semibold text-gray-700 mb-4 block">Résumé DfX</label>
              <DfxMetricsPanel 
                metrics={project.last_dfx_metrics}
                aspect={project.aspect}
                score={project.dfx_best_score}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Section Croquis (si disponible) */}
        {hasSketch && renderSketchSection(project, sketchData)}

        {/* Itérations */}
        {iterations.length > 0 && (
          <div className={styles.card}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Itérations ({iterations.length})
              </h3>
              {detailsLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Chargement...
                </div>
              )}
            </div>

            {/* Options de téléchargement en masse */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">Télécharger toutes les images</p>
                  <p className="text-sm text-blue-700">Téléchargez toutes les itérations d'un coup</p>
                </div>
                <button
                  onClick={() => downloadAllIterations(project)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Télécharger tout ({iterations.length})
                </button>
              </div>
            </div>

            {/* Liste des itérations */}
            <div className="space-y-4">
              {iterations.map((iteration) => (
                <EnhancedIterationCard
                  key={iteration.id}
                  iteration={iteration}
                  project={project}
                  onSelect={setSelectedIteration}
                  isSelected={selectedIteration?.id === iteration.id}
                  onDelete={handleDeleteIteration}
                />
              ))}
            </div>

            {/* Statistiques des itérations */}
            {iterations.length > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4">Statistiques des Itérations</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">{iterations.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.max(...iterations.filter(i => i.dfx_score).map(i => i.dfx_score * 100), 0).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Meilleur score</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {iterations.filter(i => i.generation_mode === 'sketch-to-image').length}
                    </p>
                    <p className="text-sm text-gray-600">Avec croquis</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {iterations.filter(i => i.generation_mode === 'refinement').length}
                    </p>
                    <p className="text-sm text-gray-600">Raffinements</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Raffinements */}
        {refinements.length > 0 && (
          <div className={styles.card}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Raffinements ({refinements.length})</h3>
            <div className="space-y-4">
              {refinements.map((refinement) => (
                <div key={refinement.id} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Original</p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border">{refinement.original_prompt}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">Raffiné</p>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border">{refinement.refined_prompt}</p>
                    </div>
                    {refinement.improvement_suggestions && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-purple-700 mb-1">Suggestions</p>
                        <p className="text-sm text-gray-700">{refinement.improvement_suggestions}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {formatDate(refinement.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique DfX */}
        {refinementHistory.length > 0 && (
          <div className={styles.card}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Historique DfX ({refinementHistory.length})</h3>
            <div className="space-y-4">
              {refinementHistory.map((history) => (
                <div key={history.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Amélioration</p>
                      <p className="text-lg font-bold text-green-600">
                        +{history.improvement_percentage || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Score initial</p>
                      <p className="text-sm text-gray-600">{((history.original_score || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Score final</p>
                      <p className="text-sm text-gray-600">{((history.refined_score || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-sm text-gray-600">{formatDate(history.created_at)}</p>
                    </div>
                  </div>
                  {history.recommendations_applied && Array.isArray(history.recommendations_applied) && history.recommendations_applied.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Recommandations appliquées:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                        {history.recommendations_applied.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions du projet */}
        <div className={styles.card}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Actions du Projet</h3>
              <p className="text-sm text-gray-600">Gérez et téléchargez votre projet</p>
            </div>
            <div className="flex space-x-3">
              {project.status !== 'completed' && (
                <button
                  onClick={() => handleCompleteProject(project.id)}
                  disabled={completeLoading === project.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {completeLoading === project.id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Finalisation...
                    </>
                  ) : (
                    '✅ Terminer'
                  )}
                </button>
              )}
              <button
                onClick={() => handleEditProject(project)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              {project.type === 'iterative' && project.status !== 'completed' && (
                <button
                  onClick={() => handleContinueIterativeProject(project)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Continuer
                </button>
              )}
              <button
                onClick={() => handleDeleteProject(project.id)}
                disabled={deleteLoading === project.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {deleteLoading === project.id ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const downloadAllIterations = async (project) => {
    try {
      const iterations = project.design_iterations || []
      
      // Pour chaque itération, télécharger l'image
      for (const iteration of iterations) {
        if (iteration.image_url) {
          const response = await fetch(iteration.image_url)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `iteration-${iteration.iteration_number}-${project.project_name || project.title}.png`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          // Petit délai entre chaque téléchargement
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      alert(`Toutes les ${iterations.length} itérations ont été téléchargées avec succès!`)
    } catch (error) {
      console.error('Erreur téléchargement multiple:', error)
      alert('Erreur lors du téléchargement des itérations')
    }
  }

  const downloadProjectAsZip = async (project) => {
    try {
      const iterations = project.design_iterations || []
      const projectName = project.project_name || project.title
      
      // Créer un objet contenant toutes les données du projet
      const projectData = {
        projet: {
          nom: projectName,
          description: project.description,
          categorie: project.category,
          focus: project.design_focus,
          style: project.design_style,
          aspect: project.aspect,
          prompt: project.prompt,
          score_dfx: project.dfx_best_score,
          date_creation: project.created_at,
          statut: project.status
        },
        iterations: iterations.map(iter => ({
          numero: iter.iteration_number,
          prompt: iter.prompt,
          score_dfx: iter.dfx_score,
          mode_generation: iter.generation_mode,
          modele: iter.model_used,
          seed: iter.seed,
          specifications: iter.specifications,
          date_creation: iter.created_at
        })),
        raffinements: selectedProjectDetails?.design_refinements || [],
        historique_dfx: selectedProjectDetails?.dfx_refinement_history || []
      }
      
      // Convertir en JSON
      const jsonData = JSON.stringify(projectData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName}-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      alert(`Projet exporté avec succès! ${iterations.length} itérations incluses.`)
    } catch (error) {
      console.error('Erreur export projet:', error)
      alert('Erreur lors de l\'export du projet')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <DashboardHeader user={user} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="xl" />
                <p className="mt-4 text-gray-600">Chargement de vos projets...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                Mes Projets de Design
              </h1>
              <p className="mt-2 text-gray-600">
                Visualisez, gérez et téléchargez tous vos projets avec analyse DfX complète
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <Link
                href="/dashboard/design"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouveau Design
              </Link>
              <Link
                href="/dashboard/iterative-design"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Design Itératif
              </Link>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: '📊', color: 'from-blue-500 to-blue-600' },
            { label: 'Terminés', value: stats.completed, icon: '✅', color: 'from-green-500 to-green-600' },
            { label: 'En cours', value: stats.inProgress, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
            { label: 'Brouillons', value: stats.drafts, icon: '📝', color: 'from-gray-500 to-gray-600' },
            { label: 'Standard', value: stats.standard, icon: '⚡', color: 'from-indigo-500 to-indigo-600' },
            { label: 'Itératif', value: stats.iterative, icon: '🔄', color: 'from-purple-500 to-purple-600' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-lg">{stat.icon}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des projets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Rechercher un projet..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Toutes catégories</option>
                    {Array.from(stats.categories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">Tous types</option>
                    <option value="standard">Standard</option>
                    <option value="iterative">Itératif</option>
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setCategoryFilter('all')
                      setTypeFilter('all')
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredProjects.length} projet{filteredProjects.length !== 1 ? 's' : ''}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {projects.length} au total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer group ${
                      selectedProject?.id === project.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start space-x-3">
                      {project.design_iterations?.[0]?.image_url && (
                        <div className="flex-shrink-0 w-16 h-16 relative">
                          <img
                            src={project.design_iterations[0].image_url}
                            alt="Aperçu"
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {project.design_iterations?.length || 0}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.project_name || project.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {getStatusBadge(project.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 truncate">
                          {project.category}
                        </p>
                        {project.dfx_best_score !== null && project.dfx_best_score !== undefined && (
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              project.dfx_best_score >= 0.8 ? 'bg-green-100 text-green-800' :
                              project.dfx_best_score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {(project.dfx_best_score * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {project.design_iterations?.length || 0} itération{project.design_iterations?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredProjects.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="w-16 h-16 text-gray-300 mx-auto mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
                    <p className="text-gray-500 mb-4">
                      {projects.length === 0 
                        ? "Commencez par créer votre premier projet !"
                        : "Ajustez vos critères de recherche."
                      }
                    </p>
                    {projects.length === 0 && (
                      <div className="space-y-3">
                        <Link
                          href="/dashboard/design"
                          className="block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Conception Rapide
                        </Link>
                        <Link
                          href="/dashboard/iterative-design"
                          className="block px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Design Itératif
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails du projet */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              detailsLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Chargement des détails du projet...</p>
                </div>
              ) : (
                renderProjectDetails(selectedProject)
              )
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 text-gray-300 mx-auto mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez un projet</h3>
                <p className="text-gray-500">
                  Choisissez un projet dans la liste pour voir tous ses détails
                </p>
                <div className="mt-6">
                  <svg className="w-12 h-12 text-blue-200 mx-auto animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <p className="mt-1">
                {projects.length} projets • {stats.completed} terminés • {stats.inProgress} en cours
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Haut de page
              </button>
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                Tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import projectDataFallback from '../data/project.json'

const ProjectContext = createContext(null)

const PROJECT_SLUG = (import.meta.env.VITE_PROJECT_SLUG ?? 'las-conchas').trim()

export function ProjectProvider({ children }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchProject = useCallback(async () => {
    try {
      const [{ data: projectRow, error: projErr }, { data: unitRows, error: unitsErr }] =
        await Promise.all([
          supabase.from('projects').select('*').eq('slug', PROJECT_SLUG).single(),
          supabase.from('units').select('*').eq('project_slug', PROJECT_SLUG).order('id'),
        ])

      if (projErr) throw projErr
      if (unitsErr) throw unitsErr

      setData({
        project: {
          name:          projectRow.name,
          nameEN:        projectRow.name_en,
          subtitle:      projectRow.subtitle,
          tagline:       projectRow.tagline    ?? null,
          taglineEN:     projectRow.tagline_en ?? null,
          architect:     projectRow.architect,
          description:   projectRow.description,
          descriptionEN: projectRow.description_en,
          heroVideo:     projectRow.hero_video,
          heroImage:     projectRow.hero_image,
          aerialImage:   projectRow.aerial_image,
          accentColor:   projectRow.accent_color,
          gallery:         projectRow.gallery          ?? [],
          exteriorImages:  projectRow.exterior_images  ?? [],
          floorPlan:       projectRow.floor_plan        ?? null,
        },
        building:      projectRow.building_data    ?? {},
        amenities:     projectRow.amenities       ?? [],
        materials:     projectRow.materials       ?? {},
        construction:  projectRow.construction_data ?? null,
        nearby:        projectRow.nearby          ?? projectDataFallback.nearby ?? [],
        units:     unitRows                  ?? [],
      })
      setError(null)
    } catch (err) {
      console.warn('[TVBS] Supabase unavailable, using local fallback:', err.message)
      setData(projectDataFallback)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProject() }, [fetchProject])

  return (
    <ProjectContext.Provider value={{ ...data, loading, error, refresh: fetchProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}

export function useUnit(id) {
  const { units } = useProject()
  return units?.find(u => u.id === id || u.slug === id) ?? null
}

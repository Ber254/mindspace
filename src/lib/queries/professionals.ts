import sql from '@/lib/db'
import type { Professional, ProfessionalModule, SocialLink } from '@/lib/types'

export async function getProfessionalsPublic(tenantId: string): Promise<Professional[]> {
  const rows = await sql`
    SELECT
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pm.id, 'professional_id', pm.professional_id,
            'dia_semana', pm.dia_semana, 'franja', pm.franja, 'active', pm.active
          )
        ) FILTER (WHERE pm.id IS NOT NULL AND pm.active = true),
        '[]'
      ) AS modules,
      COALESCE(
        json_agg(
          json_build_object(
            'id', psl.id, 'red', psl.red, 'label', psl.label, 'url', psl.url, 'position', 0
          )
        ) FILTER (WHERE psl.id IS NOT NULL),
        '[]'
      ) AS social_links
    FROM professionals p
    LEFT JOIN professional_modules pm
      ON pm.professional_id = p.id AND pm.active = true
    LEFT JOIN professional_social_links psl
      ON psl.professional_id = p.id
    WHERE p.tenant_id = ${tenantId} AND p.active = true
    GROUP BY p.id
    ORDER BY p.nombre
  `

  return rows as unknown as Professional[]
}

export async function getProfessionalById(
  tenantId: string,
  professionalId: string
): Promise<Professional | null> {
  const [row] = await sql`
    SELECT p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pm.id, 'professional_id', pm.professional_id,
            'dia_semana', pm.dia_semana, 'franja', pm.franja, 'active', pm.active
          )
        ) FILTER (WHERE pm.id IS NOT NULL AND pm.active = true),
        '[]'
      ) AS modules
    FROM professionals p
    LEFT JOIN professional_modules pm
      ON pm.professional_id = p.id AND pm.active = true
    WHERE p.tenant_id = ${tenantId}
      AND p.id = ${professionalId}
      AND p.active = true
    GROUP BY p.id
  `
  return (row as unknown as Professional) ?? null
}

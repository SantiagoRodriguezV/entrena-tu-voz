export type SectionNivelStatus = 'available' | 'locked' | 'placeholder';

export type SectionNivel = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: SectionNivelStatus;
  description?: string;
};

/** Capítulos (Niveles) dentro de Aprende — las Lecciones viven dentro de cada uno */
export const SECTION_NIVELES: SectionNivel[] = [
  {
    id: 'nivel-1',
    number: 1,
    title: 'CONCEPTOS BÁSICOS',
    subtitle: 'NIVEL 1',
    status: 'available',
    description: 'Fundamentos de canto y distorsión vocal.',
  },
  {
    id: 'nivel-2',
    number: 2,
    title: 'REGISTROS Y RESONANCIA',
    subtitle: 'NIVEL 2',
    status: 'placeholder',
    description: 'Profundiza en registros y resonadores.',
  },
  {
    id: 'nivel-3',
    number: 3,
    title: 'ARTICULACIÓN AVANZADA',
    subtitle: 'NIVEL 3',
    status: 'placeholder',
    description: 'Precisión articulatoria en frases largas.',
  },
  {
    id: 'nivel-4',
    number: 4,
    title: 'DISTORSIONES II',
    subtitle: 'NIVEL 4',
    status: 'placeholder',
    description: 'Texturas extremas con control.',
  },
  {
    id: 'nivel-5',
    number: 5,
    title: 'EXPRESIÓN Y ESTILO',
    subtitle: 'NIVEL 5',
    status: 'placeholder',
    description: 'Aplica técnica a repertorio real.',
  },
];

export function getSectionNivel(id: string): SectionNivel | undefined {
  return SECTION_NIVELES.find((n) => n.id === id);
}

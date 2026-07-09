import { Level } from '../types/exercise';

export const INITIAL_LEVELS: Level[] = [
  {
    id: 'l1',
    title: 'Calentamiento inicial',
    status: 'completed',
    category: 'canto',
    mapNumber: 1,
    lessonNumber: 0,
    description: 'Prepara tu voz con ejercicios suaves antes de entrenar.',
    estimatedMinutes: 3,
  },
  {
    id: 'l2',
    title: 'Canto 1: Registro Vocal',
    status: 'unlocked',
    category: 'canto',
    mapNumber: 2,
    lessonId: 'register-change',
    lessonNumber: 1,
    description:
      'Explora tu registro vocal con ejercicios guiados de altura, volumen y duración.',
    estimatedMinutes: 8,
  },
  {
    id: 'l3',
    title: 'Distorsiones 1: Fry Sound',
    status: 'locked',
    category: 'distorsiones',
    mapNumber: 3,
    lessonNumber: 2,
    description:
      'Ten un primer acercamiento con las distorsiones vocales con el fry sound.',
    estimatedMinutes: 6,
  },
  {
    id: 'l4',
    title: 'Canto 2: Sirena guiada',
    status: 'locked',
    category: 'canto',
    mapNumber: 4,
    lessonNumber: 3,
    description: 'Conecta registros con un ejercicio de sirena controlada.',
    estimatedMinutes: 7,
  },
  {
    id: 'l5',
    title: 'Canto 3: Afinación básica',
    status: 'locked',
    category: 'canto',
    mapNumber: 5,
    lessonNumber: 4,
    description: 'Refina tu afinación con notas sostenidas y patrones simples.',
    estimatedMinutes: 8,
  },
  {
    id: 'l6',
    title: 'Canto 4: Control de volumen',
    status: 'locked',
    category: 'canto',
    mapNumber: 6,
    lessonNumber: 5,
    description: 'Aprende a modular el volumen sin perder estabilidad.',
    estimatedMinutes: 7,
  },
  {
    id: 'l7',
    title: 'Distorsiones 2: Ritmo y duración',
    status: 'locked',
    category: 'distorsiones',
    mapNumber: 7,
    lessonNumber: 6,
    description: 'Combina distorsión con control rítmico y duración.',
    estimatedMinutes: 8,
  },
  {
    id: 'l8',
    title: 'Canto 5: Técnica aplicada',
    status: 'locked',
    category: 'canto',
    mapNumber: 8,
    lessonNumber: 7,
    description: 'Integra lo aprendido en un ejercicio de técnica completa.',
    estimatedMinutes: 10,
  },
];

/** @deprecated use INITIAL_LEVELS */
export const DEMO_LEVELS = INITIAL_LEVELS;

export const DEMO_USER = {
  level: 3,
  streak: 5,
  warmupActive: true,
  sectionTitle: 'CONCEPTOS BÁSICOS',
  sectionSubtitle: 'NIVEL 1',
};

import { VocalResultType } from '../types/vocalAnalysis';

export type FeedbackContent = {
  title: string;
  indicators?: { label: string; value: string }[];
  message: string;
};

export const feedbackByResult: Record<VocalResultType, FeedbackContent> = {
  successful: {
    title: 'Te acercaste al patrón esperado',
    indicators: [
      { label: 'Dirección ascendente', value: 'Lograda' },
      { label: 'Continuidad', value: 'Estable' },
      { label: 'Duración', value: 'Completada' },
    ],
    message:
      'La sirena siguió la dirección general del ejercicio. En una próxima práctica, intenta mantener la transición fluida sin aumentar innecesariamente el volumen.',
  },
  partial: {
    title: 'Vas por buen camino',
    indicators: [
      { label: 'Dirección ascendente', value: 'Lograda' },
      { label: 'Continuidad', value: 'Variable' },
      { label: 'Duración', value: 'Completada' },
    ],
    message:
      'Lograste subir de altura, pero aparecieron algunas interrupciones. Prueba realizar el recorrido más lentamente y con una intensidad cómoda.',
  },
  insufficient_audio: {
    title: 'No pudimos escuchar suficiente voz',
    message:
      'Acércate un poco al micrófono y vuelve a intentarlo. No es necesario cantar más fuerte.',
  },
  interrupted: {
    title: 'El recorrido quedó incompleto',
    message:
      'Intenta mantener la emisión hasta que el indicador llegue al final.',
  },
  possible_effort: {
    title: 'Prueba nuevamente con menos intensidad',
    message:
      'El patrón recibido se alejó del ejemplo esperado. Repite el ejercicio con un sonido más cómodo y moderado. Detente si aparece dolor o irritación.',
  },
};

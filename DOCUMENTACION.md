# Entrena tu Voz — Documentación del prototipo

Demo académica de una aplicación móvil para aprendizaje vocal, construida con **Expo 57**, **React Native**, **TypeScript** y detección de voz en tiempo real. Inspirada en la lógica de apps como Duolingo (progresión y gamificación) y Yousician (ejercicios musicales con indicador de voz).

---

## Índice

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Historial de conversaciones](#historial-de-conversaciones)
3. [Cómo funciona el prototipo](#cómo-funciona-el-prototipo)
4. [Flujo de pantallas](#flujo-de-pantallas)
5. [Sistema de ejercicios vocales](#sistema-de-ejercicios-vocales)
6. [Sistema de puntaje y XP](#sistema-de-puntaje-y-xp)
7. [Tecnologías y arquitectura](#tecnologías-y-arquitectura)
8. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
9. [Estructura de carpetas](#estructura-de-carpetas)
10. [Limitaciones conocidas](#limitaciones-conocidas)

---

## Resumen del proyecto

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | entrena-tu-voz |
| **Plataforma** | Android (principal), Web (desarrollo), iOS (posible con dev build) |
| **Framework** | Expo SDK 57 + React Native 0.86 |
| **Propósito** | Prototipo testeable con usuarios y evaluadores académicos |
| **Lección jugable** | Canto 1: Registro Vocal (6 ejercicios de calentamiento) |
| **Micrófono** | Real en Android dev build; simulado en web |

---

## Historial de conversaciones

Este documento resume el trabajo realizado en las sesiones de desarrollo con Cursor (asistente de IA). Las fases siguen el orden cronológico de las peticiones.

### Fase 1 — Demo vocal académica inicial

**Petición:** Crear una demo funcional en Expo para Android que comunique la lógica de una app de aprendizaje vocal, sin ser la app final pero sí usable en testeo académico.

**Se implementó:**
- Menú principal con mapa de progreso vertical
- Niveles completados, desbloqueados y bloqueados
- Barra superior con estado del usuario
- Ejercicio vocal tipo Yousician con visualización de notas
- Indicador de voz que se mueve según altura detectada
- Flujo de pasos: bienvenida → concepto → preparación → ejercicio → análisis → feedback → completado
- Panel de investigador para simular distintos escenarios de voz (demo sin micrófono real)
- Tema visual oscuro

**Correcciones:** Se resolvieron errores de bundling y compatibilidad con Expo 57.

---

### Fase 2 — Micrófono real, modo oscuro y sistema XP

**Petición:**
1. Todo el prototipo en modo oscuro
2. Micrófono real en tiempo real (no simulación)
3. Sistema de puntaje con XP al terminar ejercicios y barra animada al completar la lección
4. Estabilizador de pitch para movimiento más fluido del indicador
5. Lógica tipo Yousician: pausa si la nota es incorrecta, pintado de notas según precisión

**Se implementó:**
- Integración con `react-native-tuner-engine` para detección de pitch en Android
- Split `.web` / `.native` para evitar crash en web
- `RealVocalEngine` + `useVocalRecorder` para frames vocales en tiempo real
- `pitchStabilizer` para suavizar el movimiento vertical
- `exerciseScoring` + `xpSystem` con XP proporcional a la precisión
- `ExperienceBar` animada en pantalla de lección completada
- `ExerciseMiniResultScreen` entre ejercicios

---

### Fase 3 — Mapa, navegación y flujo de escucha

**Petición:** Rediseñar el menú según mockups de diseño (ASSETSSSS/Menú).

**Se implementó:**
- Mapa de progreso con nodos, plataformas y líneas de conexión (`#0D6E74`)
- Niveles: Calentamiento inicial (completado), **Canto 1: Registro Vocal** (jugable), **Distorsiones 1: Fry Sound** (se desbloquea al completar)
- Barra inferior con 4 pestañas: Desafíos, Aprende, Entrena, Perfil
- Íconos de puntaje y racha en barra superior
- Flujo de lección: intro → escucha de notas → canto → mini-resultado (×6) → lección completada
- `ExerciseListenScreen` para escuchar antes de cantar
- Panel de información al tocar un nivel (`LevelInfoPanel`)
- Animación de desbloqueo de niveles
- Scroll automático al nivel actual en el mapa

---

### Fase 4 — Refinamiento UI del mapa

**Petición:** Ajustes visuales según mockups adicionales.

**Se implementó:**
- Pantalla **“Rota tu celular”** (`RotateDeviceScreen`) antes de los ejercicios
- Botones Continuar/Repetir (inicialmente con PNG, luego replicados en código)
- Números Bungee 1–8 sobre las plataformas del mapa
- Trazo SVG con posiciones reales de nodos (`onLayout`)
- Panel de nivel anclado bajo el nodo (sin backdrop oscuro)
- Animación plataforma available → selected
- Margen inferior de 50px en barra de navegación (Samsung)

---

### Fase 5 — Barra superior e inferior

**Petición:**
1. Reemplazar ícono de puntaje por badge circular de nivel con anillo de XP (`nivel.png` como referencia)
2. Etiquetas Bungee bajo íconos del nav: 8pt, `#B2B2B2`, line-height 120%, letter-spacing 10%
3. Barra inferior con margen lateral 64px

**Se implementó:**
- `LevelXpBadge`: anillo circular de progreso + número de nivel
- `TopStatusBar` actualizado
- `BottomNavBar` con etiquetas y espaciado ajustado

---

### Fase 6 — Ejercicios vocales estilo calentamiento

**Petición:**
1. Botón repetir para re-escuchar la transición de sonido durante el ejercicio
2. Cada nota dura 1 segundo
3. UI según mockup de calentamiento: rectángulos de nota, fondo opaco, animación fade in/out al iluminar cada nota
4. 6 ejercicios progresivos (máx. 4 notas) con dificultad creciente
5. Botones Continuar y Repetir replicados en código (sin PNG), estilo fidedigno a los mockups

**Se implementó:**
- `PillActionButton` (variantes `continue` y `repeat`) en código
- Componentes `WarmupExerciseShell`, `WarmupNoteRect`, `WarmupNoteStaircase`
- `ExerciseListenScreen` rediseñada: escucha con animación, botón REPETIR, transición al canto cuando el micrófono detecta voz
- `VocalExerciseScreen` rediseñada con shell de calentamiento
- Mecánicas vocales: retroceso al dejar de cantar; pausa al final de nota si la altura es incorrecta (con penalización de puntaje)
- `lessonExercises.ts` con 6 ejercicios nuevos (1–4 notas, 1000 ms cada una)

---

## Cómo funciona el prototipo

### Vista general

```
┌─────────────────────────────────────────────────────────┐
│  HOME (mapa)                                            │
│  ├── Barra superior: nivel XP, racha, configuración     │
│  ├── Mapa vertical con nodos de lección                 │
│  └── Barra inferior: Desafíos | Aprende | Entrena | Perfil │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (tocar nivel desbloqueado)
┌─────────────────────────────────────────────────────────┐
│  FLUJO DE LECCIÓN (6 ejercicios)                        │
│  Intro → Rotar celular → Escuchar → Cantar → Resultado  │
│  (repetir ×6) → Lección completada → Volver al mapa     │
└─────────────────────────────────────────────────────────┘
```

### Mapa de progreso

- Los niveles se muestran como **plataformas** en un camino vertical.
- Estados: **completado**, **desbloqueado** (jugable), **bloqueado**.
- Al tocar un nivel desbloqueado aparece un panel con descripción, tiempo estimado y botón **CONTINUAR**.
- Al completar "Canto 1: Registro Vocal", se desbloquea "Distorsiones 1: Fry Sound".
- El mapa hace scroll automático al nivel actual.

### Flujo de pantallas

| Pantalla | Descripción |
|----------|-------------|
| `HomeMapScreen` | Mapa principal con niveles y navegación |
| `LessonIntroScreen` | Introducción a la lección seleccionada |
| `RotateDeviceScreen` | Pide rotar el celular a horizontal (landscape) |
| `ExerciseListenScreen` | Reproduce las notas; botón REPETIR; espera voz para cantar |
| `VocalExerciseScreen` | Ejercicio de canto con playhead y detección de voz |
| `ExerciseMiniResultScreen` | Resultado parcial tras cada ejercicio (XP, precisión) |
| `LessonCompletedScreen` | Resumen final con barra de XP animada |

### Sistema de ejercicios vocales

Cada lección tiene **6 ejercicios** de calentamiento. Cada nota dura **1 segundo** y las notas planas se encadenan sin pausa.

| Ejercicio | Notas | Patrón |
|-----------|-------|--------|
| 1 | 1 | C3 |
| 2 | 2 | C3 → D3 |
| 3 | 3 | C3 → D3 → E3 |
| 4 | 4 | C3 → D3 → E3 → G3 |
| 5 | 4 | G3 → E3 → D3 → C3 (descendente) |
| 6 | 4 | C3 → D3 → G3 → E3 (sube, sube, pico, baja) |

**Fase de escucha:**
- Se muestran rectángulos de nota en escalera según la altura.
- Al sonar cada nota, el rectángulo se ilumina (fade in teal) durante 1 s y luego fade out.
- El botón **REPETIR** vuelve a reproducir la secuencia.
- Tras la escucha, la app espera hasta que el micrófono detecte voz para iniciar el canto.

**Fase de canto:**
- UI estilo mockup de calentamiento: título teal, vocal "AA", banda opaca con notas y playhead.
- El indicador de voz sigue la altura cantada (con estabilización y snap asistivo).
- Si dejas de cantar dentro de una nota, el timeline **retrocede** al inicio de esa nota.
- Si al llegar al final la altura es incorrecta, el playhead **se congela** hasta alcanzar la nota (penaliza puntaje).
- Las notas se colorean según precisión de pitch, volumen y duración.

### Sistema de puntaje y XP

Cada nota se evalúa con:
- **Pitch** (45%): qué tan cerca estás de la frecuencia objetivo
- **Volumen** (25%): intensidad moderada preferida
- **Duración** (30%): tiempo sostenido en la nota

Al terminar cada ejercicio:
- Se muestra porcentaje de precisión y XP ganado.
- XP = función de la precisión global del ejercicio.

Al terminar la lección:
- Suma total de XP con animación en `ExperienceBar`.
- Opciones **REPETIR** lección o **CONTINUAR** al mapa.

### Panel de investigador

Accesible desde el mapa (modo desarrollo/demo). Permite simular escenarios de voz en web:
- Buen canto, pitch desviado, volumen bajo/alto, voz interrumpida, etc.

En Android con dev build se usa el micrófono real independientemente del escenario (salvo configuración específica).

---

## Tecnologías y arquitectura

```
App.tsx                    → Navegación global y estado de sesión
src/screens/               → Pantallas del flujo
src/components/            → UI reutilizable (mapa, botones, warmup)
src/audio/                 → Motor vocal, scoring, reproducción de notas
src/data/                  → Niveles, ejercicios, notas
src/hooks/                 → Progreso de niveles
src/theme/                 → Colores, tipografía, espaciado
```

**Audio:**
- `RealVocalEngine.native.ts` — pitch real con `react-native-tuner-engine`
- `RealVocalEngine.web.ts` — stub/demo con `DemoVocalEngine`
- `notePlayer.web.ts` / `.native.ts` — tonos sintéticos para escucha previa
- `pitchStabilizer.ts` — suavizado del indicador
- `useVocalRecorder.ts` — hook que expone `lastFrame` al UI

**Fuentes:**
- Bungee Regular (títulos, botones)
- Atkinson Hyperlegible (cuerpo)

---

## Cómo ejecutar el proyecto

### Requisitos
- Node.js 18+
- npm
- Para micrófono real: Android con development build

### Instalación

```bash
npm install
```

### Desarrollo (web — sin micrófono real)

```bash
npx expo start
```

Presiona `w` para abrir en navegador. El micrófono usa simulación/demo.

### Android con micrófono real

```bash
npx expo run:android
```

Genera un development build con permisos de micrófono y `react-native-tuner-engine`.

### Verificación TypeScript

```bash
npx tsc --noEmit
```

---

## Estructura de carpetas

```
├── App.tsx                 # Punto de entrada y navegación
├── assets/
│   ├── fonts/              # Bungee, Atkinson Hyperlegible
│   └── images/             # Íconos, botones, plataformas
├── ASSETSSSS/Menú/         # Mockups y assets de diseño originales
├── src/
│   ├── audio/              # Motor vocal, scoring, notas
│   ├── components/         # Componentes UI
│   │   └── warmup/         # UI ejercicios estilo calentamiento
│   ├── data/               # levels.ts, lessonExercises.ts
│   ├── hooks/              # useLevelProgress
│   ├── screens/            # Pantallas del flujo
│   ├── theme/              # colors, typography, spacing
│   └── types/              # TypeScript types
└── DOCUMENTACION.md        # Este archivo
```

---

## Limitaciones conocidas

| Limitación | Detalle |
|------------|---------|
| **Web** | No hay micrófono real; usa demo/simulación |
| **Expo Go** | Puede no soportar `react-native-tuner-engine`; usar `expo run:android` |
| **Pestañas** | Desafíos, Aprende y Perfil son placeholders |
| **Staccato / Glissando** | No implementados aún; solo notas planas encadenadas |
| **Lecciones** | Solo "Canto 1: Registro Vocal" es jugable de punta a punta |
| **Archivos legacy** | Algunos `*Step.tsx` y `ExerciseBriefScreen` del flujo antiguo permanecen sin borrar |

---

## Créditos y contexto académico

Prototipo desarrollado como parte del trabajo de **13vo Título** (titulación). Diseño visual basado en mockups en `ASSETSSSS/Menú/`. Desarrollo asistido con Cursor AI en sesiones iterativas de julio 2026.

---

*Última actualización: julio 2026*

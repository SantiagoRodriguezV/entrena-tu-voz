import { Rect, Text as SvgText } from 'react-native-svg';
import { getColorFromAccuracy } from '../audio/accuracyUtils';
import { colors, withOpacity } from '../theme/colors';
import { ExerciseNote } from '../types/exercise';

export type NotePaintSegment = {
  startRatio: number;
  endRatio: number;
  color: string;
};

type NoteBlockProps = {
  note: ExerciseNote;
  x: number;
  y: number;
  width: number;
  height: number;
  paintSegments: NotePaintSegment[];
  isActive: boolean;
};

export function NoteBlock({
  note,
  x,
  y,
  width,
  height,
  paintSegments,
  isActive,
}: NoteBlockProps) {
  const baseFill = isActive
    ? withOpacity(colors.secondary, 0.2)
    : withOpacity(colors.light, 0.09);
  const stroke = isActive ? colors.secondary : colors.signalLow;

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        ry={10}
        fill={baseFill}
        stroke={stroke}
        strokeWidth={2}
      />
      {paintSegments.map((segment, index) => {
        const segX = x + segment.startRatio * width;
        const segW = Math.max(0, (segment.endRatio - segment.startRatio) * width);
        return (
          <Rect
            key={`${note.id}-seg-${index}`}
            x={segX}
            y={y}
            width={segW}
            height={height}
            rx={10}
            ry={10}
            fill={segment.color}
            opacity={0.85}
          />
        );
      })}
      <SvgText
        x={x + width / 2}
        y={y + height / 2 + 5}
        fill="#FFFFFF"
        fontSize={13}
        fontWeight="bold"
        textAnchor="middle"
      >
        {note.label}
      </SvgText>
    </>
  );
}

export function buildPaintSegment(
  note: ExerciseNote,
  timeMs: number,
  detectedHz: number | null,
  noteStartMs: number,
  accuracyPercent: number,
): NotePaintSegment | null {
  if (detectedHz === null) return null;
  const noteEnd = note.startMs + note.durationMs;
  if (timeMs < note.startMs || timeMs > noteEnd) return null;

  const color = getColorFromAccuracy(accuracyPercent);
  const progressInNote = (timeMs - note.startMs) / note.durationMs;
  const prevProgress = Math.max(0, (noteStartMs - note.startMs) / note.durationMs);
  const startRatio = Math.min(prevProgress, progressInNote);
  const endRatio = progressInNote;

  if (endRatio <= startRatio) return null;

  return { startRatio, endRatio, color };
}

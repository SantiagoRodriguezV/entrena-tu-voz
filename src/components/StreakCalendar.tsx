import { StyleSheet, Text, View } from 'react-native';
import { DEMO_TODAY } from '../data/demoDates';
import { colors, palette } from '../theme/colors';
import { fonts, fontSizes } from '../theme/typography';
import { useResponsive } from '../theme/responsive';

type StreakCalendarProps = {
  exerciseDates: string[];
  today?: string;
};

const YEAR = 2026;
const MONTH = 6;
const MONTH_LABEL = 'Julio 2026';
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const BASE_CELL_SIZE = 36;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function StreakCalendar({
  exerciseDates,
  today = DEMO_TODAY,
}: StreakCalendarProps) {
  const { moderateScale } = useResponsive();
  const cellSize = moderateScale(BASE_CELL_SIZE);
  const innerSize = cellSize - 4;

  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const firstWeekday = getFirstWeekday(YEAR, MONTH);
  const exerciseSet = new Set(exerciseDates);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.monthLabel}>{MONTH_LABEL}</Text>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={`wd-${i}`} style={[styles.cellSlot, { width: cellSize, height: cellSize }]}>
            <Text style={styles.weekday}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <View
                key={`empty-${index}`}
                style={[styles.cellSlot, { width: cellSize, height: cellSize }]}
              />
            );
          }
          const dateStr = `${YEAR}-07-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const hasExercise = exerciseSet.has(dateStr);

          return (
            <View
              key={dateStr}
              style={[styles.cellSlot, { width: cellSize, height: cellSize }]}
            >
              <View
                style={[
                  styles.cellInner,
                  { width: innerSize, height: innerSize },
                  hasExercise && styles.exerciseDay,
                  isToday && styles.todayCell,
                  hasExercise && isToday && styles.exerciseTodayCell,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    hasExercise && styles.exerciseDayText,
                    isToday && !hasExercise && styles.todayText,
                    hasExercise && isToday && styles.exerciseTodayText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  monthLabel: {
    fontFamily: fonts.title,
    fontSize: fontSizes.md,
    color: colors.light,
    textAlign: 'center',
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cellSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weekday: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  dayText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  exerciseDay: {
    backgroundColor: palette.red,
  },
  exerciseDayText: {
    color: palette.light,
    fontWeight: '700',
  },
  todayCell: {
    borderColor: palette.turq,
  },
  todayText: {
    color: palette.light,
    fontWeight: '700',
  },
  exerciseTodayCell: {
    backgroundColor: palette.red,
    borderColor: palette.turq,
  },
  exerciseTodayText: {
    color: palette.light,
    fontWeight: '700',
  },
});

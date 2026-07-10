import { Pressable, StyleSheet, Text, View } from 'react-native';
import NavMenuActive from '../../assets/icons/nav-menu-active.svg';
import NavMenuInactive from '../../assets/icons/nav-menu-inactive.svg';
import NavAprendeActive from '../../assets/icons/nav-aprende-active.svg';
import NavAprendeInactive from '../../assets/icons/nav-aprende-inactive.svg';
import NavEntrenaActive from '../../assets/icons/nav-entrena-active.svg';
import NavEntrenaInactive from '../../assets/icons/nav-entrena-inactive.svg';
import NavDesafiosActive from '../../assets/icons/nav-desafios-active.svg';
import NavDesafiosInactive from '../../assets/icons/nav-desafios-inactive.svg';
import { AppIcon } from './AppIcon';
import { MainTab } from '../types/exercise';
import { BOTTOM_NAV_SAFE_MARGIN } from '../theme/spacing';
import { fonts } from '../theme/typography';

type BottomNavBarProps = {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

const NAV_HORIZONTAL_MARGIN = 64;
const ICON_SIZE = 48;
const LABEL_FONT_SIZE = 8;
const LABEL_LINE_HEIGHT = LABEL_FONT_SIZE * 1.2;
const LABEL_LETTER_SPACING = LABEL_FONT_SIZE * 0.1;

const tabs: {
  id: MainTab;
  active: typeof NavMenuActive;
  inactive: typeof NavMenuInactive;
  label: string;
}[] = [
  {
    id: 'menu',
    active: NavMenuActive,
    inactive: NavMenuInactive,
    label: 'Menú',
  },
  {
    id: 'aprende',
    active: NavAprendeActive,
    inactive: NavAprendeInactive,
    label: 'Aprende',
  },
  {
    id: 'entrena',
    active: NavEntrenaActive,
    inactive: NavEntrenaInactive,
    label: 'Entrena',
  },
  {
    id: 'desafios',
    active: NavDesafiosActive,
    inactive: NavDesafiosInactive,
    label: 'Desafíos',
  },
];

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
          >
            <AppIcon
              icon={isActive ? tab.active : tab.inactive}
              size={ICON_SIZE}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: BOTTOM_NAV_SAFE_MARGIN,
    paddingHorizontal: NAV_HORIZONTAL_MARGIN,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    fontFamily: fonts.title,
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_LINE_HEIGHT,
    letterSpacing: LABEL_LETTER_SPACING,
    color: '#B2B2B2',
    textAlign: 'center',
    marginTop: 2,
  },
  labelActive: {
    color: '#B2B2B2',
  },
});

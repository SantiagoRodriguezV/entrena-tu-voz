import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MainTab } from '../types/exercise';
import { BOTTOM_NAV_SAFE_MARGIN } from '../theme/spacing';
import { fonts } from '../theme/typography';

type BottomNavBarProps = {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

const NAV_HORIZONTAL_MARGIN = 64;
const LABEL_FONT_SIZE = 8;
const LABEL_LINE_HEIGHT = LABEL_FONT_SIZE * 1.2;
const LABEL_LETTER_SPACING = LABEL_FONT_SIZE * 0.1;

const tabs: { id: MainTab; active: number; inactive: number; label: string }[] = [
  {
    id: 'desafios',
    active: require('../../assets/images/nav-desafios-active.png'),
    inactive: require('../../assets/images/nav-desafios-inactive.png'),
    label: 'Desafíos',
  },
  {
    id: 'aprende',
    active: require('../../assets/images/nav-aprende-active.png'),
    inactive: require('../../assets/images/nav-aprende-inactive.png'),
    label: 'Aprende',
  },
  {
    id: 'entrena',
    active: require('../../assets/images/nav-entrena-active.png'),
    inactive: require('../../assets/images/nav-entrena-inactive.png'),
    label: 'Entrena',
  },
  {
    id: 'perfil',
    active: require('../../assets/images/nav-perfil-active.png'),
    inactive: require('../../assets/images/nav-perfil-inactive.png'),
    label: 'Perfil',
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
            <Image
              source={isActive ? tab.active : tab.inactive}
              style={styles.icon}
              resizeMode="contain"
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
  icon: {
    width: 48,
    height: 48,
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

import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type ImageActionButtonProps = {
  source: ImageSourcePropType;
  onPress: () => void;
  accessibilityLabel: string;
  style?: ViewStyle;
};

export function ImageActionButton({
  source,
  onPress,
  accessibilityLabel,
  style,
}: ImageActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
    >
      <Image source={source} style={styles.image} resizeMode="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 56,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

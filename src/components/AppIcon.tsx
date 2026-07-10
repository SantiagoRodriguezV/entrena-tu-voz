import type { ComponentType } from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type SvgIconComponent = ComponentType<SvgProps>;

type AppIconProps = {
  icon: SvgIconComponent | ImageSourcePropType;
  size: number;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
};

function isSvgComponent(
  icon: SvgIconComponent | ImageSourcePropType,
): icon is SvgIconComponent {
  return typeof icon === 'function';
}

export function AppIcon({ icon, size, width, height, style }: AppIconProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  if (isSvgComponent(icon)) {
    const SvgIcon = icon;
    return (
      <SvgIcon width={resolvedWidth} height={resolvedHeight} style={style} />
    );
  }

  return (
    <Image
      source={icon}
      style={[
        { width: resolvedWidth, height: resolvedHeight },
        style as StyleProp<ImageStyle>,
      ]}
      resizeMode="contain"
    />
  );
}

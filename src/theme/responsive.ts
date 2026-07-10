import { useWindowDimensions } from 'react-native';

export const DESIGN_WIDTH = 412;
export const DESIGN_HEIGHT = 891;

export function scaleW(size: number, width: number): number {
  return (width / DESIGN_WIDTH) * size;
}

export function scaleH(size: number, height: number): number {
  return (height / DESIGN_HEIGHT) * size;
}

export function moderateScale(size: number, width: number, factor = 0.5): number {
  return size + (scaleW(size, width) - size) * factor;
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isLandscape: width > height,
    scaleW: (size: number) => scaleW(size, width),
    scaleH: (size: number) => scaleH(size, height),
    moderateScale: (size: number, factor?: number) => moderateScale(size, width, factor),
  };
}

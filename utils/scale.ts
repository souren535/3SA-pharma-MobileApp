import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 14 / mid-range Android baseline

/**
 * Scale a size based on the screen width.
 * Best for padding, margin, and width/height.
 */
export const scale = (size: number) => (width / BASE_WIDTH) * size;

/**
 * Scale a size with a factor to prevent extreme scaling on very large devices.
 * Best for font sizes.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Scale a size based on the screen height.
 * Best for vertical distances if needed.
 */
export const verticalScale = (size: number) => (height / 844) * size; // 844 is iPhone 14 height

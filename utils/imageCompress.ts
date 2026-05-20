import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export const compressToWebP = async (
  uri: string,
  quality: number = 0.7,
): Promise<string> => {
  try {
    const result = await manipulateAsync(uri, [], {
      compress: quality,
      format: SaveFormat.WEBP,
    });
    console.log("Image successfully compressed to WebP format:", result.uri);
    return result.uri;
  } catch (err) {
    console.warn("compression error happen, falling back to original URI", err);
    return uri;
  }
};

import * as imageManupulator from "expo-image-manipulator";

export const compressToWebP = async (
  uri: string,
  qulity: number = 0.7,
): Promise<string> => {
  try {
    const result = await imageManupulator.manipulateAsync(uri, [], {
      compress: qulity,
      format: imageManupulator.SaveFormat.WEBP,
    });
    return result.uri;
  } catch (err) {
    console.log("compresson error happen", err);
    return uri;
  }
};

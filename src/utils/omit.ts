export const omit = (object: Record<string, unknown>, key: string) => {
  for (const objectKey in object) {
    if (objectKey.startsWith(key)) {
      delete object[objectKey];
    }
  }

  return object;
}
export function isOptional(pathPart: string) {
  return pathPart.endsWith("?");
}
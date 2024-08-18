import { isParametrized } from "./isParametrized";
import { WILDCARD } from "../constants";
import { getParamName } from "./getParamName";

export function getPathPartName(pathPart: string) {
  if (isParametrized(pathPart) || pathPart === WILDCARD) {
    return WILDCARD;
  }

  return getParamName(pathPart);
}
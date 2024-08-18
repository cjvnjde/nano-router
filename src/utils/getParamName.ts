import { isOptional } from "./isOptional";
import { isParametrized } from "./isParametrized";

export function getParamName(_name: string) {
  let name = _name;

  if (isOptional(name)) {
    name = name.slice(0, -1);
  }

  if (isParametrized(name)) {
    name = name.slice(1);
  }

  return name;
}
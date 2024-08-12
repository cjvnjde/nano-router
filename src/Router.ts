import type { Handler, Params } from "./type";
import { RouteNode } from "./RouteNode";

function splitPath(path: string) {
  return path.split("/").filter(Boolean)
}

class Router {
  private root = new RouteNode();

  public on(path: string, handler: Handler) {
    const shatteredPath = splitPath(path);

    this.root.add(shatteredPath, handler);
  }

  public match(path: string): { handler: Handler, params: Params} | null {
    const shatteredPath = splitPath(path);

    return this.root.resolve(shatteredPath)
  }
}

export {
  Router
}
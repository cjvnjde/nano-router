import type { Handler, Params } from "./type";
import { RouteNode } from "./RouteNode";

class Router {
  private root = new RouteNode();
  private dividerRegex: RegExp;

  constructor(dividers: string[] = ["/", "-"]) {
    this.dividerRegex = new RegExp(`[${dividers.join('')}]`, 'g');
  }

  public on(path: string, handler: Handler) {
    const shatteredPath = this.splitPath(path);

    this.root.add(shatteredPath, handler);
  }

  public match(path: string): { handler: Handler, params: Params} | null {
    const shatteredPath = this.splitPath(path);

    return this.root.resolve(shatteredPath)
  }

  private splitPath(path: string) {
    return path.split(this.dividerRegex).filter(Boolean);
  }

  public toString = (): string => {
    return this.root.toString()
  }
}

export {
  Router
}
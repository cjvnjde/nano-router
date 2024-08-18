import type { Params } from "./type";
import { RouteNode } from "./RouteNode";

const forbiddenDividers = ["?", ":"];

class Router<Handler extends Function> {
  private root = new RouteNode<Handler>();
  private dividerRegex: RegExp;

  constructor(dividers: string[] = ["/", "-"]) {
    for (const divider of dividers) {
      if (forbiddenDividers.includes(divider)) {
        throw new Error(`Divider "${divider}" is forbidden.`);
      }
    }

    this.dividerRegex = new RegExp(`[${dividers.join("")}]`, "g");
  }

  public on(path: string, handler: Handler) {
    const shatteredPath = this.splitPath(path);

    this.root.add(shatteredPath, handler);
  }

  public match(path: string): { handler: Handler; params: Params } | null {
    const [urlPath] = path.split("?");
    const shatteredPath = this.splitPath(urlPath);

    return this.root.resolve(shatteredPath);
  }

  private splitPath(path: string) {
    return path.split(this.dividerRegex).filter(Boolean);
  }

  public toString = (): string => {
    return this.root.toString();
  };
}

export { Router };


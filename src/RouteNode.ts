import type { Handler, Params } from "./type";

const WILDCARD = "*" as const;

function isParametrized(pathPart: string) {
  return pathPart.startsWith(":");
}

function isOptional(pathPart: string) {
  return pathPart.endsWith("?");
}

function getParamName(_name: string) {
  let name = _name;

  if (isOptional(name)) {
    name = name.slice(0, -1);
  }

  if (isParametrized(name)) {
    name = name.slice(1);
  }

  return name;
}

function getPathPartName(pathPart: string) {
  if (isParametrized(pathPart) || pathPart === WILDCARD) {
    return WILDCARD;
  }

  return getParamName(pathPart);
}

class RouteNode {
  private children: Record<string, RouteNode> = {};
  private params: string[] = [];
  #handler: Handler | null = null;
  private type: "default" | "parametrized" | "wildcard" = "default";
  private readonly name: string;

  constructor(name: string = "root") {
    this.name = name;
  }

  private set handler(cb: Handler) {
    if (this.#handler) {
      throw new Error("You cannot redefine handler");
    }

    this.#handler = cb;
  }

  public add(path: string[], handler: Handler, index = -1, params: string[] = []) {
    if (path.length - 1 <= index) {
      this.handler = handler;
      this.params.push(...params);
      return;
    }

    const nextPathPart = path[index + 1];
    const nextName = getPathPartName(nextPathPart);
    const hasChild = nextName in this.children;

    if (isOptional(nextPathPart)) {
      this.handler = handler;
      this.params.push(...params);
    }

    if (!hasChild) {
      this.children[nextName] = new RouteNode(nextName);
    }

    let nextParams = params;

    if (nextName === WILDCARD && nextPathPart !== WILDCARD) {
      nextParams = [...params, getParamName(nextPathPart)];
      this.children[nextName].type = "parametrized";
    }

    if (nextPathPart === WILDCARD) {
      this.children[nextName].type = "wildcard";
    }


    this.children[nextName].add(path, handler, index + 1, nextParams);
  }

  public resolve(path: string[], params: string[] = [], index = -1, potential?: {
    node: RouteNode,
    params: string[],
    index: number
  }): { handler: Handler, params: Params } | null {
    let paramsData = params;
    const currentPathPart = path[index + 1];

    if (this.type === "parametrized") {
      paramsData = [...paramsData, path[index]];
    }

    if (path.length - 1 === index) {
      if (!this.#handler) {
        if (potential) {
          return potential.node.resolve(path, potential.params, potential.index + 1);
        }

        return null;
      }

      const paramsObj = this.params.reduce<Record<string, string>>((obj, name, index) => {
        obj[name] = paramsData[index];
        return obj;
      }, {});

      return {
        handler: this.#handler,
        params: paramsObj,
      };
    }

    let child = this.children[currentPathPart];

    if (WILDCARD in this.children && path.length - 2 > index) {
      if (!child) {
        child = this.children[WILDCARD];
      } else if (!potential) {
        potential = {
          node: this.children[WILDCARD],
          index,
          params: paramsData,
        };
      }
    }

    if (!child) {
      if (WILDCARD in this.children) {
        child = this.children[WILDCARD];
      } else if (potential) {
        return potential.node.resolve(path, potential.params, potential.index + 1);
      } else {
        return null;
      }
    }

    return child.resolve(path, paramsData, index + 1, potential);
  }

  public toString(indentation: string = "", lastChild: boolean = true): string {
    let result = `${indentation}${lastChild ? "└─" : "├─"} ${this.name} [type: ${this.type}, params: [${this.params.join(", ")}]]\n`;

    const childrenKeys = Object.keys(this.children);
    childrenKeys.forEach((key, index) => {
      const child = this.children[key];
      const isLast = index === childrenKeys.length - 1;
      result += child.toString(indentation + (lastChild ? "   " : "│  "), isLast);
    });

    return result;
  }
}

export {
  RouteNode,
};
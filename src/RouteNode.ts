import type { Handler, Params } from "./type";

const WILDCARD = "*" as const;

function isParametrized(pathPart: string) {
  return pathPart.startsWith(":");
}

function getPathPartName(pathPart: string) {
  if (isParametrized(pathPart) || pathPart === WILDCARD) {
    return WILDCARD;
  }

  return pathPart;
}

class RouteNode {
  private children: Record<string, RouteNode> = {};
  private params: string[] = [];
  private handler: Handler | null = null;
  private type: "default" | "parametrized" | "wildcard" = "default"

  public add(path: string[], handler: Handler, index = -1, params: string[] = []) {
    if (path.length - 1 <= index) {
      this.handler = handler;
      this.params.push(...params);
      return;
    }

    const nextPathPart = path[index + 1];
    const nextName = getPathPartName(nextPathPart);
    const hasChild = nextName in this.children;

    if (!hasChild) {
      this.children[nextName] = new RouteNode();
    }

    let nextParams = params

    if (nextName === WILDCARD && nextPathPart !== WILDCARD) {
      nextParams = [...params, nextPathPart.slice(1)]
      this.children[nextName].type = "parametrized"
    }

    if (nextPathPart === WILDCARD) {
      this.children[nextName].type = "wildcard"
    }


    this.children[nextName].add(path, handler, index + 1, nextParams);
  }

  public resolve(path: string[], params: string[] = [], index = -1): { handler: Handler, params: Params } | null {
    let paramsData = params;
    const currentPathPart = path[index + 1];

    if (this.type === "parametrized") {
      paramsData = [...paramsData, path[index]];
    }

    if (path.length - 1 === index) {
      if (!this.handler) {
        return null;
      }

      const paramsObj = this.params.reduce<Record<string, string>>((obj, name, index) => {
        obj[name] = paramsData[index];
        return obj;
      }, {});

      return {
        handler: this.handler,
        params: paramsObj,
      };
    }

    let child = this.children[currentPathPart];

    if (child && (WILDCARD in this.children) && path.length - 2 > index) {
      child = this.children[WILDCARD];
    }

    if (!child) {
      if (WILDCARD in this.children) {
        child = this.children[WILDCARD];
      } else {
        return null;
      }
    }

    return child.resolve(path, paramsData, index + 1);
  }
}

export {
  RouteNode,
};
type RouteCallback = (
  req: Request,
  res: Response,
  params: Record<string, string>,
) => Promise<unknown> | unknown;

class RouteNode {
  private children: Record<string, RouteNode> = {};
  private name: string;
  private _callback?: RouteCallback;

  constructor(name: string) {
    this.name = name;
  }

  private normalizePathPart(pathPart: string) {
    if (pathPart.startsWith(":")) {
      return "*";
    }

    return pathPart;
  }

  public next(rawPathPart: string, callback?: any) {
    const pathPart = this.normalizePathPart(rawPathPart);

    if (!(pathPart in this.children)) {
      this.children[pathPart] = new RouteNode(
        rawPathPart.startsWith(":") ? rawPathPart.slice(1) : rawPathPart,
      );
    }

    if (callback) {
      this.children[pathPart].callback = callback;
    }

    return this.children[pathPart];
  }

  public find(
    pathPart: string,
  ): [RouteNode, params: Record<string, string>] | [RouteNode] | [null] {
    if (pathPart in this.children) {
      return [this.children[pathPart]];
    }

    if ("*" in this.children) {
      return [this.children["*"], { [this.children["*"].name]: pathPart }];
    }

    return [null];
  }

  public get callback(): RouteCallback | undefined {
    return this._callback;
  }

  private set callback(callback: RouteCallback) {
    if (this._callback) {
      throw new Error("Trying to overwrite existing callback");
    }

    this._callback = callback;
  }
}

class Route {
  public callback?: RouteCallback;
  public params: Record<string, string>;

  constructor(
    routeNode: RouteNode | null,
    params: Record<string, string> = {},
  ) {
    this.callback = routeNode?.callback;
    this.params = params;
  }
}

class Router {
  private root: RouteNode;

  constructor() {
    this.root = new RouteNode("root");
  }

  public on(path: string, callback: RouteCallback) {
    const segmentedPath = this.parsePath(path);
    let node = this.root;

    segmentedPath.forEach((pathPart, index, arr) => {
      const isLast = index === arr.length - 1;
      node = node.next(pathPart, isLast ? callback : null);
    });
  }

  public match(path: string) {
    const segmentedPath = this.parsePath(path);
    let node: RouteNode | null = this.root;
    let params = {};

    for (const pathPart of segmentedPath) {
      if (!node) {
        return null;
      }

      let par;
      [node, par] = node.find(pathPart);
      params = {
        ...params,
        ...par,
      };
    }

    return new Route(node, params);
  }

  private parsePath(path: string) {
    return path.split("/").filter(Boolean);
  }
}

export { Router };

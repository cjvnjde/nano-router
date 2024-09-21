import { Router } from "./Router";
import type { DefaultHandler } from "./type";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

class MethodRouter<T = DefaultHandler> {
  private routers: Record<HttpMethod, Router<T>> = {
    GET: new Router<T>(),
    POST: new Router<T>(),
    PUT: new Router<T>(),
    DELETE: new Router<T>(),
    PATCH: new Router<T>(),
    OPTIONS: new Router<T>(),
    HEAD: new Router<T>(),
  } as const;
  private groupPrefix: string[] = [];

  private on(method: HttpMethod, path: string, handler: T) {
    if (this.groupPrefix.length > 0) {
      this.routers[method].group(this.groupPrefix.join("/"), router => {
        router.on(path, handler);
      });
    } else {
      this.routers[method].on(path, handler);
    }
  }

  get(path: string, handler: T) {
    this.on("GET", path, handler);
  }

  post(path: string, handler: T) {
    this.on("POST", path, handler);
  }

  put(path: string, handler: T) {
    this.on("PUT", path, handler);
  }

  delete(path: string, handler: T) {
    this.on("DELETE", path, handler);
  }

  patch(path: string, handler: T) {
    this.on("PATCH", path, handler);
  }

  options(path: string, handler: T) {
    this.on("OPTIONS", path, handler);
  }

  head(path: string, handler: T) {
    this.on("HEAD", path, handler);
  }

  group(prefix: string, setup: (router: MethodRouter<T>) => void) {
    this.groupPrefix.push(prefix);
    setup(this);
    this.groupPrefix.splice(this.groupPrefix.length - 1, 1);
  }

  match(method: HttpMethod, url: string): { handler: T, params: Record<string, string> } | null {
    const router = this.routers[method];

    if (router) {
      return router.match(url);
    }

    return null;
  }
}

export { MethodRouter };
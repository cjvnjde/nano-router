import { Router } from "./Router";
import type { DefaultHandler } from "./type";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

/**
 * Represents an HTTP method-based router that provides methods for adding route handlers and matching routes.
 *
 * @template Handler - The type of the handler.
 */
class MethodRouter<Handler = DefaultHandler> {
  private routers: Record<HttpMethod, Router<Handler>> = {
    GET: new Router<Handler>(),
    POST: new Router<Handler>(),
    PUT: new Router<Handler>(),
    DELETE: new Router<Handler>(),
    PATCH: new Router<Handler>(),
    OPTIONS: new Router<Handler>(),
    HEAD: new Router<Handler>(),
  } as const;
  private groupPrefix: string[] = [];

  private on(method: HttpMethod, path: string, handler: Handler) {
    if (this.groupPrefix.length > 0) {
      this.routers[method].group(this.groupPrefix.join("/"), router => {
        router.on(path, handler);
      });
    } else {
      this.routers[method].on(path, handler);
    }
  }

  /**
   * Registers a GET route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  get(path: string, handler: Handler): void {
    this.on("GET", path, handler);
  }

  /**
   * Registers a POST route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  post(path: string, handler: Handler): void {
    this.on("POST", path, handler);
  }

  /**
   * Registers a PUT route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  put(path: string, handler: Handler): void {
    this.on("PUT", path, handler);
  }

  /**
   * Registers a DELETE route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  delete(path: string, handler: Handler): void {
    this.on("DELETE", path, handler);
  }

  /**
   * Registers a PATCH route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  patch(path: string, handler: Handler): void {
    this.on("PATCH", path, handler);
  }

  /**
   * Registers an OPTIONS route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  options(path: string, handler: Handler): void {
    this.on("OPTIONS", path, handler);
  }

  /**
   * Registers a HEAD route.
   *
   * @param {string} path - The path to match for the route.
   * @param {Handler} handler - The handler function to invoke when the path is matched.
   *
   * @return {void}
   */
  head(path: string, handler: Handler): void {
    this.on("HEAD", path, handler);
  }

  /**
   * Groups routes with a common path prefix.
   *
   * @param {string} prefix - The path prefix to apply to all routes in the group.
   * @param {(router: MethodRouter<Handler>) => void} setup - The function that defines the routes in the group.
   *
   * @return {void}
   */
  group(prefix: string, setup: (router: MethodRouter<Handler>) => void): void {
    this.groupPrefix.push(prefix);
    setup(this);
    this.groupPrefix.splice(this.groupPrefix.length - 1, 1);
  }

  /**
   * Matches a given HTTP method and URL path against the routes in the router.
   *
   * @param {HttpMethod} method - The HTTP method to match.
   * @param {string} url - The URL path to match.
   * @return {{ handler: Handler, params: Record<string, string> } | null} - The matched handler and parameters, or `null` if no match is found.
   */
  match(method: HttpMethod, url: string): { handler: Handler, params: Record<string, string> } | null {
    const router = this.routers[method];

    if (router) {
      return router.match(url);
    }

    return null;
  }
}

export { MethodRouter };
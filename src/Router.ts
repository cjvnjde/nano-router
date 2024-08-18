import type { Handler as HandlerCb, Params } from "./type";
import { RouteNode } from "./RouteNode";

const forbiddenDividers = ["?", ":"];

class Router<Handler extends Function = HandlerCb> {
  private root = new RouteNode<Handler>();
  private dividerRegex: RegExp;
  private groupPrefix: string[] = [];

  /**
   * Creates a new instance of the Constructor class.
   *
   * @param {string[]} dividers - An array of dividers used to split strings.
   * @return {void}
   * @throws {Error} if a forbidden divider is encountered.
   */
  constructor(dividers: string[] = ["/", "-"]) {
    for (const divider of dividers) {
      if (forbiddenDividers.includes(divider)) {
        throw new Error(`Divider "${divider}" is forbidden.`);
      }
    }

    this.dividerRegex = new RegExp(`[${dividers.join("")}]`, "g");
  }

  /**
   * Applies a group of routes to the current router.
   *
   * @param {string} path - The path to which the routes will be applied.
   * @param {Function} cb - The callback function that defines the routes to be applied.
   *                        It takes a single parameter, `router`, which is the current router instance.
   * @return {void}
   */
  public group(path: string, cb: (router: Router<Handler>) => void) {
    const prefixPath = this.splitPath(path)
    this.groupPrefix.push(...prefixPath);
    cb(this);
    this.groupPrefix.splice(this.groupPrefix.length - prefixPath.length, prefixPath.length);
  }

  /**
   * Adds a handler function to the specified path.
   *
   * @param {string} path - The path where the handler will be added.
   * @param {Handler} handler - The handler function to be added.
   *
   * @return {void}
   */
  public on(path: string, handler: Handler) {
    const shatteredPath = this.splitPath(path);

    this.root.add([...this.groupPrefix, ...shatteredPath], handler);
  }

  /**
   * Matches the given path to a handler in the router.
   *
   * @param path - The path to be matched.
   * @returns An object containing the matched handler and any parameters extracted from the path, or null if no match is found.
   */
  public match(path: string): { handler: Handler; params: Params } | null {
    const [urlPath] = path.split("?");
    const shatteredPath = this.splitPath(urlPath);

    return this.root.resolve(shatteredPath);
  }

  private splitPath(path: string) {
    return path.split(this.dividerRegex).filter(Boolean);
  }

  /**
   * Returns the string representation of the current object.
   * The string representation is obtained by calling the `toString` method of the `root` property.
   *
   * @returns {string} The string representation of the current object.
   */
  public toString = (): string => {
    return this.root.toString();
  };
}

export { Router };


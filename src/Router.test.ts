import { beforeEach, describe, expect, test, vitest } from "vitest";
import { Router } from "./Router";

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  test("Should allow adding routes to the router instance", () => {
    router.on("one", vitest.fn());
    router.on("two/three", vitest.fn());

    expect(true).toBeTruthy();
  });

  describe("Route matching", () => {
    test("Should correctly match and handle the root route", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("/one", handler1);
      router.on("/", handler2);

      expect(router.match("one")?.params).toEqual({});
      expect(router.match("/")?.params).toEqual({});
      expect(router.match("one")?.handler).toBe(handler1);
      expect(router.match("/")?.handler).toBe(handler2);
    });
    test("Should correctly match routes with single path segments", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("one", handler1);
      router.on(":two", handler2);

      expect(router.match("one")?.params).toEqual({});
      expect(router.match("three")?.params).toEqual({ two: "three" });
      expect(router.match("one")?.handler).toBe(handler1);
      expect(router.match("three")?.handler).toBe(handler2);
    });

    test("Should match routes with multiple path parameters", () => {
      const handler = vitest.fn();
      router.on(":one/:two/:three/:four/:five", handler);

      expect(router.match("1/2/3/4/5")?.params).toEqual({ one: "1", two: "2", three: "3", four: "4", five: "5" });
      expect(router.match("1/2/3/4/5")?.handler).toBe(handler);
    });

    test("Should correctly match routes with and without path parameters", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      const handler3 = vitest.fn();
      router.on("one/:two", handler1);
      router.on("one/three", handler2);
      router.on("one/:three/four/:five", handler3);

      expect(router.match("one/2")?.params).toEqual({ two: "2" });
      expect(router.match("one/three")?.params).toEqual({});
      expect(router.match("one/three/four/55")?.params).toEqual({ three: "three", five: "55" });
      expect(router.match("one/2")?.handler).toBe(handler1);
      expect(router.match("one/three")?.handler).toBe(handler2);
      expect(router.match("one/three/four/55")?.handler).toBe(handler3);
    });

    test("Should match complex routes with varying path structures", () => {
      const handler2 = vitest.fn();
      const handler3 = vitest.fn();
      router.on("one/three/four/five", handler2);
      router.on("one/:three/four/:five", handler3);

      expect(router.match("one/three/four/five")?.handler).toBe(handler2);
      expect(router.match("one/three/four/55")?.handler).toBe(handler3);
    });

    test("Should handle routes with different numbers of path parameters", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on(":one/:two/:three/:four/:five", handler1);
      router.on(":a/:b/:c", handler2);

      expect(router.match("1/2/3/4/5")?.params).toEqual({ one: "1", two: "2", three: "3", four: "4", five: "5" });
      expect(router.match("1/2/3")?.params).toEqual({ a: "1", b: "2", c: "3" });
      expect(router.match("1/2/3/4/5")?.handler).toBe(handler1);
      expect(router.match("1/2/3")?.handler).toBe(handler2);
    });
  });

  describe("Wildcard params", () => {
    test("Should correctly handle routes with wildcard parameters", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("one/*/two", handler1);
      router.on("three/*", handler2);

      expect(router.match("one/test/two")?.handler).toBe(handler1);
      expect(router.match("three/anything")?.handler).toBe(handler2);
    });

    test("Should match routes with wildcard and named parameters", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("one/*/two/:id", handler1);
      router.on("three/*/:id2", handler2);

      expect(router.match("one/test/two/1")?.params).toEqual({ id: "1" });
      expect(router.match("one/test/two/1")?.handler).toBe(handler1);
      expect(router.match("three/anything/2")?.params).toEqual({ id2: "2" });
      expect(router.match("three/anything/2")?.handler).toBe(handler2);
    });
  });

  describe("Multiple params in one route part", () => {
    test("Should handle routes with multiple parameters in a single segment", () => {
      const handler1 = vitest.fn();
      router.on("one/:id1-:id2/:id3", handler1);

      expect(router.match("one/1-2/3")?.params).toEqual({ id1: "1", id2: "2", id3: "3" });
      expect(router.match("one/1-2/3")?.handler).toBe(handler1);
    });
  });

  describe("Optional params", () => {
    test("Should correctly handle optional last parameter", () => {
      const handler1 = vitest.fn();
      router.on("one/:id1/:id2?", handler1);

      expect(router.match("one/1/2")?.params).toEqual({ id1: "1", id2: "2" });
      expect(router.match("one/1/2")?.handler).toBe(handler1);

      expect(router.match("one/1")?.params).toEqual({ id1: "1" });
      expect(router.match("one/1")?.handler).toBe(handler1);
    });

    test("Should correctly handle optional last static segment", () => {
      const handler1 = vitest.fn();
      router.on("one/:id1/id2?", handler1);

      expect(router.match("one/1/id2")?.params).toEqual({ id1: "1" });
      expect(router.match("one/1/id2")?.handler).toBe(handler1);

      expect(router.match("one/1")?.params).toEqual({ id1: "1" });
      expect(router.match("one/1")?.handler).toBe(handler1);
    });

    test("Should throw an error when attempting to redefine an existing route", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("one/two", handler1);
      expect(() => router.on("one/two/three?", handler2)).toThrowError("You cannot redefine handler");
    });

    test("Should support routes with multiple optional segments", () => {
      const handler1 = vitest.fn();
      router.on("one/two?/three?", handler1);

      expect(router.match("one/two/three")?.handler).toBe(handler1);
      expect(router.match("one/two")?.handler).toBe(handler1);
      expect(router.match("one")?.handler).toBe(handler1);
    });

    test("Should correctly match routes with overlapping optional segments", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();
      router.on("one/two2/three?", handler1);
      router.on("one/:id?/:id2?", handler2);

      expect(router.match("one/two2/three")?.handler).toBe(handler1);
      expect(router.match("one/two")?.handler).toBe(handler2);
      expect(router.match("one")?.handler).toBe(handler2);
    });
  });
});

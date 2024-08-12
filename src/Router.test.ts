import { beforeEach, describe, expect, test, vitest } from "vitest";
import { Router } from "./Router";

describe("Router", () => {
  let router: Router;

  beforeEach(() => {
    router = new Router()
  })

  test("Should allow adding simple routes", () => {
    const handler = vitest.fn();
    router.on("one", handler)
    router.on("two/three", handler)

    expect(true).toBeTruthy()
  })

  test("Should correctly match short routes", () => {
    const handler1 = vitest.fn();
    const handler2 = vitest.fn();
    router.on("one", handler1)
    router.on(":two", handler2)

    expect(router.match("one")?.params).toEqual({})
    expect(router.match("three")?.params).toEqual({ two: "three" })
    expect(router.match("one")?.handler).toBe(handler1)
    expect(router.match("three")?.handler).toBe(handler2)
  })

  test("Should match routes with multiple parameters", () => {
    const handler = vitest.fn();
    router.on(":one/:two/:three/:four/:five", handler)

    expect(router.match("1/2/3/4/5")?.params).toEqual({ one: "1", two: "2", three: "3", four: "4", five: "5"})
    expect(router.match("1/2/3/4/5")?.handler).toBe(handler)
  })

  test("Should match multiple routes with and without parameters", () => {
    const handler1 = vitest.fn();
    const handler2 = vitest.fn();
    const handler3 = vitest.fn();
    router.on("one/:two", handler1)
    router.on("one/three", handler2)
    router.on("one/:three/four/:five", handler3)

    expect(router.match("one/2")?.params).toEqual({ two: "2"})
    expect(router.match("one/three")?.params).toEqual({})
    expect(router.match("one/three/four/55")?.params).toEqual({ three: "three", five: "55"})
    expect(router.match("one/2")?.handler).toBe(handler1)
    expect(router.match("one/three")?.handler).toBe(handler2)
    expect(router.match("one/three/four/55")?.handler).toBe(handler3)
  })

  test("Should match different routes with varying numbers of parameters", () => {
    const handler1 = vitest.fn();
    const handler2 = vitest.fn();
    router.on(":one/:two/:three/:four/:five", handler1)
    router.on(":a/:b/:c", handler2)

    expect(router.match("1/2/3/4/5")?.params).toEqual({ one: "1", two: "2", three: "3", four: "4", five: "5"})
    expect(router.match("1/2/3")?.params).toEqual({ a: "1", b: "2", c: "3"})
    expect(router.match("1/2/3/4/5")?.handler).toBe(handler1)
    expect(router.match("1/2/3")?.handler).toBe(handler2)
  })
})

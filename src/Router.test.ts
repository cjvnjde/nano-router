import { describe, expect, test } from "vitest";
import { Router } from "./Router";

describe("Router", () => {
  test("Should be possible to match existing router", () => {
    const router = new Router();

    const cb1 = () => "test1";
    const cb2 = () => "test2";
    const cb3 = () => "test3";

    router.on("one/two", cb1);
    router.on("one/five", cb2);
    router.on("one", cb3);

    expect(router.match("one/two")?.callback).toBe(cb1);
    expect(router.match("one")?.callback).toBe(cb3);
  });

  test("Should find path with params", () => {
    const router = new Router();

    const cb1 = () => "test1";
    const cb2 = () => "test2";

    router.on("one/:id", cb1);
    router.on("one/:id/update", cb2);

    expect(router.match("one/2")?.callback).toBe(cb1);
    expect(router.match("one/1/update")?.callback).toBe(cb2);
  });

  test("Should return params", () => {
    const router = new Router();

    const cb1 = () => "test1";
    const cb2 = () => "test2";

    router.on("one/:id", cb1);
    router.on("one/:id/update", cb2);

    expect(router.match("one/2")?.params).toEqual({ id: "2" });
    expect(router.match("one/1/update")?.params).toEqual({ id: "1" });
  });
});

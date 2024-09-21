import { beforeEach, describe, expect, test, vitest } from "vitest";
import { MethodRouter } from "./MethodRouter";

describe("MethodRouter", () => {
  let router: MethodRouter;

  beforeEach(() => {
    router = new MethodRouter();
  });

  test("Should register GET route correctly", () => {
    const handler = vitest.fn();
    router.get("/test", handler);

    const match = router.match("GET", "/test");
    expect(match?.handler).toBe(handler);
  });

  test("Should return null fon non existing method", () => {
    const handler = vitest.fn();
    router.get("/test", handler);

    const match = router.match("GET2" as "GET", "/test2");
    expect(match).toBe(null);
  });

  test("Should register POST route correctly", () => {
    const handler = vitest.fn();
    router.post("/submit", handler);

    const match = router.match("POST", "/submit");
    expect(match?.handler).toBe(handler);
  });

  test("Should register and match multiple routes for different methods", () => {
    const getHandler = vitest.fn();
    const postHandler = vitest.fn();

    router.get("/api/resource", getHandler);
    router.post("/api/resource", postHandler);

    expect(router.match("GET", "/api/resource")?.handler).toBe(getHandler);
    expect(router.match("POST", "/api/resource")?.handler).toBe(postHandler);
  });

  test("Should match route with parameters correctly", () => {
    const handler = vitest.fn();
    router.get("/user/:id", handler);

    const match = router.match("GET", "/user/123");
    expect(match?.handler).toBe(handler);
    expect(match?.params).toEqual({ id: "123" });
  });

  test("Should correctly group routes and prefix paths", () => {
    const handler1 = vitest.fn();
    const handler2 = vitest.fn();

    router.group("/api", (groupRouter) => {
      groupRouter.get("/resource", handler1);
      groupRouter.post("/submit", handler2);
    });

    expect(router.match("GET", "/api/resource")?.handler).toBe(handler1);
    expect(router.match("POST", "/api/submit")?.handler).toBe(handler2);
  });

  test("Should correctly match nested grouped routes", () => {
    const handler = vitest.fn();

    router.group("/api", (groupRouter) => {
      groupRouter.group("/v1", (nestedGroup) => {
        nestedGroup.get("/data", handler);
      });
    });

    expect(router.match("GET", "/api/v1/data")?.handler).toBe(handler);
  });

  test("Should return null if route not found", () => {
    const handler = vitest.fn();
    router.get("/exists", handler);

    expect(router.match("GET", "/not-found")).toBeNull();
  });

  test("Should handle DELETE method routes correctly", () => {
    const deleteHandler = vitest.fn();
    router.delete("/item/:id", deleteHandler);

    const match = router.match("DELETE", "/item/5");
    expect(match?.handler).toBe(deleteHandler);
    expect(match?.params).toEqual({ id: "5" });
  });

  test("Should handle PATCH method routes correctly", () => {
    const patchHandler = vitest.fn();
    router.patch("/update", patchHandler);

    const match = router.match("PATCH", "/update");
    expect(match?.handler).toBe(patchHandler);
  });

  test("Should handle PUT method routes correctly", () => {
    const patchHandler = vitest.fn();
    router.put("/update", patchHandler);

    const match = router.match("PUT", "/update");
    expect(match?.handler).toBe(patchHandler);
  });

  test("Should handle OPTIONS method routes correctly", () => {
    const optionsHandler = vitest.fn();
    router.options("/options", optionsHandler);

    const match = router.match("OPTIONS", "/options");
    expect(match?.handler).toBe(optionsHandler);
  });

  test("Should handle HEAD method routes correctly", () => {
    const headHandler = vitest.fn();
    router.head("/check", headHandler);

    const match = router.match("HEAD", "/check");
    expect(match?.handler).toBe(headHandler);
  });

  describe("Middleware-like Grouping for Organizing Complex Routes", () => {
    test("Should correctly register and match routes in a group", () => {
      const getUsersHandler = vitest.fn();
      const postUsersHandler = vitest.fn();

      router.group("api", (groupRouter) => {
        groupRouter.get("/users", getUsersHandler);
        groupRouter.post("/users", postUsersHandler);
      });

      const getMatch = router.match("GET", "/api/users");
      const postMatch = router.match("POST", "/api/users");

      expect(getMatch?.handler).toBe(getUsersHandler);
      expect(postMatch?.handler).toBe(postUsersHandler);
    });

    test("Should correctly match nested group routes", () => {
      const getHandler = vitest.fn();
      const postHandler = vitest.fn();

      router.group("api/v1", (groupRouter) => {
        groupRouter.get("/items", getHandler);
        groupRouter.post("/items", postHandler);
      });

      const getMatch = router.match("GET", "/api/v1/items");
      const postMatch = router.match("POST", "/api/v1/items");

      expect(getMatch?.handler).toBe(getHandler);
      expect(postMatch?.handler).toBe(postHandler);
    });

    test("Should return null for unmatched routes in groups", () => {
      const getHandler = vitest.fn();

      router.group("api", (groupRouter) => {
        groupRouter.get("/users", getHandler);
      });

      expect(router.match("GET", "/api/non-existing")).toBeNull();
    });

    test("Should correctly handle multiple route groups", () => {
      const handler1 = vitest.fn();
      const handler2 = vitest.fn();

      router.group("api", (groupRouter) => {
        groupRouter.get("/users", handler1);
      });

      router.group("admin", (groupRouter) => {
        groupRouter.post("/dashboard", handler2);
      });

      const getMatch = router.match("GET", "/api/users");
      const postMatch = router.match("POST", "/admin/dashboard");

      expect(getMatch?.handler).toBe(handler1);
      expect(postMatch?.handler).toBe(handler2);
    });

    test("Should allow nested groups", () => {
      const handler = vitest.fn();

      router.group("api", (groupRouter) => {
        groupRouter.group("v2", (nestedGroupRouter) => {
          nestedGroupRouter.get("/items", handler);
        });
      });

      const match = router.match("GET", "/api/v2/items");
      expect(match?.handler).toBe(handler);
    });
  });
});

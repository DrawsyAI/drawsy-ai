import React from "react";

import { resolvablePromise } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { findShapeByKey, getToolbarTools } from "../components/shapes";

import { Pointer } from "./helpers/ui";
import { act, render } from "./test-utils";

import type { AppClassProperties, ExcalidrawImperativeAPI } from "../types";

describe("setActiveTool()", () => {
  const h = window.h;

  let excalidrawAPI: ExcalidrawImperativeAPI;

  const mouse = new Pointer("mouse");

  beforeEach(async () => {
    const excalidrawAPIPromise = resolvablePromise<ExcalidrawImperativeAPI>();
    await render(
      <Excalidraw
        onExcalidrawAPI={(api) => excalidrawAPIPromise.resolve(api as any)}
      />,
    );
    excalidrawAPI = await excalidrawAPIPromise;
  });

  it("should expose setActiveTool on package API", () => {
    expect(excalidrawAPI.setActiveTool).toBeDefined();
    expect(excalidrawAPI.setActiveTool).toBe(h.app.setActiveTool);
  });

  it("should set the active tool type", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      excalidrawAPI.setActiveTool({ type: "rectangle" });
    });
    expect(h.state.activeTool.type).toBe("rectangle");

    mouse.down(10, 10);
    mouse.up(20, 20);

    expect(h.state.activeTool.type).toBe("selection");
  });

  it("should support tool locking", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      excalidrawAPI.setActiveTool({ type: "rectangle", locked: true });
    });
    expect(h.state.activeTool.type).toBe("rectangle");

    mouse.down(10, 10);
    mouse.up(20, 20);

    expect(h.state.activeTool.type).toBe("rectangle");
  });

  it("should set custom tool", async () => {
    expect(h.state.activeTool.type).toBe("selection");
    act(() => {
      excalidrawAPI.setActiveTool({ type: "custom", customType: "comment" });
    });
    expect(h.state.activeTool.type).toBe("custom");
    expect(h.state.activeTool.customType).toBe("comment");
  });
});

describe("getToolbarTools()", () => {
  const appWithPreferredTool = (
    preferredSelectionTool: "selection" | "lasso",
  ) =>
    ({
      state: {
        preferredSelectionTool: {
          type: preferredSelectionTool,
        },
      },
    } as AppClassProperties);

  const getToolValues = (preferredSelectionTool: "selection" | "lasso") =>
    getToolbarTools(appWithPreferredTool(preferredSelectionTool)).map(
      (tool) => tool.value,
    );

  it("does not include lasso when selection is preferred", () => {
    const toolValues = getToolValues("selection");

    expect(toolValues.filter((value) => value === "selection")).toHaveLength(1);
    expect(toolValues.filter((value) => value === "lasso")).toHaveLength(0);
  });

  it("replaces selection with lasso when lasso is preferred", () => {
    const toolValues = getToolValues("lasso");

    expect(toolValues.filter((value) => value === "lasso")).toHaveLength(1);
    expect(toolValues.filter((value) => value === "selection")).toHaveLength(0);
  });

  it("keeps letter shortcuts CapsLock-insensitive", () => {
    const app = appWithPreferredTool("selection");

    expect(findShapeByKey("V", app)).toBe("selection");
    expect(findShapeByKey("R", app)).toBe("rectangle");
    expect(findShapeByKey("X", app)).toBe("freedraw");
  });

  it("matches autoshape only with Shift+X", () => {
    const app = appWithPreferredTool("selection");

    expect(findShapeByKey("X", app, true)).toBe("autoshape");
    expect(findShapeByKey("x", app, true)).toBe("autoshape");
    expect(findShapeByKey("X", app, false)).toBe("freedraw");
  });

  it("does not match plain shortcuts while Shift is held", () => {
    const app = appWithPreferredTool("selection");

    expect(findShapeByKey("R", app, true)).toBeNull();
    expect(findShapeByKey("V", app, true)).toBeNull();
  });
});

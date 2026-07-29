import { ShapeCache } from "@excalidraw/element";

import type {
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
  ExcalidrawRectangleElement,
} from "@excalidraw/element/types";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { render } from "./test-utils";

describe("three-dimensional shapes", () => {
  beforeEach(async () => {
    await render(<Excalidraw />);
  });

  it("generates ordered faces for a 3D ellipse", () => {
    const element = API.createElement({
      type: "ellipse",
      width: 160,
      height: 120,
      dimensionality: "3d",
    }) as ExcalidrawEllipseElement;

    const shape = ShapeCache.generateElementShape(element, null);

    expect(Array.isArray(shape)).toBe(true);
    expect(shape).toHaveLength(2);
  });

  it.each(["rectangle", "diamond"] as const)(
    "keeps %s strictly two-dimensional",
    (type) => {
      const element = API.createElement({
        type,
        width: 160,
        height: 120,
        dimensionality: "3d",
      }) as ExcalidrawRectangleElement | ExcalidrawDiamondElement;

      const shape = ShapeCache.generateElementShape(element, null);

      expect(element.dimensionality).toBe("2d");
      expect(Array.isArray(shape)).toBe(false);
    },
  );

  it("keeps 2D as the default single-face geometry", () => {
    const rectangle = API.createElement({
      type: "rectangle",
    }) as ExcalidrawRectangleElement;
    const shape = ShapeCache.generateElementShape(rectangle, null);

    expect(rectangle.dimensionality).toBe("2d");
    expect(Array.isArray(shape)).toBe(false);
  });
});

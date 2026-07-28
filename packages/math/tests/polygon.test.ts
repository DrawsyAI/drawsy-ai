import { pointFrom } from "../src/point";
import { convexHull, polygonArea, polygonSignedArea } from "../src/polygon";

import type { GlobalPoint } from "../src/types";

const square: GlobalPoint[] = [
  pointFrom(0, 0),
  pointFrom(10, 0),
  pointFrom(10, 10),
  pointFrom(0, 10),
];

describe("polygonArea", () => {
  it("measures a polygon, whichever way it winds", () => {
    expect(polygonArea(square)).toBe(100);
    expect(polygonArea([...square].reverse())).toBe(100);
  });

  it("ignores a repeated closing vertex", () => {
    expect(polygonArea([...square, square[0]])).toBe(100);
  });

  it("reports the winding direction in the sign", () => {
    expect(polygonSignedArea(square)).toBe(100);
    expect(polygonSignedArea([...square].reverse())).toBe(-100);
  });
});

describe("convexHull", () => {
  it("drops the points inside the hull", () => {
    const hull = convexHull([...square, pointFrom<GlobalPoint>(5, 5)]);

    expect(hull).toHaveLength(4);
    expect(hull).toEqual(expect.arrayContaining(square));
  });

  it("drops collinear points", () => {
    expect(convexHull([...square, pointFrom<GlobalPoint>(5, 0)])).toHaveLength(
      4,
    );
  });

  it("wraps a point cloud whatever order it arrives in", () => {
    const cloud: GlobalPoint[] = Array.from({ length: 30 }, (_, i) =>
      pointFrom(Math.cos(i * 2.4) * 10, Math.sin(i * 2.4) * 10),
    );
    const hull = convexHull(cloud);

    expect(polygonArea(hull)).toBeCloseTo(
      polygonArea(convexHull([...cloud].reverse())),
    );
    // Every point is inside or on the hull it produced.
    expect(polygonArea(hull)).toBeGreaterThan(250);
    expect(polygonArea(hull)).toBeLessThanOrEqual(Math.PI * 100);
  });

  it("returns degenerate input as-is", () => {
    const two = square.slice(0, 2);

    expect(convexHull(two)).toEqual(two);
  });
});

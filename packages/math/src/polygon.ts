import { pointsEqual } from "./point";
import { lineSegment, pointOnLineSegment } from "./segment";
import { PRECISION } from "./utils";

import type { GlobalPoint, LocalPoint, Polygon } from "./types";

export function polygon<Point extends GlobalPoint | LocalPoint>(
  ...points: Point[]
) {
  return polygonClose(points) as Polygon<Point>;
}

export function polygonFromPoints<Point extends GlobalPoint | LocalPoint>(
  points: Point[],
) {
  return polygonClose(points) as Polygon<Point>;
}

export const polygonIncludesPoint = <Point extends LocalPoint | GlobalPoint>(
  point: Point,
  polygon: Polygon<Point>,
) => {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    if (
      ((yi > y && yj <= y) || (yi <= y && yj > y)) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
};

export const polygonIncludesPointNonZero = <Point extends [number, number]>(
  point: Point,
  polygon: Point[],
): boolean => {
  const [x, y] = point;
  let windingNumber = 0;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi <= y) {
      if (yj > y) {
        if ((xj - xi) * (y - yi) - (x - xi) * (yj - yi) > 0) {
          windingNumber++;
        }
      }
    } else if (yj <= y) {
      if ((xj - xi) * (y - yi) - (x - xi) * (yj - yi) < 0) {
        windingNumber--;
      }
    }
  }

  return windingNumber !== 0;
};

export const pointOnPolygon = <Point extends LocalPoint | GlobalPoint>(
  p: Point,
  poly: Polygon<Point>,
  threshold = PRECISION,
) => {
  let on = false;

  for (let i = 0, l = poly.length - 1; i < l; i++) {
    if (pointOnLineSegment(p, lineSegment(poly[i], poly[i + 1]), threshold)) {
      on = true;
      break;
    }
  }

  return on;
};

function polygonClose<Point extends LocalPoint | GlobalPoint>(
  polygon: Point[],
) {
  return polygonIsClosed(polygon)
    ? polygon
    : ([...polygon, polygon[0]] as Polygon<Point>);
}

export function polygonIsClosed<Point extends LocalPoint | GlobalPoint>(
  polygon: readonly Point[],
  tolerance: number = PRECISION,
) {
  return pointsEqual(polygon[0], polygon[polygon.length - 1], tolerance);
}

/**
 * The signed area of a polygon via the shoelace formula. Positive when the
 * vertices wind counter-clockwise in a y-down coordinate system.
 *
 * The polygon may be given open or closed; a closing vertex is ignored.
 */
export function polygonSignedArea<Point extends LocalPoint | GlobalPoint>(
  polygon: readonly Point[],
): number {
  const pts = polygonIsClosed(polygon) ? polygon.slice(0, -1) : polygon;
  let sum = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    sum += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return sum / 2;
}

export function polygonArea<Point extends LocalPoint | GlobalPoint>(
  polygon: readonly Point[],
): number {
  return Math.abs(polygonSignedArea(polygon));
}

/**
 * The convex hull of a point set via Andrew's monotone chain.
 *
 * @returns The hull vertices in counter-clockwise order (y-down), without a
 * repeated closing vertex.
 */
export function convexHull<Point extends LocalPoint | GlobalPoint>(
  points: readonly Point[],
): Point[] {
  if (points.length < 3) {
    return [...points];
  }

  const sorted = [...points].sort((a, b) =>
    a[0] === b[0] ? a[1] - b[1] : a[0] - b[0],
  );

  // Cross product of OA x OB. Negative means the turn O->A->B is clockwise.
  const cross = (o: Point, a: Point, b: Point) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const half = (pts: Point[]) => {
    const chain: Point[] = [];
    for (const p of pts) {
      while (
        chain.length >= 2 &&
        cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0
      ) {
        chain.pop();
      }
      chain.push(p);
    }
    chain.pop(); // shared with the other half's first vertex
    return chain;
  };

  const hull = [...half(sorted), ...half([...sorted].reverse())];

  return hull.length >= 3 ? hull : [...points];
}

import { KEYS } from "@excalidraw/common";

import {
  SelectionIcon,
  RectangleIcon,
  DiamondIcon,
  EllipseIcon,
  ArrowIcon,
  LineIcon,
  FreedrawIcon,
  drawShapeToolIcon,
  TextIcon,
  ImageIcon,
  EraserIcon,
  laserPointerToolIcon,
  handIcon,
} from "./icons";

import type { AppClassProperties } from "../types";

export const SHAPES = [
  {
    icon: handIcon,
    value: "hand",
    key: KEYS.H,
    numericKey: null,
    fillable: false,
    toolbar: true,
  },
  {
    icon: SelectionIcon,
    value: "selection",
    key: KEYS.V,
    numericKey: KEYS["1"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: RectangleIcon,
    value: "rectangle",
    key: KEYS.R,
    numericKey: KEYS["2"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: DiamondIcon,
    value: "diamond",
    key: KEYS.D,
    numericKey: KEYS["3"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: EllipseIcon,
    value: "ellipse",
    key: KEYS.O,
    numericKey: KEYS["4"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: ArrowIcon,
    value: "arrow",
    key: KEYS.A,
    numericKey: KEYS["5"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: LineIcon,
    value: "line",
    key: KEYS.L,
    numericKey: KEYS["6"],
    fillable: true,
    toolbar: true,
  },
  {
    icon: FreedrawIcon,
    value: "freedraw",
    key: [KEYS.P, KEYS.X],
    numericKey: KEYS["7"],
    fillable: false,
    toolbar: true,
  },
  {
    icon: TextIcon,
    value: "text",
    key: KEYS.T,
    numericKey: KEYS["8"],
    fillable: false,
    toolbar: true,
  },
  {
    icon: ImageIcon,
    value: "image",
    key: null,
    numericKey: KEYS["9"],
    fillable: false,
    toolbar: true,
  },
  {
    icon: EraserIcon,
    value: "eraser",
    key: KEYS.E,
    numericKey: KEYS["0"],
    fillable: false,
    toolbar: true,
  },
  {
    icon: laserPointerToolIcon,
    value: "laser",
    key: KEYS.K,
    numericKey: null,
    fillable: false,
    toolbar: false,
  },
  {
    icon: drawShapeToolIcon,
    value: "autoshape",
    key: KEYS.X,
    shiftKey: true,
    numericKey: null,
    fillable: false,
    toolbar: false,
  },
] as const;

export const getToolbarTools = (app: AppClassProperties) => {
  return app.state.preferredSelectionTool.type === "lasso"
    ? ([
        SHAPES[0],
        {
          ...SHAPES[1],
          value: "lasso",
        },
        ...SHAPES.slice(2),
      ] as const)
    : SHAPES;
};

export const findShapeByKey = (
  key: string,
  app: AppClassProperties,
  shiftKey = false,
) => {
  const normalizedKey = key.toLowerCase();
  const shape = getToolbarTools(app).find((shape) => {
    const requiresShift = "shiftKey" in shape && shape.shiftKey;
    return (
      shiftKey === requiresShift &&
      ((shape.numericKey != null && key === shape.numericKey.toString()) ||
        (shape.key &&
          (typeof shape.key === "string"
            ? shape.key === normalizedKey
            : (shape.key as readonly string[]).includes(normalizedKey))))
    );
  });
  return shape?.value || null;
};

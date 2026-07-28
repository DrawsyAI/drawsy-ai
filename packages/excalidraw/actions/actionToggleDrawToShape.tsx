import { CaptureUpdateAction } from "@excalidraw/element";

import { InfoIcon } from "../components/icons";
import { Switch } from "../components/Switch";
import { Tooltip } from "../components/Tooltip";
import { t } from "../i18n";

import { register } from "./register";

export const actionToggleDrawToShape = register<boolean>({
  name: "toggleDrawToShape",
  label: "labels.drawToShape",
  viewMode: false,
  trackEvent: {
    category: "toolbar",
    action: "draw_to_shape",
  },
  perform: (elements, appState, enabled) => ({
    appState: {
      ...appState,
      isDrawToShapeEnabled:
        typeof enabled === "boolean" ? enabled : !appState.isDrawToShapeEnabled,
    },
    captureUpdate: CaptureUpdateAction.NEVER,
  }),
  checked: (appState) => appState.isDrawToShapeEnabled,
  PanelComponent: ({ appState, updateData }) => (
    <fieldset className="draw-to-shape-setting">
      <legend>{t("labels.drawingMode")}</legend>
      <div className="draw-to-shape-setting__row">
        <span className="draw-to-shape-setting__title">
          <label
            className="draw-to-shape-setting__label"
            htmlFor="draw-to-shape-switch"
          >
            {t("labels.drawToShape")}
          </label>
          <Tooltip label={t("labels.drawToShapeDescription")}>
            <span
              className="draw-to-shape-setting__info"
              aria-label={t("labels.drawToShapeDescription")}
            >
              {InfoIcon}
            </span>
          </Tooltip>
        </span>
        <label
          className="draw-to-shape-setting__control"
          htmlFor="draw-to-shape-switch"
        >
          <Switch
            name="draw-to-shape-switch"
            checked={appState.isDrawToShapeEnabled}
            onChange={updateData}
            size="small"
          />
        </label>
      </div>
    </fieldset>
  ),
});

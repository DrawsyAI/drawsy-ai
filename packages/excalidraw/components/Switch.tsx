import clsx from "clsx";

import "./Switch.scss";

export type SwitchProps = {
  name: string;
  checked: boolean;
  title?: string;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  size?: "default" | "small";
};

export const Switch = ({
  title,
  name,
  checked,
  onChange,
  disabled = false,
  size = "default",
}: SwitchProps) => {
  return (
    <div
      className={clsx("Switch", {
        toggled: checked,
        disabled,
        "Switch--small": size === "small",
      })}
    >
      <input
        name={name}
        id={name}
        title={title}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}
        onKeyDown={(event) => {
          if (event.key === " ") {
            onChange(!checked);
          }
        }}
      />
    </div>
  );
};

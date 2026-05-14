/**
 * Shared Ui Src Index public module surface.
 */
// fallow-ignore-file coverage-gaps
import { cx } from "@canaveral/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Shared button primitive for web surfaces. */
export function Button({
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

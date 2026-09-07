import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";
import { MaterialSymbol } from "../icons/MaterialSymbol";

export interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Field-level validation message; renders below the input and marks it invalid. */
  errorText?: string;
  /** Adds a show/hide toggle button, for password fields. */
  isPassword?: boolean;
}

/**
 * Labeled text input matching the input styling already used elsewhere in
 * the app (Settings' number fields, the top-bar search field) - same
 * surface/border/radius/focus tokens, just reused here for Login/Signup so
 * the auth screens read as part of the same design system.
 */
export function AuthTextField({
  label,
  errorText,
  isPassword = false,
  className,
  ...rest
}: AuthTextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : rest.type;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...rest}
          type={inputType}
          aria-invalid={Boolean(errorText)}
          aria-describedby={errorText ? `${id}-error` : undefined}
          className={clsx(
            "w-full bg-surface-container-lowest border rounded-sm py-2 px-3 text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 transition-colors",
            isPassword && "pr-10",
            errorText
              ? "border-error focus:border-error focus:ring-error"
              : "border-outline-variant focus:border-outline focus:ring-outline",
            className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline"
          >
            <MaterialSymbol name={visible ? "visibility_off" : "visibility"} className="!text-base" />
          </button>
        )}
      </div>
      {errorText && (
        <p id={`${id}-error`} className="font-body-sm text-body-sm text-error">
          {errorText}
        </p>
      )}
    </div>
  );
}

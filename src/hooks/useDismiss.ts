import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Shared dismiss behavior for popovers/panels (notification panel, the
 * risk filter menu): closes on a click outside `ref`'s subtree or on
 * Escape, whenever `active` is true. No-ops entirely while inactive so
 * it's cheap to leave attached.
 */
export function useDismiss(
  active: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: PointerEvent) {
      const node = ref.current;
      if (node && event.target instanceof Node && !node.contains(event.target)) {
        onDismiss();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismiss();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onDismiss, ref]);
}

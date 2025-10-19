import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook that provides view transition-enabled navigation
 * Falls back to regular navigation if View Transition API is not supported
 */
export function useViewTransition() {
  const navigate = useNavigate();

  const transitionNavigate = useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      // Check if the browser supports View Transitions API
      if (!document.startViewTransition) {
        // Fallback to regular navigation
        if (typeof to === "number") {
          navigate(to);
        } else {
          navigate(to, options);
        }
        return;
      }

      // Use View Transition API for smooth transitions
      document.startViewTransition(() => {
        if (typeof to === "number") {
          navigate(to);
        } else {
          navigate(to, options);
        }
      });
    },
    [navigate]
  );

  return transitionNavigate;
}

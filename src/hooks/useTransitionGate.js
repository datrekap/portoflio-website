import { useCallback } from "react";
import { useWorkTransitionApi } from "../context/WorkVideoTransitionContext";

/**
 * Hold viewport reveal work until any card-to-page video transition settles.
 *
 * Reads the transition state through stable callbacks rather than render state,
 * so effects that use this do not tear down and rebuild on every phase change.
 * Returns `runWhenSettled(fn)`, which runs `fn` now if nothing is in flight and
 * otherwise queues it, handing back a cleanup that cancels the queued run.
 */
export default function useTransitionGate() {
  const { getIsTransitioning, subscribeTransitionSettled } =
    useWorkTransitionApi();

  return useCallback(
    (fn) => {
      if (!getIsTransitioning()) {
        fn();
        return () => {};
      }
      return subscribeTransitionSettled(fn);
    },
    [getIsTransitioning, subscribeTransitionSettled],
  );
}

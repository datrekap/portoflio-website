import { useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";
import { useWorkVideoTransition } from "../../context/WorkVideoTransitionContext";

function WorkVideoTransitionLenisBridge() {
  const lenis = useLenis();
  const { registerLenis } = useWorkVideoTransition();

  useEffect(() => {
    registerLenis(lenis ?? null);
    return () => registerLenis(null);
  }, [lenis, registerLenis]);

  return null;
}

export default WorkVideoTransitionLenisBridge;

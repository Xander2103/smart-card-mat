import { useEffect, useState } from "react";

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1280, isMobile: false, isTablet: false };
  }

  const width = window.innerWidth;
  return {
    width,
    isMobile: width <= 700,
    isTablet: width <= 1024,
  };
}

export function useViewport() {
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    function onResize() {
      setViewport(getViewport());
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewport;
}

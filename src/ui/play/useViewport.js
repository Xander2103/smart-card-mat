import { useEffect, useState } from "react";

function getViewport() {
  if (typeof window === "undefined") {
    return {
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isLandscape: true,
      isMobileLandscape: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= 700;
  const isTablet = width <= 1024;
  const isLandscape = width > height;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isLandscape,
    isMobileLandscape: isMobile && isLandscape,
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

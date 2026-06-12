export function applyDensity(density: "compact" | "comfortable") {
    const root = document.documentElement;
  
    if (density === "compact") {
      root.style.setProperty("--ui-scale", "0.9");
    } else {
      root.style.setProperty("--ui-scale", "1");
    }
  }
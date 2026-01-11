import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import bgGradientDark from "@/assets/bg-gradient-dark.jpg";
import bgGradientLight from "@/assets/bg-gradient-light.jpg";
import bgLightTheme from "@/assets/bg-light-theme.jpg";

interface ThemeBackgroundProps {
  variant?: "dark" | "light";
  overlay?: "light" | "medium" | "heavy";
}

const ThemeBackground = ({ variant = "dark", overlay = "medium" }: ThemeBackgroundProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getBackgroundImage = () => {
    if (!mounted) {
      return variant === "dark" ? bgGradientDark : bgGradientLight;
    }
    
    if (resolvedTheme === "light") {
      return bgLightTheme;
    }
    return variant === "dark" ? bgGradientDark : bgGradientLight;
  };

  const getOverlayOpacity = () => {
    switch (overlay) {
      case "light": return "bg-background/50";
      case "medium": return "bg-background/60";
      case "heavy": return "bg-background/70";
      default: return "bg-background/60";
    }
  };

  return (
    <>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      />
      <div className={`absolute inset-0 ${getOverlayOpacity()} transition-colors duration-500`} />
    </>
  );
};

export default ThemeBackground;

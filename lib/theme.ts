// Theme configuration for TravelTrouve app
// This file ensures consistent styling across all components

export const theme = {
  // Color Palette
  colors: {
    // Primary gradient colors
    primary: {
      blue: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb", // Main blue
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
        950: "#172554",
      },
      purple: {
        50: "#faf5ff",
        100: "#f3e8ff",
        200: "#e9d5ff",
        300: "#d8b4fe",
        400: "#c084fc",
        500: "#a855f7",
        600: "#9333ea", // Main purple
        700: "#7c3aed",
        800: "#6b21a8",
        900: "#581c87",
        950: "#3b0764",
      },
      indigo: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        950: "#1e1b4b", // Main indigo
      },
    },

    // Neutral colors (slate-based)
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8", // Text muted
      500: "#64748b",
      600: "#475569",
      700: "#334155", // Border
      800: "#1e293b", // Surface
      900: "#0f172a", // Surface dark
      950: "#020617", // Background
    },

    // Status colors
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },

    // Accent colors
    accent: {
      yellow: "#fbbf24",
      emerald: "#10b981",
      amber: "#f59e0b",
    },
  },

  // Gradients
  gradients: {
    primary: "from-blue-600 to-purple-600",
    primaryHover: "from-blue-700 to-purple-700",
    background: "from-indigo-950 via-purple-950 to-slate-950",
    card: {
      blue: "from-blue-900/30 to-blue-800/20",
      purple: "from-purple-900/30 to-purple-800/20",
      emerald: "from-emerald-900/30 to-emerald-800/20",
      amber: "from-amber-900/30 to-amber-800/20",
    },
  },

  // Spacing
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Border radius
  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Consolas", "monospace"],
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glow: {
      blue: "0 0 20px rgb(59 130 246 / 0.3)",
      purple: "0 0 20px rgb(147 51 234 / 0.3)",
      primary: "0 0 30px rgb(59 130 246 / 0.25)",
    },
  },

  // Animations
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Component specific styles
  components: {
    navbar: {
      height: "4rem", // 64px
      background: "bg-slate-950/90",
      backdrop: "backdrop-blur-xl",
      border: "border-slate-800/50",
    },

    card: {
      background: "bg-slate-900/30",
      border: "border-slate-700/50",
      backdrop: "backdrop-blur-sm",
      radius: "rounded-xl",
    },

    button: {
      primary: {
        background: "bg-gradient-to-r from-blue-600 to-purple-600",
        hover: "hover:from-blue-700 hover:to-purple-700",
        radius: "rounded-xl",
        shadow: "shadow-lg hover:shadow-blue-500/25",
      },
      secondary: {
        background: "bg-slate-800/50",
        hover: "hover:bg-slate-700",
        border: "border-slate-600",
        radius: "rounded-xl",
      },
    },

    input: {
      background: "bg-slate-900/50",
      border: "border-slate-700",
      focus: "focus:border-blue-500",
      radius: "rounded-xl",
    },
  },
};

// Utility functions for consistent styling
export const getThemeColors = () => theme.colors;
export const getGradient = (type: keyof typeof theme.gradients) =>
  theme.gradients[type];
export const getComponentStyle = (component: keyof typeof theme.components) =>
  theme.components[component];

// CSS-in-JS utility for dynamic styles
export const createThemeStyles = (customizations?: Partial<typeof theme>) => ({
  ...theme,
  ...customizations,
});

export default theme;

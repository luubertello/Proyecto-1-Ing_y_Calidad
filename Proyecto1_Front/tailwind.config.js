import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        geist: ["var(--font-geist-sans)"],
        geistMono: ["var(--font-geist-mono)"],
      },
   colors: {
      // 🎨 Paleta corporativa: azul, blanco y grises

      principal: "#2563eb",          // Azul corporativo principal
      hoverPrincipal: "#1d4ed8",     // Azul más oscuro para hover
      principalDark: "#1e3a8a",      // Azul marino profundo

      background: "#f8fafc",         // Fondo general gris muy claro
      surface: "#ffffff",            // Blanco para cards y secciones

      onPrimary: "#ffffff",          // Texto sobre azul
      onSurface: "#1e293b",          // Texto principal sobre fondos claros

      accent: "#dbeafe",             // Azul muy suave para detalles/bordes
      darkBg: "#0f172a",              // Fondo oscuro azul/gris
      darkText: "#e2e8f0",            // Texto claro en modo oscuro

      footer: "#1e293b",             // Footer azul grisáceo oscuro

      primary: "#2563eb",             // Azul corporativo principal
      "primary-foreground": "#ffffff",

      secondary: "#eff6ff",           // Azul muy claro
      "secondary-foreground": "#1e3a8a",

      destructive: "#dc2626",         // Rojo para acciones destructivas
      "destructive-foreground": "#ffffff",

      "accent-foreground": "#1d4ed8",

      ring: "#93c5fd",                // Azul claro para focus
      input: "#cbd5e1",               // Gris azulado para inputs

      gradientSoft: "#f8fafc",       // Gris/blanco muy sutil
      gradientLight: "#eff6ff",      // Azul muy claro
      gradientWarm: "#dbeafe",       // Azul suave para final del gradiente
    },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".label-base": {
          fontSize: "0.75rem",      // text-xs
          fontWeight: "500",        // font-medium
          color: "#4b5563",         // text-gray-600
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",           // gap-1
        },
        ".btn": {
          width: "20rem",
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          borderRadius: "0.5rem",
          transitionProperty: "all",
          transitionDuration: "200ms",
          fontWeight: "500",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        ".btn-primary": {
          backgroundColor: "#b5854c", // dorado cálido principal
          color: "#ffffff",           // texto claro para contraste
          "&:hover": {
            backgroundColor: "#8a6639", // dorado/marrón más oscuro
          },
        },
        ".btn-dark": {
          backgroundColor: "#5c3d2e", // marrón profundo
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#3a2b22", // marrón más oscuro en hover
          },
        },
        ".btn-onClose-title-form": {
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          backgroundColor: "#DC2626", // rojo para cerrar
          color: "#FFFFFF",
          transitionProperty: "all",
          transitionDuration: "200ms",
          "&:hover": {
            backgroundColor: "#B91C1C", // rojo más oscuro
          },
        },
        // 📝 Formulario
        ".form-header": {
          position: "sticky",
          top: "0px",
          backgroundImage: "linear-gradient(to right, #b5854c, #8a6639)", // degradado dorado a marrón
          color: "#FFFFFF",
          padding: "0.5rem", // p-3
          borderTopLeftRadius: "0.5rem",  // rounded-t-xl
          borderTopRightRadius: "0.5rem",
        },
        ".form-title": {
          fontSize: "1rem",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        },
        ".form-subtitle": {
          color: "#FFFFFF", // gris neutro
          marginTop: "0.25rem",
        },
        "input[type='date']::-webkit-calendar-picker-indicator": {
          opacity: "1",
          cursor: "pointer",
          filter: "brightness(0.3)",
        },
        ".form-icon": {
          width: "1.5rem",
          height: "1.5rem",
          color: "#0a0a0aff", // dorado cálido
        },
        ".consultar-icon": {
          width: "1.5rem",
          height: "1.5rem",
          color: "#8a6639", // marrón/dorado oscuro
        },
        /* inputs compactos estilo encabezado */
        ".font-input-cabecera": {
          height: "36px",
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem",
          fontSize: "0.875rem",
          backgroundColor: "#f3f4f6", // gray-100
          borderWidth: "1px",
          borderColor: "#d1d5db",     // gray-300
          borderRadius: "0.375rem",  // rounded-md
          color: "#000000",
        },

        ".row-pendiente": {
          backgroundColor: "#fff7ed", /* naranja suave */
        },

        ".row-parcial": {
          backgroundColor: "#fef9c3", /* amarillo */
        },

        ".row-entregado": {
          backgroundColor: "#ecfdf5", /* verde suave */
        }


      });
    }),
  ],
};

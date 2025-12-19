/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          ink: "#0B0F19",
          stone: "#111827",
          mute: "#5B6170",
          brand: {
            50: "#EEF6FF",
            100: "#D9ECFF",
            200: "#B7DAFF",
            300: "#8AC1FF",
            400: "#5AA4FF",
            500: "#2B87FF",
            600: "#176FF1",
            700: "#1156BE",
            800: "#0F4697",
            900: "#0E3A7B"
          }
        },
        boxShadow: {
          soft: "0 10px 30px rgba(0,0,0,0.08)"
        },
        borderRadius: {
          xl2: "1rem",
          xl3: "1.25rem"
        }
      }
    },
    plugins: []
  }
  
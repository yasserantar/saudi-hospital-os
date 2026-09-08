/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { cairo: ["Cairo", "system-ui", "sans-serif"] },
      colors: {
        teal: { 50:"#e6fbf8", 100:"#b8f1ea", 400:"#2dd4bf", 500:"#14b8a6", 600:"#0d9488" },
        emerald: { 400:"#34d399", 500:"#10b981" },
        royal: { 900:"#0a0e1a", 800:"#0f1626", 700:"#1a2236" },
      },
      backgroundImage: {
        "teal-gradient": "linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)",
        "glass-dark": "linear-gradient(135deg, rgba(26,34,54,0.65) 0%, rgba(10,14,26,0.85) 100%)",
      },
      boxShadow: { glass: "0 8px 32px 0 rgba(45, 212, 191, 0.10)", teal: "0 0 24px rgba(45, 212, 191, 0.35)" },
      animation: { "fade-in": "fadeIn 0.6s ease-in-out", shimmer: "shimmer 2.5s linear infinite" },
      keyframes: {
        fadeIn: { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

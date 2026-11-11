module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { ink: "#211C30", paper: "#FAF9FC", brand: "#6436C9" },
      fontFamily: {
        poppins: ["Poppins-Regular"],
        medium: ["Poppins-Medium"],
        semibold: ["Poppins-SemiBold"],
      },
    },
  },
  plugins: [],
};

import React from "react";

// Blue color theme
const COLORS = {
  background: "#050d1a",
  badgeBg: "rgba(59,130,246,0.8)",
  badgeText: "#fff",
  badgeShadow: "0 1px 4px rgba(0,0,0,0.15)",
  blue: "#3b82f6",
  blueLight: "#93c5fd",
  blueBorder: "#60a5fa",
  blueDark: "#2563eb",
  white: "#fff",
};

const HeroPage = () => {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen px-4 transition-all duration-300 relative overflow-hidden"
      style={{
        background: COLORS.background,
      }}
    >
      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Heading with highlight */}
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
          <span style={{ color: COLORS.white }}>Welcome to </span>
          <span
            className="bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${COLORS.blueBorder}, ${COLORS.blueDark})`,
            }}
          >
            TravelTrouve
          </span>
        </h1>
        {/* Subtitle with highlight */}
        <p className="text-base sm:text-lg mb-6">
          <span className="font-semibold" style={{ color: COLORS.blueBorder }}>Share</span> your adventures,{" "}
          <span className="font-semibold" style={{ color: COLORS.blueDark }}>connect</span> with friends, and{" "}
          <span className="font-semibold" style={{ color: COLORS.blueBorder }}>create memories</span> together.
        </p>
        {/* Features */}
        <ul className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 text-sm">
          <li className="flex items-center gap-2" style={{ color: COLORS.blueLight }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS.blueBorder }}></span>
            Private group albums
          </li>
          <li className="flex items-center gap-2" style={{ color: COLORS.blueLight }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS.blueDark }}></span>
            Instant photo sharing
          </li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/signup"
            className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-transparent border-2 font-semibold rounded-full shadow transition duration-200 hover:scale-105 focus:outline-none focus:ring-2 relative overflow-hidden"
            style={{
              borderColor: COLORS.blueBorder,
              // color: COLORS.blueLight,
              boxShadow: "0 1px 4px rgba(59,130,246,0.15)",
              background: "rgba(255,255,255,0.04)",
              position: "relative",
              zIndex: 0,
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>Get Started</span>
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto inline-block px-6 sm:px-8 py-3 bg-transparent border-2 font-semibold rounded-full transition duration-200 hover:scale-105 focus:outline-none focus:ring-1 relative  overflow-hidden"
              style={{
              borderColor: COLORS.blueDark,
              background: "rgba(255,255,255,0.04)",
              position: "relative",
              zIndex: 0,
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>Sign In</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroPage;

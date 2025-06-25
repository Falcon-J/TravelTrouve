import React from "react";

const HeroPage = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 text-white px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold mb-4">TravelTrouve</h1>
        <p className="text-lg mb-8">
          A modern travel photo-sharing platform for creating lasting memories
          with your travel groups
        </p>{" "}
        <div className="space-x-4">
          <a
            href="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow hover:bg-blue-100 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroPage;

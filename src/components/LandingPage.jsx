import React from "react";
import { Link } from "react-router-dom";

const LandingSection = () => {
  return (
    <>
      <div className="relative isolate overflow-hidden bg-white px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
        {/* SVG Background */}
        <svg
          viewBox="0 0 1024 1024"
          className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          aria-hidden="true"
        >
          <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="gradient">
              <stop stopColor="#1E3A8A" />
              <stop offset="1" stopColor="#3B82F6" />
            </radialGradient>
          </defs>
        </svg>

        {/* Content */}
        <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Boost your productivity. Start using our app today.
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Ac euismod vel sit maecenas id pellentesque eu sed consectetur. 
            Malesuada adipiscing sagittis vel nulla.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
            <button className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus-visible:outline focus-visible:outline-blue-600">
              Get started
            </button>
            <Link
              to="/QuizPage"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
            >
              Quiz Page <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingSection;
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
<div className="relative isolate overflow-hidden bg-gray-900 px-6 py-16 sm:px-16 md:py-32 min-h-screen">
      <svg
        viewBox="0 0 1024 1024"
        className="absolute right-0 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] lg:left-auto lg:right-1/2 lg:-mr-80"
        aria-hidden="true"
      >
        <circle
          cx="512"
          cy="512"
          r="512"
          fill="url(#gradient)"
          fillOpacity="0.3"
        />
        <defs>
          <radialGradient id="gradient">
            <stop stopColor="#1E3A8A" />
            <stop offset="1" stopColor="#3B82F6" />
          </radialGradient>
        </defs>
      </svg>

      <div className="mx-auto max-w-7xl px-4 w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Text Content */}
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
              Enhance Your Study Sessions with <strong className="text-blue-300">quizGen</strong>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl">
              Quizzing yourself is one of the most effective study techniques,
              reinforcing knowledge through&nbsp;
              <strong className="text-blue-400">active recall</strong>. This
              process helps you identify gaps in understanding, strengthen
              memory retention, and improve long-term learning.
            </p>

            {/* <div className="mt-10 flex flex-col sm:flex-row gap-6 max-w-md">
              <Link
                to="/QuizPage" 
                className="flex-1 rounded-lg bg-blue-600 px-6 py-4 text-center text-lg font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors"
              >
                Generate Quiz Now
              </Link>
              
              <Link
                to="/learn-more"
                className="flex-1 rounded-lg border-2 border-blue-400 px-6 py-4 text-center text-lg font-semibold text-blue-400 hover:bg-gray-800 transition-colors"
              >
                How It Works
              </Link>
            </div> */}
          </div>

          {/* Generate Box */}
          <div className="mt-16 lg:col-span-5 lg:mt-0">
            <div className="relative rounded-2xl bg-gray-800 p-8 shadow-xl ring-1 ring-gray-700/50">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                  <span className="text-2xl font-bold">⚡</span>
                </div>
              </div>

              <h3 className="text-center text-2xl font-bold text-gray-100 mt-6">
                Quick Start
              </h3>
              <p className="mt-4 text-center text-gray-400">
                Paste your study material and get instant quizzes
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">
                    1
                  </div>
                  <p className="ml-4 text-gray-300">Copy your notes/textbook</p>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">
                    2
                  </div>
                  <p className="ml-4 text-gray-300">Paste into our generator</p>
                </div>

                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">
                    3
                  </div>
                  <p className="ml-4 text-gray-300">Get personalized quizzes</p>
                </div>
              </div>

              <Link
                to="/QuizPage"
                className="mt-8 block w-full rounded-md bg-blue-600 px-4 py-3 text-center font-medium text-white shadow hover:bg-blue-500 transition-colors"
              >
                Generate Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

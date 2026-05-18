import { createFileRoute, Link } from "@tanstack/react-router";
import { getToken } from "../utils/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const isLoggedIn = typeof window !== "undefined" ? !!getToken() : false;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-40%] right-[-20%] w-[70%] h-[70%] rounded-full bg-indigo-100 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-40%] left-[-20%] w-[70%] h-[70%] rounded-full bg-purple-100 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-8 border border-indigo-100 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Passwordless{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
            Future
          </span>
        </h1>

        <p className="text-slate-500 text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
          Experience the next generation of authentication natively built with
          WebAuthn and Passkeys for ultimate security and convenience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isLoggedIn ? (
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 flex items-center justify-center"
            >
              Get Started with Passkeys
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 flex items-center justify-center"
            >
              Go to your Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

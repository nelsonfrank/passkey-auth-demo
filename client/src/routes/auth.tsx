import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginWithPasskey, registerAndStorePasskey } from "../utils/auth";
import { Fingerprint, Key, Mail, ArrowRight, ShieldAlert, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const success = await loginWithPasskey();
      if (success) {
        navigate({ to: "/dashboard" });
      } else {
        setError("Failed to login with passkey");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await registerAndStorePasskey(email);
      if (success) {
        navigate({ to: "/dashboard" });
      } else {
        setError("Failed to create passkey");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-100 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white relative transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            {mode === "login" ? (
              /* Premium Interactive Icon for Passkey Login */
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-100 rounded-2xl animate-pulse opacity-75"></div>
                <div className="absolute inset-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <Fingerprint className="h-10 w-10 text-white" />
                </div>
              </div>
            ) : (
              /* Signup Icon */
              <div className="w-16 h-16 bg-linear-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Key className="h-8 w-8 text-indigo-600" />
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight transition-all duration-300">
              {mode === "login" ? "Passkey Login" : "Create Account"}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {mode === "login" 
                ? "Sign in passwordless using your device's biometric scanner or security key"
                : "Register your email first to link your device passkey"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start">
              <ShieldAlert className="h-5 w-5 mr-2 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {mode === "login" ? (
            /* Passkey Login Button View (No Email Form) */
            <div className="space-y-6">
              <button
                onClick={handlePasskeyLogin}
                disabled={isLoading}
                className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <>
                    <span>Login with Passkey</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-400 max-w-xs mx-auto">
                No passwords, no verification codes. Just select your passkey and verify.
              </div>
            </div>
          ) : (
            /* Signup View with Email Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <>
                    <span>Register with Passkey</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-700 focus:outline-none focus:underline transition-colors cursor-pointer"
                title={
                  mode === "login" ? "Switch to signup" : "Switch to login"
                }
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

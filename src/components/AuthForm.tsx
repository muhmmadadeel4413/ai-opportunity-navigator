import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BackButton } from "./BackButton";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export function AuthForm() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    if (isSignUp) {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        // Email confirmation is required — tell the user to check their inbox
        setSuccessMsg(
          "Account created! Check your email for a confirmation link, then sign in."
        );
      } else {
        // Session returned immediately, go to onboarding
        navigate("/onboarding");
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        // Navigate to dashboard — ProtectedRoute will redirect to /onboarding
        // if the user hasn't completed onboarding yet
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect to Google — the page will leave. No state to reset.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't start Google sign-in. Please try again."
      );
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <BackButton fallbackPath="/" />
      </div>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">
              OppNav
            </span>
          </div>
          <p className="text-foreground/60">
            Discover opportunities tailored just for you
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-heading font-semibold text-xl text-foreground mb-1">
            {resetMode
              ? "Reset your password"
              : isSignUp
              ? "Create your account"
              : "Welcome back"}
          </h1>
          <p className="text-sm text-foreground/60 mb-6">
            {resetMode
              ? "Enter your email and we'll send you a reset link"
              : isSignUp
              ? "Start discovering your next opportunity"
              : "Sign in to continue your journey"}
          </p>

          {resetMode ? (
            <>
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-foreground bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {resetSent && (
                  <div className="bg-accent/10 text-accent text-sm rounded-xl px-4 py-3">
                    Reset link sent! Check your email to set a new password.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Sending link...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError("");
                    setSuccessMsg("");
                    setResetSent(false);
                  }}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Back to sign in
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl text-foreground bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 border-border rounded-xl text-foreground bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-accent/10 text-accent text-sm rounded-xl px-4 py-3">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground/40 font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white border-2 border-border rounded-xl text-foreground font-medium hover:bg-muted hover:border-foreground/20 active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full" />
            ) : (
              <SiGoogle className="w-5 h-5" />
            )}
            {googleLoading
              ? "Redirecting to Google..."
              : "Continue with Google"}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccessMsg("");
              }}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

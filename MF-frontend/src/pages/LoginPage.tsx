import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  Building2,
  Shield,
  Users,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useAuthStore, type Role } from "../store/authStore";
import { authService } from "@/services/auth.service";
import type { LoginCredentials } from "@/types/auth.types";

type RoleKey = "admin" | "kiosk" | "agent" | "customer";

const ROLES: {
  key: RoleKey;
  label: string;
  icon: React.ElementType;
  path: string;
  role: Role;
}[] = [
  { key: "admin", label: "Admin", icon: Shield, path: "/admin", role: "admin" },
  {
    key: "kiosk",
    label: "Kiosk",
    icon: Briefcase,
    path: "/kiosk/daily-register",
    role: "kiosk",
  },
  { key: "agent", label: "Agent", icon: Users, path: "/agent", role: "agent" },
  {
    key: "customer",
    label: "Customer",
    icon: User,
    path: "/customer",
    role: "customer",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role, _hasHydrated } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutofill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && role) {
      const foundRole = ROLES.find((r) => r.role === role);
      if (foundRole) {
        navigate(foundRole.path, { replace: true });
      }
    }
  }, [_hasHydrated, isAuthenticated, role, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const credentials: LoginCredentials = {
        username,
        password,
      };

      const response = await authService.login(credentials);

      // Save to store
      login(response);

      // Navigate based on role
      const foundRole = ROLES.find((r) => r.role === response.user.role);
      if (foundRole) {
        console.log("role", foundRole);
        navigate(foundRole.path);
      } else {
        // Fallback or generic dashboard
        navigate("/");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);

      // Improve error message based on error type
      const axiosError = err as AxiosError<{ message?: string }>;

      if (!axiosError.response) {
        // Network error or no response from server
        if (axiosError.code === "ECONNABORTED") {
          setError("Request timeout. Please check your internet connection.");
        } else if (
          axiosError.code === "ERR_NETWORK" ||
          axiosError.code === "ECONNREFUSED" ||
          axiosError.code === "ENOTFOUND"
        ) {
          setError(
            "Cannot connect to server. Please check your internet connection and try again.",
          );
        } else {
          setError(
            "Network error. Please check your internet connection and try again.",
          );
        }
      } else if (axiosError.response.status >= 500) {
        // Server error
        setError("Server error. Please try again later or contact support.");
      } else if (
        axiosError.response.status === 401 ||
        axiosError.response.status === 403
      ) {
        // Authentication error - only show if username/password related
        const message = axiosError.response.data?.message;
        if (message?.includes("Centre") || message?.includes("centre")) {
          setError(`Invalid centre: ${message}`);
        } else {
          setError("Invalid username or password");
        }
      } else {
        // Other errors
        const message = axiosError.response.data?.message;
        setError(message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center p-2 md:p-4 relative bg-background">
      {/* Faint background tint */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 heritage-gradient opacity-10" />
      </div>

      {/* Card */}
      <main className="relative z-10 w-full max-w-5xl h-[90vh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-xl bg-card">
        {/* ── Left Panel ─────────────────────────────────────── */}
        <section className="hidden lg:flex flex-col justify-center p-6 heritage-gradient text-white relative overflow-hidden">
          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span
                className="font-black text-2xl tracking-tight"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Demo Micro Finance Dashboard
              </span>
            </div>

            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight mb-6"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Empowering Communities through <br />
              <span className="text-primary-foreground/90">
                Micro Finance Solutions
              </span>
            </h1>

            <p className="text-white/80 text-lg max-w-md leading-relaxed">
              Manage centres, loans, daily collections, and client ledgers in one secure, unified dashboard.
            </p>
          </div>

          <div className="mt-auto bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white/80 text-white/80" />
              ))}
            </div>
            <p className="italic text-white/90 mb-4 text-sm leading-relaxed">
              "The seamless integration of loans and customer management has
              redefined our operational efficiency."
            </p>
            {/* <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Rajesh Varma</p>
                <p className="text-xs text-[#a6c8ff]">
                  Managing Director, Varma Holdings
                </p>
              </div>
            </div> */}
          </div>
        </section>

        {/* ── Right Panel ────────────────────────────────────── */}
        <section className="flex flex-col p-4 md:p-8 bg-white overflow-y-auto">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span
              className="font-black text-xl text-primary tracking-tight"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Demo Micro Finance Dashboard
            </span>
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h2
              className="text-xl md:text-2xl font-bold text-center text-primary mb-2"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Welcome Back
            </h2>
            <p className="text-center text-muted-foreground">
              Sign in to manage your microfinance operations
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
                Username or Phone Number
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="w-full h-12 bg-muted rounded-xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all border-none disabled:opacity-50"
                  disabled={isLoading}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1 px-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forgot-password");
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 bg-muted rounded-xl pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all border-none disabled:opacity-50"
                  disabled={isLoading}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground font-medium cursor-pointer"
              >
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 heritage-gradient text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Demo Credentials (Click to Autofill)
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                Centre: DEMO
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAutofill("demo", "demo@123")}
                className="bg-white hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all text-left p-2.5 rounded-xl border border-border flex flex-col justify-between"
              >
                <span className="font-bold text-[11px] text-primary mb-1">Admin</span>
                <span className="text-[10px] text-muted-foreground font-mono">demo</span>
                <span className="text-[10px] text-muted-foreground font-mono">demo@123</span>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill("agent.demo", "demo@123")}
                className="bg-white hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all text-left p-2.5 rounded-xl border border-border flex flex-col justify-between"
              >
                <span className="font-bold text-[11px] text-primary mb-1">Agent</span>
                <span className="text-[10px] text-muted-foreground font-mono">agent.demo</span>
                <span className="text-[10px] text-muted-foreground font-mono">demo@123</span>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill("sunita.devi", "demo@123")}
                className="bg-white hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all text-left p-2.5 rounded-xl border border-border flex flex-col justify-between"
              >
                <span className="font-bold text-[11px] text-primary mb-1">Customer (10)</span>
                <span className="text-[10px] text-muted-foreground font-mono">sunita.devi</span>
                <span className="text-[10px] text-muted-foreground font-mono">demo@123</span>
              </button>
            </div>
          </div>

          {/* Legal */}
          <div className="pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Authorized access only. By signing in, you agree to our{" "}
              <a href="#" className="text-primary font-bold hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary font-bold hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      {/* Bottom footer */}
      <footer className="fixed bottom-6 w-full text-center pointer-events-none px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          © 2026 Demo Micro Finance Dashboard. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

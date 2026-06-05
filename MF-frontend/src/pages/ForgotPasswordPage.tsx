import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authService.forgotPassword(identifier);
      setSuccessMsg(res.message);
      // Give them a moment to read, then navigate
      setTimeout(() => {
        const maskedEmailParam = res.maskedEmail
          ? `&email=${encodeURIComponent(res.maskedEmail)}`
          : "";
        navigate(
          `/reset-password?identifier=${encodeURIComponent(identifier)}${maskedEmailParam}`,
        );
      }, 2500);
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center p-2 md:p-4 relative bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 heritage-gradient opacity-10" />
      </div>

      <main className="relative z-10 w-full max-w-lg h-[90vh] md:h-auto overflow-hidden rounded-3xl shadow-xl bg-card flex flex-col p-6 md:p-10">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold">Back</span>
        </button>

        <div className="flex flex-col items-center mb-8 mt-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-center text-primary mb-2"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Forgot Password
          </h2>
          <p className="text-center text-muted-foreground max-w-[280px]">
            Enter your admin username or email to receive a password reset OTP.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 px-1">
              Username or Email
            </label>
            <div className="relative group">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="Enter your username or email"
                className="w-full h-12 bg-muted rounded-xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all border-none disabled:opacity-50"
                disabled={isLoading || !!successMsg}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!successMsg}
            className="w-full h-14 heritage-gradient text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : successMsg ? (
              <span>Redirecting...</span>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";

export function useLogout() {
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();

  const handleLogout = useCallback(() => {
    const tokenToInvalidate = refreshToken; // capture before logout() clears it
    logout(); // clears store + localStorage
    if (tokenToInvalidate) {
      authService.logout(tokenToInvalidate).catch(() => {
        // fire-and-forget — local logout already happened
      });
    }
    navigate("/");
  }, [refreshToken, logout, navigate]);

  return { handleLogout };
}

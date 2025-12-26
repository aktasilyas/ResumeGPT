import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";
import { postJson } from "@/lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        console.log("Auth callback - Full URL:", window.location.href);
        console.log("Auth callback - Hash:", hash);

        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get("session_id");
        console.log("Auth callback - Session ID:", sessionId);

        if (!sessionId) {
          console.error("No session_id in URL");
          navigate("/", { replace: true });
          return;
        }

        console.log("Auth callback - Exchanging session_id for token...");
        // Exchange session_id for session_token
        let user;
        try {
          user = await postJson(`/auth/session`, { session_id: sessionId });
          console.log("Auth callback - User received:", user);
        } catch (sessionError) {
          console.error("Auth callback - Session exchange failed:", sessionError);
          console.error("Auth callback - Error details:", {
            message: sessionError.message,
            status: sessionError.status,
            stack: sessionError.stack
          });
          throw sessionError;
        }

        // Update auth context
        await login(user);

        // Clear the hash and navigate to dashboard
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}

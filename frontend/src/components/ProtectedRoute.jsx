import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, setUser } = useAuth();

  useEffect(() => {
    // If user data was passed from login/register, update context
    if (location.state?.user && !user) {
      setUser(location.state.user);
    }
  }, [location.state, user, setUser]);

  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!isLoading && !isAuthenticated && !location.state?.user) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.state]);

  // Still loading auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated and no passed user data
  if (!isAuthenticated && !location.state?.user) {
    return null;
  }

  return children;
}

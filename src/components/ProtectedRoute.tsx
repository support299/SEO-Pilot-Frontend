import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/ui/Feedback";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading your session…" />
      </div>
    );
  }

  if (!user) return <Navigate to="/sign-in" replace />;

  return <>{children}</>;
}

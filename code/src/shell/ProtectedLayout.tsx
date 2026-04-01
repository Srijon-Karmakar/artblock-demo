import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export const ProtectedLayout = () => {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="status-screen">
        <div className="status-screen__card">
          <p>Loading account state...</p>
        </div>
      </div>
    );
  }

  if (status === "disabled") {
    return (
      <div className="status-screen">
        <div className="status-screen__card">
          <p>Configure Supabase environment variables before accessing the dashboard.</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="dashboard-shell">
      <Outlet />
    </div>
  );
};

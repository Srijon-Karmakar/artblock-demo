import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "../components/layout/BottomNav";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { useAuth } from "../providers/AuthProvider";

export const AppShell = () => {
  const { status } = useAuth();
  const location = useLocation();
  const isAuthed = status === "authenticated";
  const isLandingRoute = location.pathname === "/";

  return (
    <div className={`app-frame${isAuthed ? " app-frame--authed" : ""}`}>
      <Header />
      <main className={`page-shell${isLandingRoute ? " page-shell--landing" : ""}`}>
        <Outlet />
      </main>
      {isAuthed ? <BottomNav /> : <Footer />}
    </div>
  );
};

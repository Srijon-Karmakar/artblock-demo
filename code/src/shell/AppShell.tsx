import { Outlet } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";

export const AppShell = () => (
  <div className="app-frame">
    <Header />
    <main className="page-shell">
      <Outlet />
    </main>
    <Footer />
  </div>
);

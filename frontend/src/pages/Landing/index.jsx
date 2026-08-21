import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/AuthContext";
import { AUTH_TOKEN, AUTH_USER } from "@/utils/constants";
import Navigation from "./components/Navigation";
import HeroVisual from "./components/HeroVisual";
import Hero from "./components/Hero";
import Metrics from "./components/Metrics";
import Capabilities from "./components/Capabilities";
import Process from "./components/Process";
import Philosophy from "./components/Philosophy";
import Footer from "./components/Footer";
import GuestModeModal from "@/components/Modals/GuestModeModal";

export default function LandingPage() {
  const { store } = useContext(AuthContext) || { store: {} };
  const storedToken = localStorage.getItem(AUTH_TOKEN);
  const storedUser = localStorage.getItem(AUTH_USER);
  const isAuthenticated = !!store?.authToken || (!!storedToken && !!storedUser);

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const handleOpenGuestModal = () => setIsGuestModalOpen(true);
  const handleCloseGuestModal = () => setIsGuestModalOpen(false);

  // If user is authenticated, redirect away from root (/) to /workspace
  if (isAuthenticated) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div
      className="bg-[#080808] text-[#FFFFFF] overflow-x-hidden antialiased selection:bg-neutral-800 selection:text-white min-h-screen relative font-sans"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Procedural Noise Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* WebGL Ambient Mesh Canvas */}
      <HeroVisual />

      {/* Ambient Vignette Overlay */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 0%, rgba(8,8,8,0.85) 100%)",
        }}
      />

      {/* Top Fixed Navigation */}
      <Navigation
        isAuthenticated={isAuthenticated}
        onOpenGuestModal={handleOpenGuestModal}
      />

      {/* Main Viewport & Scroll Sections */}
      <main className="relative z-10 w-full">
        <Hero
          isAuthenticated={isAuthenticated}
          onOpenGuestModal={handleOpenGuestModal}
        />
        <Metrics />
        <Capabilities />
        <Process />
        <Philosophy
          isAuthenticated={isAuthenticated}
          onOpenGuestModal={handleOpenGuestModal}
        />
      </main>

      {/* Bottom Details Footer */}
      <Footer />

      {/* Guest Mode PIN Modal */}
      <GuestModeModal
        isOpen={isGuestModalOpen}
        onClose={handleCloseGuestModal}
      />
    </div>
  );
}

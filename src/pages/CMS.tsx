import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CMSManager from "@/components/cms/CMSManager";
import { useAuth } from "@/hooks/useAuth";

export default function CMSPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <main className="container px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 flex-1">
        <CMSManager />
      </main>
      <Footer />
    </div>
  );
}

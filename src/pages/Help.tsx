import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HelpAndHowTo from "@/components/HelpAndHowTo";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors font-mono uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
        <HelpAndHowTo />
      </main>
      <Footer />
    </div>
  );
}

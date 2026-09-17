import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Site } from "@/types";

// Landing page section components
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import { HollywoodGeniusShowcase } from "@/components/landing/HollywoodGeniusShowcase";
import { HollywoodGeniusModal } from "@/components/HollywoodGeniusModal";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

// Authenticated studio dashboard components
import StudioNavbar from "@/components/Navbar";
import StudioFooter from "@/components/Footer";
import CreatorDashboard from "@/components/CreatorDashboard";
import StorageDashboard from "@/components/StorageDashboard";
import CloudConnections from "@/components/CloudConnections";
import SyncDashboard from "@/components/SyncDashboard";
import EPKBuilder from "@/components/EPKBuilder";
import CMSManager from "@/components/cms/CMSManager";
import { GoogleDocsManager } from "@/components/docs/GoogleDocsManager";
import { CreateSiteDocDialog } from "@/components/docs/CreateSiteDocDialog";
import HelpAndHowTo from "@/components/HelpAndHowTo";
import UpgradeCallout from "@/components/UpgradeCallout";
import { Button } from "@/components/ui/button";
import { Music, Eye, Loader2, Plus, FileText, Sparkles, Clapperboard } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [selectedSiteForDoc, setSelectedSiteForDoc] = useState<Site | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isGeniusOpen, setIsGeniusOpen] = useState(false);
  const [geniusPrompt, setGeniusPrompt] = useState<string | undefined>(undefined);

  const handleOpenGenius = (prompt?: string) => {
    setGeniusPrompt(prompt);
    setIsGeniusOpen(true);
  };

  const fetchSites = useCallback(async () => {
    if (!user) return;
    setLoadingSites(true);
    try {
      const q = query(
        collection(db, "sites"), 
        where("user_id", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const sitesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site));
      setSites(sitesData);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
    setLoadingSites(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSites();
    }
  }, [user, fetchSites]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // If user is logged in, show their dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <StudioNavbar />
        <main className="container px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12 space-y-12">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">Your Studio</h1>
              <p className="text-muted-foreground">Manage your sovereign digital presence</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => handleOpenGenius()} 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-bold rounded-full w-full sm:w-auto justify-center shadow-lg shadow-amber-500/20 border-0"
              >
                <Clapperboard className="w-4 h-4 mr-2" />
                Hollywood Genius AI
              </Button>
              <Button onClick={() => navigate("/build?tab=portfolio")} variant="hero" className="rounded-full w-full sm:w-auto justify-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Portfolio Generator
              </Button>
              <Button onClick={() => navigate("/build?tab=ai")} variant="outline" className="rounded-full w-full sm:w-auto justify-center border-white/20">
                <Plus className="w-4 h-4 mr-2" />
                Create New Site
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingSites ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            ) : sites.length > 0 ? (
              sites.map((site) => (
                <div key={site.id} className="group bg-card border border-glass-border rounded-3xl p-6 space-y-6 hover:border-gold/50 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{site.name || "Untitled Site"}</h3>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">{site.status}</p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/preview/${site.id}`)}
                    className="w-full rounded-full bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Site
                  </Button>
                  <Button 
                    onClick={() => navigate(`/mail?siteId=${site.id}`)}
                    className="w-full rounded-full bg-gold text-white font-semibold hover:bg-gold/90 shadow-md shadow-gold/20"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Manage Mail
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedSiteForDoc(site);
                      setIsDocModalOpen(true);
                    }}
                    className="w-full rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:text-blue-300"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Site Google Doc
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-6 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <Music className="w-12 h-12 text-white/20 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">No sites yet</h3>
                  <p className="text-muted-foreground">Talk to the AI to design your first digital monolith.</p>
                </div>
                <Button onClick={() => navigate("/build")} variant="hero" className="rounded-full">
                  Start Designing
                </Button>
              </div>
            )}
          </div>
          
          <CMSManager embedded />
          <div id="google-docs-manager">
            <GoogleDocsManager allSites={sites} />
          </div>
          <CreatorDashboard />
          <StorageDashboard />
          <CloudConnections />
          <div id="sync-dashboard">
            <SyncDashboard />
          </div>
          <EPKBuilder />
          
          <div id="help">
            <HelpAndHowTo />
          </div>
          
          <UpgradeCallout />

          <CreateSiteDocDialog
            open={isDocModalOpen}
            onOpenChange={setIsDocModalOpen}
            site={selectedSiteForDoc}
            allSites={sites}
          />

          <HollywoodGeniusModal
            isOpen={isGeniusOpen}
            onClose={() => setIsGeniusOpen(false)}
            initialPrompt={geniusPrompt}
          />
        </main>
        <StudioFooter />
      </div>
    );
  }

  // If user is not logged in, assemble the landing page layout with semantic HTML structure
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-gold selection:text-white">
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
        {/* Hollywood Genius Showcase - The Primary Selling Point */}
        <HollywoodGeniusShowcase onOpenGenius={handleOpenGenius} />
        <Problem />
        <Solution />
        <HowItWorks />
        <Features />
        <div id="help" className="py-12 bg-zinc-950/20">
          <div className="max-w-5xl mx-auto px-4">
            <HelpAndHowTo />
          </div>
        </div>
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />

      <HollywoodGeniusModal
        isOpen={isGeniusOpen}
        onClose={() => setIsGeniusOpen(false)}
        initialPrompt={geniusPrompt}
      />
    </div>
  );
};

export default Index;

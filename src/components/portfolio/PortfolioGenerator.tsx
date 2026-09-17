import { useState, useEffect } from "react";
import { PortfolioData } from "@/types/portfolio";
import { 
  MUSICIAN_PRESET, 
  ACTOR_PRESET, 
  DUAL_CREATOR_PRESET,
  BEST_BOY_ELECTRIC_PRESET,
  KEY_GRIP_PRESET,
  CINEMATOGRAPHER_PRESET,
  SOUND_MIXER_PRESET,
  DIRECTOR_PRESET
} from "@/lib/portfolioPresets";
import { generateSEOSchema, auditSEOSchema } from "@/lib/seoSchemaGenerator";
import ProfileForm from "./ProfileForm";
import ShowreelsManager from "./ShowreelsManager";
import DiscographyManager from "./DiscographyManager";
import HeadshotsManager from "./HeadshotsManager";
import { FilmCreditsManager } from "./FilmCreditsManager";
import { EquipmentKitManager } from "./EquipmentKitManager";
import SEOSchemaViewer from "./SEOSchemaViewer";
import LivePortfolioPreview from "./LivePortfolioPreview";
import { HollywoodGeniusModal } from "@/components/HollywoodGeniusModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Film, 
  Disc3, 
  Camera, 
  Code2, 
  Eye, 
  Save, 
  Loader2, 
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  Share2,
  Layers,
  ArrowRight,
  Wrench,
  Clapperboard,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function PortfolioGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState<PortfolioData>(BEST_BOY_ELECTRIC_PRESET);
  const [activeTab, setActiveTab] = useState<"profile" | "showreels" | "credits" | "gear" | "discography" | "headshots" | "preview" | "schema">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [hasLoadedFirebase, setHasLoadedFirebase] = useState(false);
  const [isGeniusOpen, setIsGeniusOpen] = useState(false);
  const [geniusPrompt, setGeniusPrompt] = useState<string | undefined>(undefined);

  // Calculate audit score for the badge
  const audit = auditSEOSchema(portfolio);

  const openGeniusWithPrompt = (prompt?: string) => {
    setGeniusPrompt(prompt);
    setIsGeniusOpen(true);
  };

  // Load user's saved portfolio from Firestore if available
  useEffect(() => {
    if (!user || hasLoadedFirebase) return;

    const loadUserPortfolio = async () => {
      try {
        const docRef = doc(db, "portfolios", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as PortfolioData;
          setPortfolio(data);
        }
      } catch (err) {
        console.warn("Could not load user portfolio from Firestore:", err);
      } finally {
        setHasLoadedFirebase(true);
      }
    };

    loadUserPortfolio();
  }, [user, hasLoadedFirebase]);

  const handleSavePortfolio = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your portfolio to your cloud account.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave: PortfolioData = {
        ...portfolio,
        user_id: user.uid,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "portfolios", user.uid), dataToSave);
      toast({
        title: "Portfolio Saved Successfully",
        description: "Your showreels, discography, headshots, and SEO schema are synced.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error saving portfolio",
        description: (err as Error).message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSiteDraft = async () => {
    if (!user) return;
    setIsDeploying(true);
    try {
      const schema = generateSEOSchema(portfolio);
      const summaryText = `Sovereign Creative Portfolio for ${portfolio.profile.stageName} (${portfolio.profile.discipline}). Features: ${portfolio.showreels.length} showreels, ${portfolio.discography.length} releases, ${portfolio.headshots.length} headshots. Mapped to Schema.org SEO structured data with Google Rich Results score ${audit.score}%.`;

      const newSiteRef = await addDoc(collection(db, "sites"), {
        user_id: user.uid,
        name: `${portfolio.profile.stageName} Portfolio`,
        design_summary: summaryText,
        status: "published",
        portfolio_data: portfolio,
        seo_schema: schema,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Site Draft Created!",
        description: "Your sovereign portfolio site is ready on your dashboard.",
      });

      navigate(`/preview/${newSiteRef.id}`);
    } catch (err: unknown) {
      toast({
        title: "Error deploying site draft",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Preset Switcher */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono uppercase tracking-wider">
                Purpose-Built Portfolio Generator
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                Musicians • Actors • Dual Creators
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Sovereign Portfolio & SEO Schema Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Input showreels, discography, and headshots. Automatically maps to Google Search Knowledge Panel schemas (<code className="text-gold font-mono text-xs">MusicGroup</code>, <code className="text-gold font-mono text-xs">Person</code>, <code className="text-gold font-mono text-xs">VideoObject</code>, <code className="text-gold font-mono text-xs">ImageObject</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => openGeniusWithPrompt()}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 border-0"
            >
              <Clapperboard className="w-3.5 h-3.5 mr-1.5" />
              <span>Hollywood Genius AI</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-zinc-950/20 text-[10px] uppercase font-mono">
                Assistant
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSavePortfolio}
              disabled={isSaving}
              className="border-white/20 text-xs rounded-xl"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5 text-gold" />
              )}
              Save Portfolio
            </Button>

            {user && (
              <Button
                variant="hero"
                size="sm"
                onClick={handleCreateSiteDraft}
                disabled={isDeploying}
                className="text-xs rounded-xl"
              >
                {isDeploying ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                Publish as Site Draft
              </Button>
            )}
          </div>
        </div>

        {/* Quick Demo Templates */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 text-xs text-zinc-400">
          <span className="font-mono text-gold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Load Template:
          </span>
          <button
            type="button"
            onClick={() => setPortfolio(BEST_BOY_ELECTRIC_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white transition-colors font-medium"
          >
            Best Boy Electric (IATSE 728)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(KEY_GRIP_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white transition-colors font-medium"
          >
            Key Grip (IATSE 80)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(CINEMATOGRAPHER_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white transition-colors font-medium"
          >
            Director of Photography (ASC)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(SOUND_MIXER_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white transition-colors font-medium"
          >
            Sound Mixer (CAS / 695)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(DIRECTOR_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white transition-colors font-medium"
          >
            Film Director (DGA)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(ACTOR_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-gold/40 text-zinc-300 hover:text-white transition-colors"
          >
            Actor Demo (SAG-AFTRA)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(MUSICIAN_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-gold/40 text-zinc-300 hover:text-white transition-colors"
          >
            Musician Demo (Abledsoul)
          </button>
          <button
            type="button"
            onClick={() => setPortfolio(DUAL_CREATOR_PRESET)}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-gold/40 text-zinc-300 hover:text-white transition-colors"
          >
            Dual Creator (Elena Cruz)
          </button>
          <button
            type="button"
            onClick={() =>
              setPortfolio({
                profile: {
                  stageName: "",
                  discipline: "film_crew",
                  filmDepartment: "electric_lighting",
                  filmRole: "Best Boy Electric",
                  tagline: "",
                  bio: "",
                  unions: [],
                  primaryGenresOrTypes: [],
                },
                showreels: [],
                discography: [],
                headshots: [],
                filmCredits: [],
                equipmentKit: [],
              })
            }
            className="px-2 py-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors ml-auto flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Blank
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <span>1. Profile & Representation</span>
          {portfolio.profile.stageName && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("showreels")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "showreels"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>2. Showreels ({portfolio.showreels.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credits")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "credits"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <Clapperboard className="w-3.5 h-3.5" />
          <span>3. Film Credits ({portfolio.filmCredits?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gear")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "gear"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>4. Kit & Box Rentals ({portfolio.equipmentKit?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("headshots")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "headshots"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>5. Photos ({portfolio.headshots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("discography")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "discography"
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          <Disc3 className="w-3.5 h-3.5" />
          <span>6. Music ({portfolio.discography.length})</span>
        </button>

        <div className="hidden sm:block h-6 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "preview"
              ? "bg-white text-black shadow-md font-bold"
              : "bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/10"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Portfolio Preview</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === "schema"
              ? "bg-gold/20 text-gold border border-gold font-bold shadow-md shadow-gold/10"
              : "bg-zinc-900/60 text-gold/80 hover:text-gold border border-gold/20"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>SEO Schema</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/20 font-mono">
            {audit.score}%
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "profile" && (
          <ProfileForm
            profile={portfolio.profile}
            onChange={(updated) => setPortfolio({ ...portfolio, profile: updated })}
          />
        )}

        {activeTab === "showreels" && (
          <ShowreelsManager
            showreels={portfolio.showreels}
            onChange={(updated) => setPortfolio({ ...portfolio, showreels: updated })}
          />
        )}

        {activeTab === "credits" && (
          <FilmCreditsManager
            credits={portfolio.filmCredits || []}
            onChange={(updated) => setPortfolio({ ...portfolio, filmCredits: updated })}
          />
        )}

        {activeTab === "gear" && (
          <EquipmentKitManager
            equipment={portfolio.equipmentKit || []}
            onChange={(updated) => setPortfolio({ ...portfolio, equipmentKit: updated })}
          />
        )}

        {activeTab === "discography" && (
          <DiscographyManager
            discography={portfolio.discography}
            onChange={(updated) => setPortfolio({ ...portfolio, discography: updated })}
          />
        )}

        {activeTab === "headshots" && (
          <HeadshotsManager
            headshots={portfolio.headshots}
            onChange={(updated) => setPortfolio({ ...portfolio, headshots: updated })}
          />
        )}

        {activeTab === "preview" && (
          <LivePortfolioPreview portfolio={portfolio} />
        )}

        {activeTab === "schema" && (
          <SEOSchemaViewer portfolio={portfolio} />
        )}
      </div>

      {/* Hollywood Genius Floating Assistant Modal */}
      <HollywoodGeniusModal
        isOpen={isGeniusOpen}
        onClose={() => setIsGeniusOpen(false)}
        initialPrompt={geniusPrompt}
      />

      {/* Bottom Step Guide */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold font-mono shrink-0">
            SEO
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Google Rich Results Readiness: {audit.score}%
            </h4>
            <p className="text-xs text-muted-foreground">
              {audit.richResultsEligible.personActorKnowledgeCard && "• Person Card eligible "}
              {audit.richResultsEligible.musicAlbumKnowledgePanel && "• Music Album eligible "}
              {audit.richResultsEligible.videoCarousel && "• Video Carousel eligible "}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab !== "schema" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("schema")}
              className="text-xs border-gold/40 text-gold hover:bg-gold/10"
            >
              Inspect JSON-LD Schema <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="hero"
              size="sm"
              onClick={() => setActiveTab("preview")}
              className="text-xs"
            >
              View Rendered Portfolio <Eye className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

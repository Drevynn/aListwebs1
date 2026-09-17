import { Sparkles, ShieldCheck, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <footer className="border-t border-glass-border py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/logo.png"
                alt="A List Webs"
                className="h-8 w-8 rounded-lg object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-semibold text-gold text-lg">A List Webs</span>
            </div>
            <p className="text-xl font-display font-bold text-foreground mb-1">
              Sovereign web architecture for creatives.
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Purpose-built digital headquarters for musicians, filmmakers, actors, and writers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 text-sm text-muted-foreground">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Navigation</span>
              <a href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <a href="/#examples" className="hover:text-foreground transition-colors">Examples</a>
              <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="/#help" className="hover:text-foreground transition-colors">Help & How-To</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Legal & Support</span>
              <a 
                href="https://sovranlyip.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gold hover:text-gold-light transition-colors flex items-center gap-1.5 font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Protect your work
              </a>
              <Link to="/help" className="hover:text-foreground transition-colors">Knowledge Base</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <a href="mailto:support@alistwebs.com" className="hover:text-foreground transition-colors">Support</a>
            </div>
            {user && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-foreground">Account</span>
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px] bg-white/5 border border-white/10 px-2 py-1 rounded" title={user.email || ""}>
                  {user.email}
                </span>
                <Link to="/build" className="hover:text-foreground transition-colors">Portfolio Studio</Link>
                <Link to="/cms" className="hover:text-foreground transition-colors">CMS Studio</Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 pt-1 text-sm font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-sm text-muted-foreground">
          <p>© 2026 A List Webs. All rights reserved.</p>
          <p className="text-xs">Sovereign digital headquarters for musicians, filmmakers, actors, and writers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

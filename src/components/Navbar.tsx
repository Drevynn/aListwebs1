import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Sun, Moon, CreditCard, FileText, Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import CloudSearchBar from "@/components/CloudSearchBar";
import BillingManagerModal from "@/components/BillingManagerModal";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past 20px for a slightly less sensitive trigger
      setIsScrolled(window.scrollY > 20); 
    };
    
    // Set initial state correctly on mount
    handleScroll(); 
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigate/change location
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, selector: string) => {
    if (location.pathname !== "/") {
      e.preventDefault();
      navigate("/" + selector);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeButton = mounted ? (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 text-gold hover:bg-white/10 dark:hover:bg-white/10 shrink-0"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 360, scale: theme === "dark" ? 1 : 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
    </Button>
  ) : (
    <div className="w-9 h-9 shrink-0" />
  );

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
          isScrolled || isOpen
            ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="A List Webs"
              className="h-8 w-8 rounded-lg object-contain group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-xl font-semibold text-gold tracking-tight">A List Webs</span>
          </a>

          {/* Navigation links - desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium tracking-wide"
            >
              How it works
            </a>
            <a
              href="#examples"
              onClick={(e) => handleAnchorClick(e, "#examples")}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium tracking-wide"
            >
              Examples
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleAnchorClick(e, "#pricing")}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium tracking-wide"
            >
              Pricing
            </a>
            <a
              href="#help"
              onClick={(e) => handleAnchorClick(e, "#help")}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium tracking-wide"
            >
              Help & How-To
            </a>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-gold/40 text-gold hover:bg-gold/15 hover:border-gold/70 gap-1.5 font-medium text-xs rounded-lg h-7 px-2.5 transition-all shadow-sm"
            >
              <a
                href="https://sovranlyip.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Protect your intellectual property with Sovranly IP"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Protect your work
              </a>
            </Button>
          </div>

          {/* Top Cloud Search Bar - desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2">
            <CloudSearchBar variant="navbar" className="w-full" />
          </div>

          {/* CTA buttons - desktop */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0">
            {themeButton}
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/build")}
                  className="border-gold/40 text-gold hover:bg-gold/10 gap-1.5 font-semibold text-xs rounded-xl h-8 px-2.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Portfolio Studio
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/cms")} className="text-xs h-8 px-2.5">
                  CMS
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (location.pathname === "/") {
                      document.getElementById("google-docs-manager")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate("/#google-docs-manager");
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1 text-xs h-8 px-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Docs
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/mail")} className="text-xs h-8 px-2.5">
                  Alist Mail
                </Button>
                <Button
                  variant={isAdmin ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className={`text-xs h-8 px-2.5 gap-1.5 ${
                    isAdmin
                      ? "border-gold/40 text-gold hover:bg-gold/15 hover:border-gold font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? "text-gold" : "text-muted-foreground"}`} />
                  Admin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBillingOpen(true)}
                  className="text-gold hover:text-gold-light hover:bg-gold/10 gap-1 text-xs h-8 px-2"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Billing
                </Button>
                <span className="text-xs text-muted-foreground max-w-[120px] truncate font-mono bg-white/5 border border-white/10 px-2 py-1 rounded-md" title={user.email || ""}>
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-2.5 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-colors gap-1.5 font-medium rounded-lg"
                  onClick={handleLogout}
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-xs h-8 px-3">
                  Sign in
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")} className="text-xs h-8 px-3.5">
                  Build my website
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            <CloudSearchBar variant="icon" />
            {themeButton}
            {user && (
              <>
                <span className="text-xs text-muted-foreground max-w-[75px] sm:max-w-[100px] truncate mr-0.5">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 rounded-lg flex items-center gap-1"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Log out</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[61px] left-0 right-0 z-40 bg-black/95 border-b border-white/10 backdrop-blur-lg md:hidden overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 gap-6 max-h-[85vh] overflow-y-auto">
              {/* Mobile Cloud Search Input */}
              <div className="pb-2">
                <CloudSearchBar variant="compact" className="w-full" />
              </div>

              <div className="flex flex-col gap-3.5 border-b border-white/5 pb-5">
                <p className="text-[11px] font-semibold text-gold tracking-widest uppercase mb-0.5">Navigation</p>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    handleAnchorClick(e, "#how-it-works");
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#examples"
                  onClick={(e) => {
                    handleAnchorClick(e, "#examples");
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  Examples
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => {
                    handleAnchorClick(e, "#pricing");
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#help"
                  onClick={(e) => {
                    handleAnchorClick(e, "#help");
                    setIsOpen(false);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  Help & How-To
                </a>
                <a
                  href="https://sovranlyip.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light transition-colors pt-1"
                >
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Protect your work
                  <ExternalLink className="w-3.5 h-3.5 text-gold/60 ml-auto" />
                </a>
              </div>

              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-1">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Signed in as</span>
                        <span className="text-xs font-mono text-foreground truncate">{user.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-red-500/25 h-7 px-2.5 rounded-lg gap-1 shrink-0"
                      >
                        <LogOut className="w-3 h-3" />
                        Log out
                      </Button>
                    </div>

                    <Button
                      variant="hero"
                      onClick={() => {
                        navigate("/build");
                        setIsOpen(false);
                      }}
                      className="w-full justify-center bg-gold text-black font-semibold gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Portfolio Generator & Studio
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/cms");
                        setIsOpen(false);
                      }}
                      className="w-full justify-center border-white/10 text-white"
                    >
                      Open CMS Studio
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/mail");
                        setIsOpen(false);
                      }}
                      className="w-full justify-center border-white/10 text-white"
                    >
                      Alist Mail
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        if (location.pathname === "/") {
                          document.getElementById("google-docs-manager")?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          navigate("/#google-docs-manager");
                        }
                      }}
                      className="w-full justify-center border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Google Docs Manager
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/admin");
                        setIsOpen(false);
                      }}
                      className={`w-full justify-center gap-2 ${
                        isAdmin
                          ? "border-gold/50 text-gold bg-gold/10 font-semibold"
                          : "border-white/10 text-white hover:bg-white/5"
                      }`}
                    >
                      <ShieldCheck className={`w-4 h-4 ${isAdmin ? "text-gold" : "text-muted-foreground"}`} />
                      Admin Operations
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBillingOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full justify-center border-gold/30 text-gold hover:bg-gold/10 gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing & Invoices
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full justify-center text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBillingOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full justify-center border-gold/30 text-gold hover:bg-gold/10 gap-2 text-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Billing Portal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                      className="w-full justify-center border-white/10 text-white hover:bg-white/5"
                    >
                      Sign in
                    </Button>
                    <Button
                      variant="hero"
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                      className="w-full justify-center"
                    >
                      Build my website
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BillingManagerModal
        open={billingOpen}
        onOpenChange={setBillingOpen}
        defaultEmail={user?.email || ""}
      />
    </>
  );
};

export default Navbar;

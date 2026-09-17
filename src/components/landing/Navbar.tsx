import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const themeToggle = mounted ? (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 text-gold hover:bg-muted border border-border/60 shrink-0"
      aria-label="Toggle Theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 360, scale: theme === "dark" ? 1 : 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </motion.div>
    </Button>
  ) : (
    <div className="w-9 h-9 shrink-0" />
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-card border border-gold/40 p-1 flex items-center justify-center group-hover:border-gold transition-colors shadow-sm">
            <img src="/logo.png" alt="A-list Websites" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <span className="font-display font-bold text-gold text-base sm:text-lg tracking-tight">
            A-list Websites
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold">
          <a
            href="#how-it-works"
            onClick={(e) => handleAnchorClick(e, "#how-it-works")}
            className="text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            How it works
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleAnchorClick(e, "#pricing")}
            className="text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Pricing
          </a>
          <a
            href="#help"
            onClick={(e) => handleAnchorClick(e, "#help")}
            className="text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Help & How-To
          </a>
          <Link
            to="/build"
            className="text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Portfolio Studio
          </Link>
        </nav>

        {/* Desktop CTA / User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {themeToggle}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px] bg-muted border border-border px-2.5 py-1 rounded-md" title={user.email || ""}>
                {user.email}
              </span>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate("/build")}
                className="text-xs h-8 px-3"
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs h-8 px-2.5 text-red-500 hover:text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1.5"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-xs h-9 px-4 border-border hover:bg-muted font-medium"
              >
                Sign In
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate("/build")}
                className="text-xs h-9 px-4 gap-1.5 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SIGN UP / START FREE</span>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {themeToggle}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border px-6 py-6 space-y-4 shadow-xl"
          >
            {user && (
              <div className="p-3 rounded-xl bg-muted border border-border flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-foreground truncate">{user.email}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Active</span>
              </div>
            )}
            <div className="flex flex-col gap-3 font-medium">
              <a
                href="#how-it-works"
                onClick={(e) => handleAnchorClick(e, "#how-it-works")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleAnchorClick(e, "#pricing")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#help"
                onClick={(e) => handleAnchorClick(e, "#help")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help & How-To
              </a>
              <Link
                to="/build"
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Portfolio Studio
              </Link>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              {user ? (
                <>
                  <Button
                    variant="hero"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/build");
                    }}
                    className="w-full justify-center text-xs"
                  >
                    Open Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full justify-center text-xs text-red-500 hover:text-red-400 border-red-500/30 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/auth");
                    }}
                    className="w-full justify-center text-xs border-border"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="hero"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/build");
                    }}
                    className="w-full justify-center text-xs gap-1.5 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SIGN UP / START FREE</span>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

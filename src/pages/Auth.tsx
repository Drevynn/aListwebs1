import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signOut, signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google Sign-In Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGithub();
    if (error) {
      if (error.message.includes("auth/account-exists-with-different-credential")) {
        toast({
          title: "Account Exists",
          description: "An account already exists with the same email address using a different sign-in provider.",
          variant: "destructive",
        });
      } else if (error.message.includes("auth/operation-not-allowed")) {
        toast({
          title: "GitHub Sign-In Disabled",
          description: "GitHub authentication is not enabled in your Firebase Console. Please enable GitHub under Authentication > Sign-in method in Firebase Console.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "GitHub Sign-In Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleAuthError = (err: Error) => {
    if (err.message.includes("auth/operation-not-allowed")) {
      toast({
        title: "Email Sign-In Disabled in Firebase",
        description:
          "Email/Password sign-in is not enabled in your Firebase Console. Please use 'Sign in with Google' or enable Email/Password under Authentication > Sign-in method in Firebase Console.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        handleAuthError(error);
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        handleAuthError(error);
      } else {
        toast({
          title: "Account created",
          description: "You can now sign in.",
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to home */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </a>

        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-gold/30 p-1 flex items-center justify-center">
              <img src="/logo.png" alt="A List Webs" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="font-display text-xl font-semibold text-gold">A List Webs</span>
          </div>

          {user ? (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Currently signed in</p>
                  <p className="text-sm font-mono text-foreground truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="hero"
                  onClick={() => navigate("/")}
                  className="w-full justify-center"
                >
                  Continue to Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/build")}
                  className="w-full justify-center border-gold/30 text-gold hover:bg-gold/10"
                >
                  Portfolio Studio
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signOut();
                      toast({
                        title: "Signed out",
                        description: "You have been logged out successfully.",
                      });
                    } catch (err) {
                      console.error("Sign out error", err);
                    }
                  }}
                  className="w-full justify-center text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 gap-2 mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2 border-t border-white/5">
                Want to switch accounts? Click <span className="text-foreground font-semibold">Log out</span> above to sign in with another email.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isLogin
                  ? "Sign in to continue building."
                  : "Start creating your dream site today."}
              </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 text-sm"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 text-sm"
              onClick={handleGithubSignIn}
              disabled={loading}
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-secondary border-glass-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-secondary border-glass-border"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-glass-border text-center text-xs text-muted-foreground">
            By signing in or registering, you agree to our{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          </div>
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

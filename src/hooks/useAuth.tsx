import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const ADMIN_EMAILS = ["dev@alistwebs.com", "admin@alistwebs.com"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const evaluateAdmin = async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) {
      setIsAdmin(false);
      setUserProfile(null);
      return false;
    }

    const email = currentUser.email?.toLowerCase().trim() || "";
    const isHardcodedAdmin = ADMIN_EMAILS.includes(email);

    let dbAdmin = false;
    let profile: UserProfile | null = null;

    try {
      // Check admin collection
      const adminDocRef = doc(db, "admins", currentUser.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (adminSnap.exists()) {
        dbAdmin = true;
      }

      // Check users collection
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        profile = {
          id: currentUser.uid,
          email: data.email || currentUser.email || "",
          role: data.role === "admin" ? "admin" : "user",
          hasMailAccess: Boolean(data.hasMailAccess),
          subscriptionTier: data.subscriptionTier || "monthly",
          subscriptionStatus: data.subscriptionStatus || "active",
          stripeCustomerId: data.stripeCustomerId,
          created_at: data.createdAt || data.created_at,
        };
        if (data.role === "admin") {
          dbAdmin = true;
        }
      } else {
        // Create user record
        profile = {
          id: currentUser.uid,
          email: currentUser.email || "",
          role: isHardcodedAdmin ? "admin" : "user",
          hasMailAccess: true,
          subscriptionTier: "monthly",
          subscriptionStatus: "active",
          created_at: new Date().toISOString(),
        };
        await setDoc(userDocRef, profile, { merge: true });
      }

      // If hardcoded admin email, ensure both admin collection and user doc have admin role
      if (isHardcodedAdmin) {
        dbAdmin = true;
        if (!adminSnap.exists()) {
          await setDoc(adminDocRef, {
            email: currentUser.email,
            role: "admin",
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
        if (profile && profile.role !== "admin") {
          profile.role = "admin";
          await setDoc(userDocRef, { role: "admin" }, { merge: true });
        }
      }
    } catch (err) {
      console.warn("Could not check Firestore admin document:", err);
    }

    const finalAdminStatus = isHardcodedAdmin || dbAdmin;
    setIsAdmin(finalAdminStatus);
    setUserProfile(profile);
    return finalAdminStatus;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await evaluateAdmin(currentUser);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshAdminStatus = async () => {
    return evaluateAdmin(user);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await evaluateAdmin(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await evaluateAdmin(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await evaluateAdmin(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await evaluateAdmin(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      userProfile,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      refreshAdminStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


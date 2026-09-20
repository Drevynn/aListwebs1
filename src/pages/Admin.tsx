import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Site,
  Contact,
  UserProfile,
  AdminSubscriptionRecord,
  AdminAnalyticsSummary,
} from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatsRibbon } from "@/components/admin/AdminStatsRibbon";
import { SiteAnalyticsSection } from "@/components/admin/SiteAnalyticsSection";
import { SubscriptionStatusSection } from "@/components/admin/SubscriptionStatusSection";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, refreshAdminStatus } = useAuth();

  const [activeTab, setActiveTab] = useState<"analytics" | "subscriptions">("analytics");
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>([]);
  const [mrrCents, setMrrCents] = useState<number>(0);
  const [arrCents, setArrCents] = useState<number>(0);
  const [isStripeConfigured, setIsStripeConfigured] = useState<boolean>(true);

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isVerifyingPrivileges, setIsVerifyingPrivileges] = useState<boolean>(false);

  // Fetch all administrative telemetry & subscriber records
  const fetchAdminData = useCallback(async () => {
    try {
      // 1. Fetch Firestore collections
      const [sitesSnap, usersSnap, contactsSnap, subscriptionsSnap] = await Promise.all([
        getDocs(collection(db, "sites")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "users")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "contacts")).catch(() => ({ docs: [] })),
        getDocs(collection(db, "subscriptions")).catch(() => ({ docs: [] })),
      ]);

      const loadedSites: Site[] = sitesSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Site[];

      const loadedUsers: UserProfile[] = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserProfile[];

      const loadedContacts: Contact[] = contactsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Contact[];

      const firestoreSubs: AdminSubscriptionRecord[] = subscriptionsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerId: data.customerId || data.stripeCustomerId || "cus_firestore",
          customerEmail: data.customerEmail || data.userEmail || data.email || "subscriber@alistwebs.com",
          customerName: data.customerName || data.name,
          status: data.status || "active",
          planId: data.tier || "monthly",
          planName:
            data.tier === "yearly"
              ? "Annual Sovereign ($397/yr)"
              : data.tier === "biannual"
              ? "Bi-Annual Pro ($234/6mo)"
              : "Monthly Creator ($47/mo)",
          tier: data.tier || "monthly",
          interval: data.interval || (data.tier === "yearly" ? "year" : data.tier === "biannual" ? "6 months" : "month"),
          amountCents: data.amountCents || (data.tier === "yearly" ? 39700 : data.tier === "biannual" ? 23400 : 4700),
          currency: data.currency || "usd",
          currentPeriodEnd: data.currentPeriodEnd || data.current_period_end,
          createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          domainUpsell: data.domainUpsell || data.domain,
        };
      });

      setSites(loadedSites);
      setUsers(loadedUsers);
      setContacts(loadedContacts);

      // 2. Fetch server-side Stripe subscription summary
      try {
        const res = await fetch("/api/admin/subscriptions");
        if (res.ok) {
          const summary: AdminAnalyticsSummary = await res.json();
          setIsStripeConfigured(summary.isConfigured);
          setMrrCents(summary.mrrCents);
          setArrCents(summary.arrCents);

          // Merge Stripe subscriptions with Firestore subscriptions, deduplicating by ID/email
          const combinedSubs = [...summary.subscriptions];
          const existingIds = new Set(summary.subscriptions.map((s) => s.id));

          firestoreSubs.forEach((fsSub) => {
            if (!existingIds.has(fsSub.id)) {
              combinedSubs.push(fsSub);
              existingIds.add(fsSub.id);
            }
          });

          setSubscriptions(combinedSubs);
        } else {
          setSubscriptions(firestoreSubs);
        }
      } catch (err) {
        console.warn("Could not query /api/admin/subscriptions, using Firestore records:", err);
        setSubscriptions(firestoreSubs);
      }
    } catch (error) {
      console.error("Error loading administrative data:", error);
      toast.error("Failed to load some admin telemetry data.");
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setDataLoading(false);
    }
  }, [isAdmin, fetchAdminData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminData();
    toast.success("Admin dashboard telemetry synchronized");
  };

  const handleCheckPrivileges = async () => {
    setIsVerifyingPrivileges(true);
    try {
      const isElevated = await refreshAdminStatus();
      if (isElevated) {
        toast.success("Administrator privileges confirmed!");
        await fetchAdminData();
      } else {
        toast.error("Account does not have administrator privileges.");
      }
    } finally {
      setIsVerifyingPrivileges(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sites", id));
      setSites((prev) => prev.filter((s) => s.id !== id));
      toast.success("Site successfully deleted from platform.");
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Failed to delete site. Check Firestore permissions.");
    }
  };

  // Seed realistic sample data if admin requests to test with a populated dashboard
  const handleSeedSampleSites = async () => {
    try {
      const sampleSites = [
        {
          id: "site_hollywood_vampires",
          name: "The Neon Velvet Syndicate",
          user_id: user?.uid || "dev_user_001",
          status: "published",
          domain: "neonvelvet.xyz",
          custom_domain: "neonvelvet.band",
          created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          design_summary: "High-contrast dark-mode rock band headquarters with Spotify embeds, tour calendar, and VIP merch store.",
        },
        {
          id: "site_cinema_noir",
          name: "Auteur Film Screeners & EPK",
          user_id: user?.uid || "dev_user_002",
          status: "published",
          domain: "noirfilm.xyz",
          custom_domain: "alexanderdirector.com",
          created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
          design_summary: "Sovereign film director screener portal with Vimeo OTT integration and festival press kits.",
        },
        {
          id: "site_actor_spotlight",
          name: "Elena Vance | Official Talent EPK",
          user_id: user?.uid || "dev_user_003",
          status: "draft",
          domain: "elenavance.xyz",
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
          design_summary: "SAG-AFTRA talent reel, high-res headshot gallery, and agent contact routing.",
        },
        {
          id: "site_audio_collective",
          name: "Sub-Bass Sound Lab",
          user_id: user?.uid || "dev_user_004",
          status: "published",
          domain: "subbasslab.xyz",
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          design_summary: "Electronic music producer beat store with Bandcamp embed and stem licensing.",
        },
      ];

      for (const s of sampleSites) {
        await setDoc(doc(db, "sites", s.id), s, { merge: true });
      }

      // Also seed sample subscription records in firestore if empty
      const sampleSubs = [
        {
          id: "sub_demo_annual",
          customerId: "cus_sovereign_01",
          customerEmail: "rockstar@alistwebs.com",
          customerName: "Julian Casablancas",
          tier: "yearly",
          status: "active",
          amountCents: 39700,
          currency: "usd",
          domainUpsell: "thestrokesofficial.com",
          createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 320 * 86400000).toISOString(),
        },
        {
          id: "sub_demo_biannual",
          customerId: "cus_sovereign_02",
          customerEmail: "filmmaker@hollywood.com",
          customerName: "David Fincher",
          tier: "biannual",
          status: "active",
          amountCents: 23400,
          currency: "usd",
          domainUpsell: "mindhunterfilms.xyz",
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 160 * 86400000).toISOString(),
        },
        {
          id: "sub_demo_monthly",
          customerId: "cus_sovereign_03",
          customerEmail: "indieartist@austin.fm",
          customerName: "Spoon Band",
          tier: "monthly",
          status: "active",
          amountCents: 4700,
          currency: "usd",
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
        },
      ];

      for (const sub of sampleSubs) {
        await setDoc(doc(db, "subscriptions", sub.id), sub, { merge: true });
      }

      await fetchAdminData();
      toast.success("Populated sample sites and subscriptions for admin preview!");
    } catch (err) {
      console.error("Error seeding sample data:", err);
      toast.error("Failed to seed sample records.");
    }
  };

  // Loading state
  if (authLoading || (dataLoading && isAdmin)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground font-mono">
            Verifying Administrator Credentials & Telemetry...
          </p>
        </div>
      </div>
    );
  }

  // Access Denied if not logged in or not an admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container px-4 sm:px-6 lg:px-8 pt-20">
          <AdminAccessDenied
            userEmail={user?.email}
            onRefresh={handleCheckPrivileges}
            isVerifying={isVerifyingPrivileges}
          />
        </main>
      </div>
    );
  }

  // Computed metrics for ribbon
  const totalSites = sites.length;
  const publishedSites = sites.filter((s) => s.status?.toLowerCase() === "published").length;
  const draftSites = sites.filter((s) => s.status?.toLowerCase() === "draft").length;
  const domainsCount = sites.filter((s) => Boolean(s.custom_domain || s.domain)).length;

  const totalSubscribers = subscriptions.length;
  const activeSubscribers = subscriptions.filter((s) => s.status === "active").length;
  const monthlyCount = subscriptions.filter((s) => s.tier === "monthly").length;
  const biannualCount = subscriptions.filter((s) => s.tier === "biannual").length;
  const yearlyCount = subscriptions.filter((s) => s.tier === "yearly").length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-16">
        {/* Admin Header with breadcrumbs, credentials badge and tab toggle */}
        <AdminHeader
          adminEmail={user.email || "dev@alistwebs.com"}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          totalSites={totalSites}
          totalSubscribers={totalSubscribers}
          isStripeConfigured={isStripeConfigured}
        />

        {/* Executive KPI Ribbon */}
        <AdminStatsRibbon
          totalSites={totalSites}
          publishedSites={publishedSites}
          draftSites={draftSites}
          totalSubscribers={totalSubscribers}
          activeSubscribers={activeSubscribers}
          mrrCents={mrrCents}
          arrCents={arrCents}
          monthlyCount={monthlyCount}
          biannualCount={biannualCount}
          yearlyCount={yearlyCount}
          domainsCount={domainsCount}
        />

        {/* Tab 1: Site Creation Analytics */}
        {activeTab === "analytics" && (
          <SiteAnalyticsSection
            sites={sites}
            onDeleteSite={handleDeleteSite}
            onSeedSampleSites={handleSeedSampleSites}
          />
        )}

        {/* Tab 2: User Subscription Statuses */}
        {activeTab === "subscriptions" && (
          <SubscriptionStatusSection
            subscriptions={subscriptions}
            users={users}
            mrrCents={mrrCents}
            arrCents={arrCents}
            isStripeConfigured={isStripeConfigured}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}
      </main>
    </div>
  );
};

export default AdminPage;

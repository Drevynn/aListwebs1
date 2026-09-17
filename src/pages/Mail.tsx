import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Contact, Site } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const MailPage = () => {
  const [searchParams] = useSearchParams();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(searchParams.get("siteId") || "");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchSites = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, "sites"), where("user_id", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const sitesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site));
      setSites(sitesData);
      if (!selectedSiteId && sitesData.length > 0) setSelectedSiteId(sitesData[0].id);
    };
    fetchSites();
  }, [selectedSiteId]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!auth.currentUser || !selectedSiteId) return;
      const q = query(collection(db, "contacts"), where("user_id", "==", auth.currentUser.uid), where("site_id", "==", selectedSiteId));
      const snapshot = await getDocs(q);
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
    };
    fetchContacts();
  }, [selectedSiteId]);

  const sendMail = async () => {
    if (!selectedContact || !subject || !body || !selectedSiteId) return;
    try {
      const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, recipient: selectedContact }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Email sent" });
        await addDoc(collection(db, "emails"), {
          subject, body, recipient: selectedContact, user_id: auth.currentUser?.uid, site_id: selectedSiteId, createdAt: new Date().toISOString()
        });
      } else {
        throw new Error("Failed to send mail");
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to send mail", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="container px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-black/50 border border-gold/40 p-1.5 flex items-center justify-center shadow-lg shadow-gold/10">
            <img src="/logo.png" alt="Alist Webs Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-4xl font-bold">Alist Mail</h1>
        </div>
        
        <div className="mb-8 bg-card p-6 rounded-3xl border border-glass-border">
          <label className="block mb-2 font-bold text-foreground">Select Site</label>
          <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)} className="w-full bg-background text-foreground border border-border p-2 rounded">
            {sites.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
          </select>
        </div>

        <div className="bg-card p-6 rounded-3xl border border-gold mb-8">
          <h2 className="text-2xl font-bold mb-2">Maximize Your Reach</h2>
          <p className="text-white/70 mb-4">Upgrade to our premium reseller plan to get unlimited email campaigns, advanced analytics, and custom branding for your fans.</p>
          <Button variant="outline">Upgrade Now</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-3xl border border-glass-border">
            <h2 className="text-2xl font-bold mb-4">Send Mail</h2>
            <select value={selectedContact} onChange={(e) => setSelectedContact(e.target.value)} className="w-full mb-4 bg-background p-2 rounded">
              <option value="">Select contact</option>
              {contacts.map(c => <option key={c.id} value={c.email}>{c.name} ({c.email})</option>)}
            </select>
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mb-4" />
            <Textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} className="mb-4" />
            <Button onClick={sendMail}>Send</Button>
          </div>
          <div className="bg-card p-6 rounded-3xl border border-glass-border">
            <h2 className="text-2xl font-bold mb-4">Contacts</h2>
            {contacts.map(c => <div key={c.id} className="mb-2">{c.name} - {c.email}</div>)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MailPage;

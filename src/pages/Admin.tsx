import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Site, Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Download } from "lucide-react";
import Navbar from "@/components/Navbar";

const AdminPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitesSnapshot, contactsSnapshot] = await Promise.all([
          getDocs(collection(db, "sites")),
          getDocs(collection(db, "contacts"))
        ]);
        setSites(sitesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site)));
        setContacts(contactsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const deleteSite = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sites", id));
      setSites(sites.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting site:", error);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name,Email,Site ID"];
    const rows = contacts.map(c => `"${c.name || ''}","${c.email}","${c.site_id}"`);
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscribers.csv";
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="container px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-card border border-glass-border rounded-3xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">All Sites</h2>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-2">User ID</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map(site => (
                  <tr key={site.id} className="border-b border-white/5">
                    <td className="py-3">{site.user_id}</td>
                    <td className="py-3">{site.status}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" onClick={() => deleteSite(site.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-glass-border rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Subscribers</h2>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Site ID</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id} className="border-b border-white/5">
                    <td className="py-3">{contact.name || 'N/A'}</td>
                    <td className="py-3">{contact.email}</td>
                    <td className="py-3">{contact.site_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

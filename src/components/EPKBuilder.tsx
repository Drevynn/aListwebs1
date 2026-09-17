import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EPK {
  profession: "Musician" | "Filmmaker" | "Movie" | "Author";
  name: string;
  bio: string;
  mediaUrls: string[];
}

export default function EPKBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [epk, setEpk] = useState<EPK>({ profession: "Musician", name: "", bio: "", mediaUrls: [] });
  const [inbox, setInbox] = useState<{ id: string; [key: string]: unknown }[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchEPK = async () => {
      const q = query(collection(db, "epks"), where("user_id", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setEpk(snapshot.docs[0].data() as EPK);
      }
    };
    
    const fetchInbox = async () => {
      const q = query(collection(db, "inbox_messages"), where("user_id", "==", user.uid));
      const snapshot = await getDocs(q);
      setInbox(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    fetchEPK();
    fetchInbox();
  }, [user]);

  const saveEPK = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "epks", user.uid), { ...epk, user_id: user.uid, updatedAt: new Date().toISOString() });
      toast({ title: "Kit Saved!" });
    } catch (error) {
      toast({ title: "Error saving Kit", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Kit Builder</CardTitle>
          <CardDescription>Fill in your details for {epk.profession}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={epk.profession} onValueChange={(val: "Musician" | "Filmmaker" | "Author") => setEpk({...epk, profession: val})}>
            <SelectTrigger>
              <SelectValue placeholder="Select Profession" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Musician">Musician</SelectItem>
              <SelectItem value="Filmmaker">Filmmaker</SelectItem>
              <SelectItem value="Movie">Movie</SelectItem>
              <SelectItem value="Author">Author</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder={`${epk.profession} Name/Title`} value={epk.name} onChange={e => setEpk({...epk, name: e.target.value})} />
          <Textarea placeholder="Bio / Description" value={epk.bio} onChange={e => setEpk({...epk, bio: e.target.value})} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Media URL</label>
            <Input placeholder="URL (mp3/video/image)" onChange={e => setEpk({...epk, mediaUrls: [e.target.value]})} />
          </div>
          {epk.mediaUrls[0] && (
            <div className="pt-2">
              {epk.profession === "Musician" && <audio src={epk.mediaUrls[0]} controls className="w-full" />}
              {(epk.profession === "Filmmaker" || epk.profession === "Movie") && <video src={epk.mediaUrls[0]} controls className="w-full" />}
              {epk.profession === "Author" && <img src={epk.mediaUrls[0]} alt="Media" className="w-full h-auto" />}
            </div>
          )}
          <Button onClick={saveEPK}>Save Kit</Button>
          <div className="text-sm text-muted-foreground pt-4 border-t">
            Booking Contact: <strong>contact@therename.com</strong>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Professional Inbox</CardTitle></CardHeader>
        <CardContent>
          {inbox.map(msg => (
            <div key={msg.id} className="border p-2 mb-2">
              <p><strong>{msg.senderEmail}</strong>: {msg.subject}</p>
              <p>{msg.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

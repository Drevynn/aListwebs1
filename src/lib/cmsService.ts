import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";
import { ContentItem, ContentType, ContentStatus } from "@/types/cms";
import { INITIAL_CONTENT_ITEMS } from "./cmsData";

const STORAGE_KEY_PREFIX = "alist_cms_items_";

export class CMSService {
  static getStorageKey(userId?: string | null): string {
    return `${STORAGE_KEY_PREFIX}${userId || "guest"}`;
  }

  static getLocalItems(userId?: string | null): ContentItem[] {
    const key = this.getStorageKey(userId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading CMS items from localStorage:", e);
    }
    // Initialize default items
    this.saveLocalItems(INITIAL_CONTENT_ITEMS, userId);
    return INITIAL_CONTENT_ITEMS;
  }

  static saveLocalItems(items: ContentItem[], userId?: string | null): void {
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving CMS items to localStorage:", e);
    }
  }

  static async fetchItems(userId?: string | null): Promise<ContentItem[]> {
    const localItems = this.getLocalItems(userId);
    
    // If no logged in user or guest, return local items
    if (!userId) {
      return localItems;
    }

    try {
      // Attempt Firestore fetch
      const q = query(collection(db, "cms_content"), where("user_id", "==", userId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const firestoreItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ContentItem));
        // Sync local cache
        this.saveLocalItems(firestoreItems, userId);
        return firestoreItems;
      } else {
        // If Firestore is empty for this user, seed it with initial items if not yet uploaded
        if (localItems.length > 0) {
          // Upload local items asynchronously to Firestore
          for (const item of localItems) {
            const docRef = doc(db, "cms_content", item.id);
            await setDoc(docRef, { ...item, user_id: userId }, { merge: true }).catch(() => {});
          }
        }
        return localItems;
      }
    } catch (err) {
      console.warn("Firestore fetch unavailable, fallback to local store:", err);
      return localItems;
    }
  }

  static async saveItem(item: ContentItem, userId?: string | null): Promise<ContentItem> {
    const currentItems = this.getLocalItems(userId);
    const existingIndex = currentItems.findIndex(i => i.id === item.id);
    
    let updatedItems: ContentItem[];
    const itemToSave = {
      ...item,
      updatedAt: new Date().toISOString(),
      user_id: userId || undefined
    };

    if (existingIndex >= 0) {
      updatedItems = [...currentItems];
      updatedItems[existingIndex] = itemToSave;
    } else {
      updatedItems = [itemToSave, ...currentItems];
    }

    this.saveLocalItems(updatedItems, userId);

    if (userId) {
      try {
        const docRef = doc(db, "cms_content", itemToSave.id);
        await setDoc(docRef, itemToSave, { merge: true });
      } catch (err) {
        console.warn("Could not sync CMS item to Firestore:", err);
      }
    }

    return itemToSave;
  }

  static async deleteItem(itemId: string, userId?: string | null): Promise<void> {
    const currentItems = this.getLocalItems(userId);
    const updatedItems = currentItems.filter(i => i.id !== itemId);
    this.saveLocalItems(updatedItems, userId);

    if (userId) {
      try {
        await deleteDoc(doc(db, "cms_content", itemId));
      } catch (err) {
        console.warn("Could not delete CMS item from Firestore:", err);
      }
    }
  }

  static async togglePublish(itemId: string, userId?: string | null): Promise<ContentItem | null> {
    const currentItems = this.getLocalItems(userId);
    const item = currentItems.find(i => i.id === itemId);
    if (!item) return null;

    const isPublished = item.status === "published";
    const updatedStatus: ContentStatus = isPublished ? "draft" : "published";
    const now = new Date().toISOString();

    const updatedItem: ContentItem = {
      ...item,
      status: updatedStatus,
      updatedAt: now,
      publishedAt: updatedStatus === "published" ? now : item.publishedAt,
    };

    return await this.saveItem(updatedItem, userId);
  }

  static async duplicateItem(itemId: string, userId?: string | null): Promise<ContentItem | null> {
    const currentItems = this.getLocalItems(userId);
    const item = currentItems.find(i => i.id === itemId);
    if (!item) return null;

    const newId = `cms_${item.type.slice(0, 3)}_${Date.now()}`;
    const duplicatedItem: ContentItem = {
      ...item,
      id: newId,
      title: `${item.title} (Copy)`,
      slug: `${item.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      status: "draft",
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
    };

    return await this.saveItem(duplicatedItem, userId);
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

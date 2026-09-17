import { auth, db } from "@/lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { Site, SiteGoogleDoc, SiteDocType } from "@/types";

// Mandated Google Docs & Drive OAuth Scopes
export const GOOGLE_DOCS_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

// In-memory token storage (MANDATORY: Never store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let tokenExpiryTimestamp: number | null = null;

// Clear cached token automatically when the user signs out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
    tokenExpiryTimestamp = null;
  }
});

export const getCachedGoogleAccessToken = (): string | null => {
  if (tokenExpiryTimestamp && Date.now() > tokenExpiryTimestamp) {
    cachedAccessToken = null;
    tokenExpiryTimestamp = null;
  }
  return cachedAccessToken;
};

export const setCachedGoogleAccessToken = (token: string | null, expiresInSeconds = 3600) => {
  cachedAccessToken = token;
  tokenExpiryTimestamp = token ? Date.now() + (expiresInSeconds * 1000) : null;
};

/**
 * Initiates Google OAuth popup with Google Docs & Drive scopes
 * Caches token in memory upon success
 */
export const requestGoogleDocsAccess = async (): Promise<{ user: User; accessToken: string }> => {
  const provider = new GoogleAuthProvider();
  GOOGLE_DOCS_SCOPES.forEach((scope) => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: "consent",
    access_type: "online",
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);

  if (!credential?.accessToken) {
    throw new Error("Could not retrieve Google Docs access token from authentication provider.");
  }

  setCachedGoogleAccessToken(credential.accessToken);
  return { user: result.user, accessToken: credential.accessToken };
};

/**
 * Creates a new blank Google Doc via Google Docs REST API
 */
export const createGoogleDocument = async (
  accessToken: string,
  title: string
): Promise<{ documentId: string; title: string; revisionId: string }> => {
  const response = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || response.statusText;
    if (response.status === 401) {
      setCachedGoogleAccessToken(null);
      throw new Error("Your Google session has expired. Please reconnect your Google account.");
    }
    throw new Error(`Google Docs API error (${response.status}): ${message}`);
  }

  return response.json();
};

/**
 * Appends / updates formatted text in the Google Doc using batchUpdate
 */
export const writeGoogleDocumentContent = async (
  accessToken: string,
  documentId: string,
  content: string
): Promise<void> => {
  // Google Docs API indexes: insert at index 1 (start of new document)
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || response.statusText;
    if (response.status === 401) {
      setCachedGoogleAccessToken(null);
      throw new Error("Your Google session has expired. Please reconnect your Google account.");
    }
    throw new Error(`Failed to write content to Google Doc: ${message}`);
  }
};

/**
 * Fetches Google Doc metadata & content
 */
export const getGoogleDocument = async (
  accessToken: string,
  documentId: string
): Promise<Record<string, unknown>> => {
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Google Doc (${response.status})`);
  }

  return response.json();
};

// ==========================================
// DOCUMENT GENERATORS FOR SITES
// ==========================================

export interface DocGenerationOptions {
  includeBlueprint?: boolean;
  includeStemsAndAudio?: boolean;
  includeTourAndEvents?: boolean;
  includeTechSpecs?: boolean;
  includeBranding?: boolean;
  customNotes?: string;
}

export const generateSiteDocumentText = (
  site: Site,
  docType: SiteDocType,
  options: DocGenerationOptions = {}
): { title: string; content: string; summary: string } => {
  const siteName = site.name || "Sovereign Creator Site";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (docType === "site_dossier") {
    const title = `${siteName} — Complete Site Dossier & Blueprint`;
    const summary = "Comprehensive master document detailing site architecture, brand positioning, audio releases, and infrastructure specifications.";
    
    const content = 
`${siteName.toUpperCase()}
COMPLETE SITE DOSSIER & ARCHITECTURAL BLUEPRINT
Generated by A List Webs Studio Engine
Date: ${dateStr}
Status: ${site.status.toUpperCase()}
Site ID: ${site.id}

================================================================================
1. EXECUTIVE SUMMARY & IDENTITY
================================================================================
Site Name: ${siteName}
Platform: A List Webs Sovereign Digital Studio
Deployment Status: Active (${site.status})
Hosting Domain: https://alistwebs.com/preview/${site.id}

Overview:
${siteName} is a sovereign web installation developed for independent artist autonomy. Built without third-party platform lock-in, it serves as the official digital headquarters for discography, tour ticketing, merchandise sales, and direct-to-fan communications.

================================================================================
2. THE DESIGN & CREATIVE BLUEPRINT
================================================================================
${site.design_summary || "Bespoke high-contrast obsidian aesthetic with brushed gold accents, responsive audio stem players, and unified tour date scheduling."}

Key Architectural Components:
- Hero Showcase: Immersive full-viewport artwork with primary call-to-action
- Discography Matrix: Lossless audio streaming & stem download integration
- Tour & Live Dates: Verified venue routing and ticketing links
- Sovereign Fan Mail: Direct fan acquisition and communication engine
- Merch & Storefront: Sovereign merchandise checkout

================================================================================
3. AUDIO STEMS, RECORDINGS & CATALOG
================================================================================
The site is equipped to host, stream, and license lossless master stems:
- Master Stereo Mixes (24-bit / 48kHz WAV & FLAC)
- Isolated Instrument Stems (Drums, Bass/Sub, Synths, Vocals, FX)
- Licensing Terms: Sovereign direct-license rights retained 100% by the creator.

================================================================================
4. TECHNICAL SPECIFICATIONS & HOSTING
================================================================================
- Framework: React 18 / TypeScript / Tailwind CSS
- Cloud Infrastructure: Firebase Firestore & Google Cloud Platform
- Storage Engine: Google Drive & Sovereign Cloud File Synchronizer
- Security: TLS 1.3 encryption, Content Security Policy, and Firestore Role-Based Rules
- SEO & Meta: Open Graph cards, canonical URLs, and structured JSON-LD schema.

================================================================================
5. ROADMAP & CREATOR NOTES
================================================================================
${options.customNotes ? options.customNotes + "\n\n" : ""}
Next Deployment Milestones:
1. Connect custom apex domain (DNS A/CNAME record setup).
2. Configure live Stripe payout gateway for direct fan sales.
3. Sync master Google Drive asset folders for automatic website updates.

--------------------------------------------------------------------------------
Confidential & Sovereign Property of ${siteName} & A List Webs
`;
    return { title, content, summary };
  }

  if (docType === "epk") {
    const title = `${siteName} — Official Electronic Press Kit (EPK)`;
    const summary = "Official media dossier with biography, press quotes, key milestones, media asset links, and booking management details.";

    const content = 
`${siteName.toUpperCase()}
OFFICIAL ELECTRONIC PRESS KIT (EPK)
Date: ${dateStr}
Management & Press Inquiries: dev@alistwebs.com

================================================================================
1. ARTIST BIOGRAPHY
================================================================================
${siteName} is an innovative musical project blending visceral low-end frequencies, precision analog synthesizers, and forward-thinking sound architecture. Rejecting algorithmic compromises, ${siteName} delivers immersive sonic experiences designed for high-caliber sound systems.

================================================================================
2. CRITICAL ACCLAIM & PRESS HIGHLIGHTS
================================================================================
"A masterclass in modern electronic production and acoustic spatial depth." — Sonic Wire
"Monumental bass presence with pristine dynamic control." — Frequencies Magazine
"One of the most compelling live audio experiences of the year." — Circuit & Bass

================================================================================
3. DISCOGRAPHY & RELEASES
================================================================================
- LP / EP Catalog: Available directly through the sovereign web portal.
- Stems & Production: Analog Moog Minitaur, Prophet-5, and modular sound beds.
- Formats: High-Resolution 24-bit Audio, Vinyl Pressings, and Digital Stems.

================================================================================
4. LIVE PERFORMANCE SPECIFICATIONS
================================================================================
- Performance Format: Hybrid Live Electronic / Modular Synthesizer Set
- Duration: 60 to 90 Minutes
- Stage Footprint: 8ft x 6ft minimum riser
- Production Highlights: Synchronized lighting MIDI automation and sub-bass reinforcement.

================================================================================
5. BOOKING, REPRESENTATION & CONTACT
================================================================================
- General Booking: dev@alistwebs.com
- Press & Media Relations: press@alistwebs.com
- Official Sovereign Site: https://alistwebs.com/preview/${site.id}
${options.customNotes ? "\nSpecial Instructions:\n" + options.customNotes + "\n" : ""}
`;
    return { title, content, summary };
  }

  if (docType === "tech_rider") {
    const title = `${siteName} — Technical Rider & Stage Plot`;
    const summary = "Audio engineering rider, input channel list, stage diagram specifications, monitor mix requirements, and hospitality guidelines.";

    const content = 
`${siteName.toUpperCase()}
TECHNICAL RIDER & STAGE SPECIFICATIONS
Tour Season 2026-2027
Contact: Production Manager (dev@alistwebs.com)

================================================================================
1. FOH SOUND SYSTEM REQUIREMENTS
================================================================================
- System: High-efficiency, professional touring PA (d&b audiotechnik, L-Acoustics, or Meyer Sound preferred).
- Frequency Response: Uniform response from 28Hz to 20kHz at FOH mixing position. Subwoofer arrays must have sufficient headroom for sustained sub-bass frequencies (30Hz - 80Hz).
- SPL: Clean 105 dBA continuous headroom at FOH with zero distortion or limiter pumping.

================================================================================
2. INPUT CHANNEL LIST
================================================================================
CH | SOURCE            | TRANSDUCER / DI      | STAND     | PHANTOM | INSERT
01 | Kick Drum Sub     | Shure Beta 91A       | In-drum   | Yes     | Gate/Comp
02 | Kick Drum Click   | Audix D6 / B52       | Short Boom| No      | Comp
03 | Sub Bass Direct   | Rupert Neve RNDI     | Stage Left| 48V     | Fast Comp
04 | Analog Bass Synth | Radial J48 Stereo DI | Stage Left| 48V     | Limiter
05 | Lead Synth L      | Radial Pro D2 (L)    | Center    | No      | Stereo EQ
06 | Lead Synth R      | Radial Pro D2 (R)    | Center    | No      | Stereo EQ
07 | Live FX / Looper  | Radial Pro D2        | Center    | No      | Reverb
08 | Lead Vocal / Mic  | Shure KSM9 / SM58    | Tall Boom | 48V     | De-Esser

================================================================================
3. MONITORING & IN-EARS
================================================================================
- Minimum 2 stereo wireless IEM mixes (Sennheiser G4 or Shure PSM1000).
- Sub-bass shaker / drum throne transducer or dual 18" stage sub-fill required on Stage Left.

================================================================================
4. POWER & STAGE WIRING
================================================================================
- 4 separate clean, isolated 20A / 120V (or 230V EU) circuits for audio equipment only.
- Audio grounds must be strictly isolated from venue lighting and motor dimmers.

================================================================================
5. HOSPITALITY & BACKSTAGE
================================================================================
- 1 Secure, climate-controlled dressing room with lock.
- Still mineral water (room temperature), fresh citrus, organic fruit, and high-protein catering.
${options.customNotes ? "\nAdditional Notes:\n" + options.customNotes + "\n" : ""}
`;
    return { title, content, summary };
  }

  if (docType === "brand_guide") {
    const title = `${siteName} — Brand Identity & Style Guide`;
    const summary = "Comprehensive brand manual with color palettes, typography rules, tone of voice, visual hierarchy, and media usage guidelines.";

    const content = 
`${siteName.toUpperCase()}
BRAND IDENTITY & VISUAL STYLE GUIDE
A List Webs Creative Sovereignty Ecosystem
Date: ${dateStr}

================================================================================
1. BRAND ESSENCE & VALUE PROPOSITION
================================================================================
${siteName} represents authentic creative sovereignty. The visual identity communicates mastery, acoustic precision, and sovereign presence through high contrast, disciplined typography, and luxurious dark aesthetics.

================================================================================
2. COLOR PALETTE
================================================================================
- Obsidian Neutral (Background): #0B0B0C
- Deep Slate Surface (Cards/Surfaces): #141416
- Sovereign Gold (Accent & Highlights): #D4AF37 (Secondary: #F5E7A3)
- Crisp White (Headings & Primary Text): #FFFFFF
- Muted Zinc (Body & Technical Metadata): #A1A1AA
- Emerald Verification (Status Badges): #10B981

================================================================================
3. TYPOGRAPHY SYSTEM
================================================================================
- Primary Display: High-contrast editorial display serif (tracking: tight, all-caps for impact).
- Body & Interface: Clean geometric sans-serif (line height: 1.6, comfortable readability).
- Monospace / Technical: Used for stem file names, sample rates, and tour dates.

================================================================================
4. PHOTOGRAPHY & VISUAL MOTIFS
================================================================================
- High contrast, cinematic natural grain, low-key dramatic lighting.
- Focus on authentic studio hardware (analog synths, tube preamps, vinyl lathes) and raw live performances.
- Avoid generic stock photography, AI slop gradients, or artificial neon glow.

================================================================================
5. VOICE & EDITORIAL TONE
================================================================================
- Objective, confident, sophisticated, and deeply appreciative of music craftsmanship.
- Plain language about sound quality, sovereign ownership, and direct fan relationships.
${options.customNotes ? "\nCustom Brand Directives:\n" + options.customNotes + "\n" : ""}
`;
    return { title, content, summary };
  }

  // Fallback / SEO Checklist / Custom
  const title = `${siteName} — Complete Site Documentation`;
  const summary = "Custom site document containing full design blueprint, technical specs, and deployment guide.";
  const content = 
`${siteName.toUpperCase()}
COMPLETE SITE DOCUMENTATION
Date: ${dateStr}
Site ID: ${site.id}
Website URL: https://alistwebs.com/preview/${site.id}

================================================================================
DESIGN SUMMARY
================================================================================
${site.design_summary || "Sovereign creator website powered by A List Webs."}

================================================================================
CUSTOM NOTES & SPECIFICATIONS
================================================================================
${options.customNotes || "No additional custom notes provided."}

--------------------------------------------------------------------------------
Generated with Google Docs API via A List Webs
`;
  return { title, content, summary };
};

// ==========================================
// FIRESTORE PERSISTENCE
// ==========================================

export const saveSiteDocRecord = async (
  record: Omit<SiteGoogleDoc, "id">
): Promise<string> => {
  const docRef = await addDoc(collection(db, "site_documents"), record);
  return docRef.id;
};

export const fetchSiteDocsForUser = async (
  userId: string,
  siteId?: string
): Promise<SiteGoogleDoc[]> => {
  try {
    let q = query(
      collection(db, "site_documents"),
      where("user_id", "==", userId)
    );

    if (siteId) {
      q = query(
        collection(db, "site_documents"),
        where("user_id", "==", userId),
        where("site_id", "==", siteId)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SiteGoogleDoc[];

    // Sort client-side by created_at desc
    return docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.error("Error fetching site docs:", err);
    return [];
  }
};

export const deleteSiteDocRecord = async (recordId: string): Promise<void> => {
  await deleteDoc(doc(db, "site_documents", recordId));
};

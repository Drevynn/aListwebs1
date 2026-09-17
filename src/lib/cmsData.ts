import { ContentItem } from "@/types/cms";

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: "cms_art_1",
    title: "Behind the Analog Desk: Crafting the Midnight Echoes Record",
    slug: "behind-the-analog-desk-midnight-echoes",
    type: "article",
    status: "published",
    excerpt: "An intimate deep dive into tube preamps, vintage tape saturation, and how our analog signal chain shaped the new record.",
    body: `## The Quest for Warmth

When we set out to record *Midnight Echoes*, digital precision alone was not enough. We wanted the low-end harmonic weight that only vintage vacuum tubes and 2-inch tape can provide.

### The Signal Chain

Our primary vocal chain consisted of:
- **Neumann U47 (Tube Reissue)**
- **Neve 1073 Mic Preamp**
- **Teletronix LA-2A Optical Compressor** (applying gentle 2–3dB of peak reduction)

> "The magic happens in the subtle transformer non-linearities when driving the tape inputs hot."

### Mixing in Dolby Atmos & Stereo

For the final release, we mixed both a wide stereo master for vinyl and a 7.1.4 immersive spatial mix for modern streaming platforms. Every synthesizer patch was recorded direct through custom DI boxes with Lundahl transformers.

### Takeaway for Independent Artists

Don't be afraid to combine tactile analog outboard gear with the surgical flexibility of your favorite modern DAW plugins. The contrast between gritty saturation and pristine digital delays creates breathtaking dynamic depth.`,
    category: "Studio & Production",
    tags: ["Audio Engineering", "Analog Gear", "Mastering", "Behind The Scenes"],
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80",
    author: "Elena Vance (Producer)",
    createdAt: "2026-07-28T14:20:00Z",
    updatedAt: "2026-08-01T10:15:00Z",
    publishedAt: "2026-08-01T12:00:00Z",
    views: 3420,
    featured: true,
    seoTitle: "Behind the Analog Desk: Crafting Midnight Echoes | Studio Journal",
    seoDescription: "Explore the vintage analog recording gear, tape saturation techniques, and vocal signal chains behind the Midnight Echoes record.",
    customFields: {
      readingTimeMinutes: 5,
      badgeText: "Staff Pick",
    }
  },
  {
    id: "cms_ann_1",
    title: "World Tour 2026 Tickets Now Live + Exclusive Vinyl Pre-Order",
    slug: "world-tour-2026-tickets-live",
    type: "announcement",
    status: "published",
    excerpt: "Tickets for all 24 North American & European dates are now open to fan club members. Limited 180g marble vinyl available.",
    body: `### Global Tour Announcement

We are thrilled to reveal the **2026 Monolith World Tour**! Starting this October in London and wrapping up in Tokyo, we're bringing our full holographic stage production and live 12-piece synth ensemble to audiences worldwide.

#### Pre-Sale Schedule:
1. **VIP Fan Club Members**: August 15, 10:00 AM Local
2. **General Public**: August 18, 10:00 AM Local

*All VIP tickets include early venue access, a signed tour poster, and entrance to the soundcheck Q&A session.*`,
    category: "Tour Updates",
    tags: ["Tour Dates", "Live Shows", "Vinyl", "VIP Access"],
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
    author: "Management Team",
    createdAt: "2026-08-05T09:00:00Z",
    updatedAt: "2026-08-08T16:40:00Z",
    publishedAt: "2026-08-08T18:00:00Z",
    views: 5890,
    featured: true,
    customFields: {
      badgeText: "Breaking News",
      ctaText: "Get Presale Tickets",
      ctaUrl: "https://tickets.example.com/world-tour-2026",
    }
  },
  {
    id: "cms_eve_1",
    title: "Live at Red Rocks Amphitheatre: Immersive Sunset Performance",
    slug: "live-red-rocks-amphitheatre-2026",
    type: "event",
    status: "published",
    excerpt: "Join us under the Colorado stars for a one-night-only 360-degree spatial audio live set with special guest visual artists.",
    body: `### A Historic Night in the Mountains

Experience our entire catalog reimagined with a live string quartet and surround quadraphonic speakers positioned across the legendary Red Rocks rock formations.

- **Doors Open**: 6:30 PM MDT
- **Opening Act**: 7:30 PM MDT
- **Headline Performance**: 8:45 PM MDT
- **All Ages Welcome**`,
    category: "Concert",
    tags: ["Red Rocks", "Live Concert", "Acoustics", "Outdoor"],
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    author: "Tour Coordinator",
    createdAt: "2026-08-02T11:00:00Z",
    updatedAt: "2026-08-10T14:30:00Z",
    publishedAt: "2026-08-10T15:00:00Z",
    views: 2150,
    customFields: {
      eventVenue: "Red Rocks Amphitheatre",
      eventLocation: "Morrison, Colorado, USA",
      eventDate: "2026-10-14 19:30",
      eventTicketUrl: "https://redrocksonline.com/tickets",
      badgeText: "Limited Remaining",
      ctaText: "Reserve Seat",
      ctaUrl: "https://redrocksonline.com/tickets"
    }
  },
  {
    id: "cms_med_1",
    title: "Neon Horizon: Official 4K Music Video & Stems Package",
    slug: "neon-horizon-music-video-and-stems",
    type: "media",
    status: "published",
    excerpt: "Watch the visual feast directed by Maya Lin, plus download the uncompressed 24-bit 96kHz multi-track stems for remixing.",
    body: `### Visual Experience & Creative Commons Stems

Shot on location in Iceland and the Mojave Desert using anamorphic cinema lenses, *Neon Horizon* explores themes of isolation and electronic rebirth.

#### Remix Pack Includes:
- Isolated Lead Vocal & Vocoder Harmony Tracks
- Analog Prophet-5 and Moog Minitaur Bass Stems
- Unprocessed Drum Machine Transients (.WAV)
- MIDI Score & Chord Progressions`,
    category: "Music Videos",
    tags: ["Music Video", "Stems", "Remix Contest", "4K Video"],
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    author: "Artistic Direction",
    createdAt: "2026-08-04T13:10:00Z",
    updatedAt: "2026-08-11T09:00:00Z",
    publishedAt: "2026-08-11T10:00:00Z",
    views: 4780,
    customFields: {
      mediaType: "video",
      mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      ctaText: "Download Stem Package (.ZIP)",
      ctaUrl: "#download-stems"
    }
  },
  {
    id: "cms_pag_1",
    title: "Official Band Press Kit & Tech Rider (2026–2027)",
    slug: "official-epk-tech-rider",
    type: "page",
    status: "published",
    excerpt: "High-resolution approved press photography, biography in 50/150/500 word variations, stage plots, and input channel lists.",
    body: `## Sovereign Artist EPK & Technical Rider

Welcome to the official press kit and technical rider repository.

### Quick Bio (150 Words)
Hailing from the intersection of electronic synthesis and post-rock dynamics, the ensemble has gathered over 40 million streams and performed at Glastonbury, Coachella, and Sonar. Their latest LP *Midnight Echoes* debuted in the Billboard Top 10 Electronic Charts.

### Stage Plot & Hospitality Specs
- **Input Channels**: 24 XLR Channels via Dante Digital Snake
- **Monitoring**: 4 Independent Stereo In-Ear Monitor (IEM) Mixes (Sennheiser G4)
- **Power**: 4x Dedicated 20A Circuits (Stage Left & Stage Right)
- **Lighting**: DMX control available via ArtNet / sACN`,
    category: "Press & Media",
    tags: ["EPK", "Technical Rider", "Press Photos", "Stage Plot"],
    coverImage: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&q=80",
    author: "Public Relations",
    createdAt: "2026-07-20T08:00:00Z",
    updatedAt: "2026-08-09T17:00:00Z",
    publishedAt: "2026-08-09T18:00:00Z",
    views: 1890,
    customFields: {
      badgeText: "Verified Official",
      ctaText: "Download PDF Rider",
      ctaUrl: "#download-pdf"
    }
  },
  {
    id: "cms_art_2",
    title: "Modular Synthesis Basics: Patching Eurorack for Cinematic Soundscapes",
    slug: "modular-synthesis-eurorack-soundscapes",
    type: "article",
    status: "draft",
    excerpt: "A beginner-to-intermediate guide on building lush evolving ambient drones using generative clock dividers and granular delays.",
    body: `### Getting Started in EuroRack

Modular synthesizers can look intimidating with dozens of patch cables dangling everywhere, but understanding signal flow turns complexity into pure musical freedom.

#### Three Core Modules to Start With:
1. **Complex Oscillator (VCO)**: For rich FM and wavefolding harmonics.
2. **Voltage Controlled Filter (VCF)**: To sculpt frequency response and add resonance.
3. **Dual Function Generator (VCA / Envelope)**: For timing, modulation ramps, and volume contouring.

*(Draft in progress: Adding patching diagrams and audio demo clips...)*`,
    category: "Tutorials",
    tags: ["Modular Synth", "Eurorack", "Sound Design", "Audio Gear"],
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    author: "Alex Rivers",
    createdAt: "2026-08-12T16:00:00Z",
    updatedAt: "2026-08-13T11:20:00Z",
    views: 0,
    customFields: {
      readingTimeMinutes: 7,
      badgeText: "Draft"
    }
  },
  {
    id: "cms_ann_2",
    title: "Upcoming Community Synth Hackathon & Masterclass",
    slug: "community-synth-hackathon-2026",
    type: "announcement",
    status: "scheduled",
    scheduledFor: "2026-09-01T15:00:00Z",
    excerpt: "Join our 48-hour virtual hackathon to build custom DSP audio plugins and web synths. $10,000 prize pool.",
    body: `### Build the Future of Audio Software

We are hosting our first global audio software hackathon! Whether you code in C++, Web Audio API, Faust, or Max/MSP, come build generative instruments and spatial audio plugins alongside industry mentors.

#### Highlights:
- Keynote talks from pioneering synthesizer designers
- Free API access to our generative sound engine
- Community voting and direct investor pitches`,
    category: "Community Events",
    tags: ["Hackathon", "DSP", "Web Audio", "Plugins"],
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
    author: "Developer Relations",
    createdAt: "2026-08-13T09:00:00Z",
    updatedAt: "2026-08-13T10:00:00Z",
    views: 45,
    customFields: {
      badgeText: "Upcoming",
      ctaText: "Register for Hackathon",
      ctaUrl: "https://hackathon.example.com"
    }
  }
];

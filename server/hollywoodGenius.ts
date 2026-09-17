export const HOLLYWOOD_GENIUS_SYSTEM_PROMPT = `You are the "Hollywood Genius" — an elite veteran Hollywood Producer, Unit Production Manager (UPM), Studio Packaging Executive, and Industry Casting Insider.

You possess encyclopedic, up-to-the-minute knowledge across EVERY single department in film and television production:

1. COMPLETE CREW ASSEMBLY (FROM ABOVE-THE-LINE TO BEST BOYS & UTILITIES):
   - Directing: Director, 1st AD (time & safety master), 2nd AD (call sheets & extras), 2nd 2nd AD, Script Supervisor.
   - Production: Producer, Executive Producer, Line Producer (the budget general), Unit Production Manager (UPM), Production Coordinator (POC), APOC.
   - Camera & Optics: Director of Photography (DP), Camera Operators (A/B), 1st AC (Focus Puller), 2nd AC (Clapper Loader), Digital Imaging Technician (DIT), Drone Operators, Steadicam / Trinity ops.
   - Lighting & Electric (G&E): Gaffer (Chief Lighting Technician), Best Boy Electric (2nd-in-command: gear orders, crew scheduling, 1200A generator tie-in, power distribution, daily timecards), Rigging Gaffer, Electricians/Juicers, Lighting Board / DMX Operator.
   - Grip & Rigging: Key Grip (head of camera support & rigging), Best Boy Grip (logistics, truck inventory, safety, crew payroll), Dolly Grip (track & hydraulic moves), Rigging Key Grip, Company Grips (Hammers).
   - Sound: Production Sound Mixer (head of sound dept, 16-32 track field recording), Boom Operator (choreography & line reading), Sound Utility (mic wiring, cable management, RF scanning).
   - Art Department & Design: Production Designer, Art Director, Set Decorator, Leadman, Set Dressers, Property Master, Assistant Prop Master, Armorer.
   - Costume & Wardrobe: Costume Designer, Wardrobe Supervisor, Key Costumer, Set Costumer.
   - Hair & Makeup: Makeup Dept Head, Key Makeup, Hair Dept Head, Key Hair, SFX / Prosthetics Artist.
   - Stunts: Stunt Coordinator, Assistant Stunt Coordinator, Stunt Doubles, Precision Drivers, Riggers.
   - Post & Editorial: Lead Film Editor, Assistant Editor, Supervising Sound Editor, Finishing Colorist, Post Supervisor, VFX Supervisor.
   - Locations: Location Manager, Assistant Location Manager (ALM), Location Scouts.
   - Casting: Casting Director (CSA), Associate Casting Director.
   - Transportation: Transportation Coordinator, Transportation Captain, Drivers (Teamsters 399).

2. CASTING INTELLIGENCE (WHO'S CASTING WHAT):
   - Top Casting Directors (CSA) and their genre sweet spots (e.g. Sarah Halley Finn for tentpole sci-fi/action; Allison Jones for elevated indie & comedy; Francine Maisler for auteur prestige drama; Carmen Cuba for high-tension thrillers/streaming; Nina Gold for epic worldbuilding/period; Avy Kaufman for character-driven features).
   - Major Talent Agencies (CAA, WME, UTA, Gersh, Paradigm, Verve) and Management firms (Anonymous Content, Brillstein, 3 Arts, Grandview).
   - Casting breakdown networks (Breakdown Express, Eco-Cast, Casting Networks), self-tape framing & audio standards, chemistry reads, SAG-AFTRA contract classifications (Short Film, Micro-Budget, Ultra Low Budget, Moderate Low Budget, Theatrical, High-Budget SVOD).

3. REAL-WORLD BUDGETS, RATES & GUILD REALITIES:
   - 2026 IATSE (Local 600, 728, 80, 695, 700, 800, 44, 705, 706, 399) scale, Tier 1/2/3 Low Budget agreements, and major studio agreements.
   - Overtime rules (1.5x after 8/10 hrs, 2x after 12 hrs, Golden Time after 14/16 hrs), meal penalties (every 6 hrs without grace period), 12-hour turnaround rest periods.
   - Box rentals / kit fees for DPs, Gaffers, Grips, Sound Mixers, and Hair/Makeup.

4. PACKAGING, PITCHING & GREENLIGHTING:
   - Script coverage, comps, loglines, pitch decks, distributor targets (A24, Neon, Focus Features, Searchlight, Sony Pictures Classics, Netflix, Apple TV+).
   - Festival launch roadmaps (Sundance, Cannes, TIFF, Venice, SXSW) and technical deliverables (DCP, ProRes 4444 XQ, 5.1/7.1 Atmos stems, ACES color archives).

TONE:
Sharp, authoritative, deeply practical, and cinematic. Format responses with clean Markdown headers, bullet points, and actionable crew tables.`;

export function getHollywoodGeniusFallbackResponse(userPrompt: string): string {
  const query = userPrompt.toLowerCase();

  if (query.includes("crew") || query.includes("assemble") || query.includes("department") || query.includes("budget") || query.includes("hire") || query.includes("roster")) {
    return `### 🎬 Complete Film Production Crew Assembly & Department Hierarchy

Here is a standard, battle-tested department roster configured for an **Independent Feature Film ($2.5M–$5M Tier 1/2 IATSE or Skeleton Indie)**:

#### 1. Directing Department (DGA)
- **Director**: Creative visionary; directs cast and collaborates with DP on shot design.
- **1st Assistant Director (1st AD)**: Sets the call times, commands the floor, enforces safety, and manages the daily stripboard schedule.
- **2nd Assistant Director (2nd AD)**: Publishes the official Call Sheet, directs background extras, coordinates actor transport to set.
- **Script Supervisor**: Maintains continuity, dialogue notes, eye lines, lens logs, and lined scripts for Editorial.

#### 2. Camera & Cinematography (ICG Local 600)
- **Director of Photography (DP)**: Visual architect; chooses camera systems, lenses (e.g. Arri Alexa 35 / Cooke Anamorphic), and collaborates with Gaffer/Grip on lighting.
- **A-Camera Operator**: Operates camera movement and framing during takes.
- **1st AC (Focus Puller)**: Pulls critical wireless focus, builds camera packages, checks gate.
- **2nd AC (Clapper Loader)**: Slates each take, marks actor footmarks, maintains camera logs and media transfer.
- **Digital Imaging Technician (DIT)**: Live on-set color grading (CDLs), checksum offloads, LUT management.

#### 3. Lighting & Electric Department (IATSE Local 728)
- **Gaffer (Chief Lighting Technician)**: Executes the DP's lighting scheme, supervises electrical crew, places key and fill fixtures.
- **Best Boy Electric**: **The operational engine of the electric department.** Manages lighting orders, daily crew calls, 1200A generator tie-in, 3-phase camlok distro boxes, and union timecards.
- **Electricians / Juicers**: Rig lighting fixtures, run stingers and bates cables, balance generator loads.
- **Lighting Board Operator**: Programs wireless DMX (CRMX) consoles (ETC Nomad, GrandMA) for LED tubes (Astera Titan) and soft panels (Arri SkyPanel).

#### 4. Grip & Rigging Department (IATSE Local 80)
- **Key Grip**: Head of camera support and light shaping; works directly with DP and Gaffer on rigging and safety.
- **Best Boy Grip**: Manages the 5-ton / 10-ton grip truck inventory, expends orders, safety protocols, and grip payroll.
- **Dolly Grip**: Operates the hydraulic camera dolly (Chapman Peewee / Fisher), levels dolly track, and executes precision tracking shots.
- **Company Grips (Hammers)**: Fly overhead diffusion frames (12x12, 20x20 ultra bounce), set C-stands, solids, and nets.

#### 5. Production Sound Department (CAS / IATSE Local 695)
- **Production Sound Mixer**: Records multitrack dialogue (e.g. Sound Devices 888/Scorpio), balances gain staging, coordinates wireless RF.
- **Boom Operator**: Choreographs the boom pole just above frame line, anticipates actor dialogue and movements.
- **Sound Utility**: Wires wireless lavaliers (Sanken COS-11D / DPA 4060) on actors, manages sound cables, coordinates IFB audio for director.

#### 6. Art Department & Production Design (ADG Local 800 / IATSE Local 44)
- **Production Designer**: Creates the physical world, sets, color palettes, and architectural look.
- **Art Director**: Oversees construction, blueprints, drafting, and art department budget.
- **Set Decorator & Leadman**: Sources furniture, dressings, practical lamps, and textures.
- **Property Master**: Manages hero props, period artifacts, and on-set prop handling (including armored weapons safety).

#### 7. Wardrobe, Hair & Makeup (IATSE Local 705 & 706)
- **Costume Designer & Wardrobe Supervisor**: Wardrobe continuity, character silhouettes, stunt multiples.
- **Makeup Dept Head & Hair Dept Head**: Camera-ready HD makeup, period hairstyles, sweat/blood application.

#### 8. Editorial & Post-Production (IATSE Local 700 / ACE)
- **Lead Film Editor**: Cuts daily assemblies, refines narrative pacing with director.
- **Finishing Colorist**: Grades the master conforming to ACES / HDR color spaces.
- **Supervising Sound Editor**: Designs Foley, ADR, sound effects, and 5.1 / 7.1 surround mix.

---
💡 **Hollywood Pro-Tip**: The Gaffer and Key Grip are equal department heads who work in lockstep. The Best Boy Electric and Best Boy Grip are their indispensable lieutenants who handle gear, logistics, and crew deployment so the heads can focus 100% on lighting and camera.`;
  }

  if (query.includes("cast") || query.includes("actor") || query.includes("who") || query.includes("agent") || query.includes("audition")) {
    return `### 🎭 Who's Casting What: Hollywood Casting Intelligence & Representation Guide

Here is the current operational landscape for casting directors (CSA), agency representation, and breakdown workflows:

#### 1. Prominent Casting Directors (CSA) by Genre Focus
- **Prestige Drama & Auteur Features**:
  - **Francine Maisler, CSA**: (*Dune, The Revenant, Succession*). The gold standard for heavyweight ensemble casting and auteur cinema.
  - **Avy Kaufman, CSA**: (*Tár, Succession, Brokeback Mountain*). Known for discovering unexpected indie talent for character-driven narratives.
- **Sci-Fi, High-Concept Action & Tentpoles**:
  - **Sarah Halley Finn, CSA**: (*Marvel Cinematic Universe, Everything Everywhere All at Once, The Mandalorian*). Dominates studio tentpole packaging.
- **Elevated Comedy & Satire**:
  - **Allison Jones, CSA**: (*Barbie, Lady Bird, The Good Place, The Office*). Revered for spotting comedic timing and authentic character quirks.
- **Dark Thrillers, Crime & Edge-of-Seat Drama**:
  - **Carmen Cuba, CSA**: (*Stranger Things, Ozark, The Knick*). Master of raw, atmospheric, gritty casting.
- **Epic Worldbuilding & European Co-Productions**:
  - **Nina Gold, CSA**: (*Game of Thrones, Star Wars, Chernobyl*). Based in London, key for transatlantic prestige projects.

#### 2. The Agency Big Four ("The Majors") & Management Landscape
- **CAA (Creative Artists Agency)**: Unrivaled packaging power; bundles A-list directors with bankable leads.
- **WME (William Morris Endeavor)**: Heavyweight client roster in both acting, directing, and below-the-line talent.
- **UTA (United Talent Agency)**: Aggressive literary and indie packaging division.
- **Gersh & Paradigm**: Incredible mid-tier powerhouses for rising stars, working character actors, and department heads.
- **Premier Management**: Anonymous Content, Brillstein Entertainment Partners, 3 Arts, Grandview.

#### 3. How Projects Are Broken Down & Cast
1. **Script Breakdown & Character Sides**: The Casting Director uploads the breakdown via *Breakdown Express* (accessible only to licensed talent agents and managers).
2. **First Round (Self-Tapes)**: SAG-AFTRA self-tape rules mandate: standard 48-hour turnarounds, neutral backdrops, 1080p framing, balanced soft key light, and clean off-camera reader audio.
3. **Callbacks & Chemistry Reads**: Held via Zoom (Eco-Cast) or in-person at casting studios in Hollywood or NYC.
4. **Offer Letters & Deal Memos**: Terms negotiated by agent/lawyer: Top-of-the-show rate, billing (Single Card / Main Title), dressing room tier, per diem, and travel class.

#### 4. SAG-AFTRA Agreement Tiers (2026 Reference)
- **Short Project Agreement (SPA)**: Budgets under $50,000; flexible day rates.
- **Ultra Low Budget Project Agreement (ULB)**: Budgets under $300,000; day rate scale ~$240/day.
- **Moderate Low Budget Project Agreement (MLB)**: Budgets $300,000 – $700,000; ~$415/day.
- **Low Budget Theatrical Agreement (LBA)**: Budgets $700,000 – $2,500,000; ~$740/day.
- **Standard Theatrical Scale**: Budgets >$2.5M; ~$1,204/day or $4,180/week scale.`;
  }

  if (query.includes("rate") || query.includes("best boy") || query.includes("gaffer") || query.includes("grip") || query.includes("day rate") || query.includes("iatse")) {
    return `### 💡 2026 Film Crew Day Rates, Union Scale & Gear Kit Guidelines

Below is a breakdown of standard rates for key film departments across **Independent Tier 1-3** and **Commercial / Non-Union** productions:

| Role / Department | Guild / Union | Standard Day Rate (10-12 Hr) | Kit Fee / Box Rental |
| :--- | :--- | :--- | :--- |
| **Director of Photography** | ICG Local 600 | $1,200 – $2,500+/day | $1,500 – $3,500 (Camera & Lenses) |
| **Gaffer (Chief Lighting Tech)** | IATSE Local 728 | $850 – $1,300/day | $150 – $350 (Meters, DMX, Tools) |
| **Best Boy Electric** | IATSE Local 728 | $750 – $1,100/day | $100 – $200 (Expendables, Distro) |
| **Key Grip** | IATSE Local 80 | $850 – $1,300/day | $150 – $350 (Rigging tools) |
| **Best Boy Grip** | IATSE Local 80 | $750 – $1,100/day | $100 – $200 (Rigging kit) |
| **Dolly Grip** | IATSE Local 80 | $750 – $1,050/day | $75 – $150 (Dolly accessories) |
| **Production Sound Mixer** | IATSE Local 695 / CAS | $900 – $1,500/day | $450 – $950 (16-Track Sound Cart) |
| **Boom Operator** | IATSE Local 695 | $650 – $900/day | $50 – $100 (Boom poles & shockmounts) |
| **1st AC (Focus Puller)** | ICG Local 600 | $750 – $1,100/day | $150 – $350 (Wireless Follow Focus) |
| **Lead Film Editor** | IATSE Local 700 / ACE | $3,500 – $6,000/week | $500 – $1,000/week (NLE Suite) |

#### Critical Overtime & Labor Rules
- **Standard Day**: 10 hours or 12 hours (including a mandatory 30-minute to 1-hour sit-down lunch break).
- **First Meal**: Must be called within **6 hours** of general crew call. If delayed, production incurs **Meal Penalties** ($7.50 for 1st 1/2 hr, escalating up to $12.50+ per subsequent 1/2 hr per crew member).
- **Overtime Tiers**:
  - Hours 11–12: 1.5x Hourly Rate
  - Hours 13–14: 2.0x Hourly Rate
  - Hours 14+: **Golden Time** (Full day's pay per hour or 3.0x hourly scale).
- **Rest Turnaround**: Mandatory 12 hours between wrap and next day's call. Infringing rest triggers "Forced Call" penalties.`;
  }

  if (query.includes("package") || query.includes("pitch") || query.includes("distribut") || query.includes("sundance") || query.includes("festival")) {
    return `### 🎬 Project Packaging, Financing & Festival Distribution Roadmap

Here is how Hollywood projects are packaged to secure equity financing, tax incentives, and distributor acquisitions:

#### 1. The Packaging Formula
To get a feature greenlit by financiers or presold to international territories:
- **Director + Lead 1 + Lead 2 + DP**: Financiers assess foreign pre-sales value based on star bankability.
- **Comparable Films ("Comps")**: 3 box office / festival comps released in the last 3-5 years demonstrating budget vs. return.
- **Tax Credit Arbitrage**:
  - **Georgia (30% transferable)**: Minimum $500K spend.
  - **New Mexico (25%–35% refundable)**: Excellent for desert, western, sci-fi.
  - **United Kingdom (AVEC 25.5% net cash rebate)**: Ideal for studio soundstages and post.

#### 2. Film Festival Launch Strategy
- **Sundance (January)**: The premier acquisition market for American indie narrative features and documentaries.
- **Cannes (May)**: World stage prestige (Competition, Un Certain Regard, Directors' Fortnight).
- **Venice & Telluride (September)**: The launchpad for awards season and Oscar contenders.
- **TIFF (September)**: The largest public festival and dealmaking hub for North American fall releases.

#### 3. Standard Delivery Requirements for Distributors (A24, Neon, Netflix)
- **Digital Cinema Package (DCP)**: DCI-compliant, SMPTE 24fps / 23.976fps, unencrypted and KDM versions.
- **Master Video**: Apple ProRes 4444 XQ (or ProRes 422 HQ) in Native Aspect Ratio (2.39:1, 1.85:1, or 1.33:1).
- **Audio Stems**: 5.1 and 7.1.4 Dolby Atmos Printmasters, M&E (Music & Effects with dialog removed for foreign dubbing), and stereo Lt/Rt downmix.
- **Music Cue Sheets**: Formatted for BMI/ASCAP/PRS detailing every second of scored and licensed source cues.
- **Legal Delivery**: Chain of Title, SAG-AFTRA Cast Clearance, E&O Insurance policy ($1M/$3M limit).`;
  }

  // Default comprehensive response
  return `### 🎬 Hollywood Genius: Film Production & Industry Intelligence

Welcome to the **Hollywood Genius** production consulting engine. As an industry packaging executive, UPM, and line producer, I can provide concrete answers across every aspect of film and episodic production:

1. **Complete Film Crews**:
   - Every department represented from Director, DP, and Gaffer down to Best Boy Electric, Best Boy Grip, Dolly Grip, Sound Utility, and Script Supervisor.
   - Day rate calculations, IATSE / DGA scale, box rental rates, and call sheet breakdowns.

2. **Casting Intelligence ("Who's Casting What")**:
   - Casting Director (CSA) directories, talent agencies (CAA, WME, UTA, Gersh), breakdown protocols, and self-tape criteria.
   - SAG-AFTRA agreement tiers and contract terms.

3. **Production Logistics & Technical Packages**:
   - Camera setups (Arri Alexa 35, RED V-Raptor, Sony VENICE 2, Anamorphic primes).
   - Lighting distro (1200A twin-pack generators, camlok distribution, wireless CRMX DMX).
   - Grip packages (5-ton packages, Chapman Peewee dollies, speedrail car rigs).

4. **Packaging, Pitching & Distribution**:
   - Script coverage, comps analysis, soft-money state film tax credits, and festival rollout strategies (Sundance, Cannes, TIFF).

*Ask me anything specific—from assembling a 30-person crew for an indie thriller to finding out which casting directors specialize in your genre!*`;
}

export const DESIGN_CHAT_SYSTEM_PROMPT = `You are the A List Webs design consultant — a friendly, knowledgeable AI that helps musicians and bands create their perfect website. You are part of the Creative Sovereignty ecosystem, working alongside the BandAide (bandaids.xyz) management platform.

STRICT RULES:
1. Your partner platform is bandaids.xyz. Use this for all management references.
2. NEVER mention .app domains. 
3. Your name is the "A List Webs Consultant".
4. Your job is to have a natural conversation to gather everything needed to design their site. Ask ONE question at a time.
5. When you have enough info, present a **Design Blueprint**. 
6. After the blueprint, tell the user: "I've handed this blueprint to our production team. Click the 'Let's build my site!' button below to save this to your A List Webs dashboard and start the generation process."
7. IMPORTANT: You MUST include the exact phrase "Let's go!" somewhere in your message when presenting the final blueprint so that the "Let's build my site!" action button becomes active and visible.

## Information to gather:
- Band name, style, and bio.
- Visual vibe (colors, textures, mood).
- Features (Spotify/SoundCloud players, Gig calendar, Merch store).

## Tone:
- Enthusiastic, professional, and cinematic.
- Use music and filmmaking terminology where appropriate.`;

export interface ChatMessage {
  role: string;
  content: string;
}

export function getDesignChatFallbackResponse(messages: ChatMessage[]): string {
  const userMessages = messages.filter((m) => m && m.role === "user" && typeof m.content === "string" && m.content.trim().length > 0);
  const userCount = userMessages.length;
  const lastUserText = (userMessages[userMessages.length - 1]?.content || "").toLowerCase();

  // If user says let's go, asks for blueprint, ready to build, or has completed 3+ questions
  if (
    userCount >= 3 ||
    lastUserText.includes("blueprint") ||
    lastUserText.includes("ready") ||
    lastUserText.includes("build") ||
    lastUserText.includes("generate") ||
    lastUserText.includes("done") ||
    lastUserText.includes("let's go") ||
    lastUserText.includes("lets go")
  ) {
    return `### 🎵 A List Webs — Custom Sovereign Design Blueprint

Here is your tailored website architecture based on our design consultation:

1. **Identity & Hero Experience**:
   - Immersive visual hero showcasing your artist persona and brand aesthetic.
   - Prominent typography and seamless track preview player.

2. **Music Streaming & Media Hub**:
   - Direct audio player integration supporting Spotify, Apple Music, and SoundCloud releases.
   - High-resolution discography grid with tracklists and streaming links.

3. **Tour Dates & Management Integration**:
   - Live concert & tour date calendar with direct ticketing buttons.
   - Synchronized tour management connected with **bandaids.xyz**.

4. **Direct-to-Fan Commerce & Email Capture**:
   - Dedicated merchandise showcase for physical and digital releases.
   - Direct-to-fan newsletter signup ensuring 100% audience ownership.

I've handed this blueprint to our production team. Click the 'Let's build my site!' button below to save this to your A List Webs dashboard and start the generation process.

Let's go!`;
  }

  if (userCount === 2) {
    return `That visual direction is fantastic and will look stunning across our modern sovereign layouts!

Now, let's talk about the **interactive features** your website needs:

- **Music Streaming**: Embedded players (Spotify, SoundCloud, Apple Music)
- **Live Shows**: Tour dates calendar with direct ticket links (synced with **bandaids.xyz**)
- **Merch Store**: Vinyl, apparel, and direct digital downloads
- **Fan Hub**: VIP newsletter and fan club signup with zero middleman fees
- **Press / EPK**: Downloadable electronic press kit and high-res promo photos

Which of these features are top priorities for your launch?`;
  }

  if (userCount === 1) {
    return `Awesome! That gives us a clear sonic foundation for the project.

Next, let's talk about your **visual atmosphere and brand aesthetic**:
- What colors, textures, or cinematic moods best represent your sound (for example: gritty noir, warm analog vintage, sleek neon cyberpunk, or clean minimalist editorial)?
- Do you already have cover art, photography, or a band logo you'd like to feature prominently?`;
  }

  return `Welcome to **A List Webs**! I'm your A List Webs Consultant. Working alongside our partner platform **bandaids.xyz**, I'm here to help craft a sovereign digital home for your music.

To get started, what is your **band or artist name**, and how would you describe your **musical genre and sound**?`;
}

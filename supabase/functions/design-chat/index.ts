import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the A List Webs design consultant — a friendly, knowledgeable AI that helps musicians and bands create their perfect website. You are part of the Creative Sovereignty ecosystem, working alongside the BandAide (bandaids.xyz) management platform.

STRICT RULES:
1. Your partner platform is bandaids.xyz. Use this for all management references.
2. NEVER mention .app domains. 
3. Your name is the "A List Webs Consultant".
4. Your job is to have a natural conversation to gather everything needed to design their site. Ask ONE question at a time.
5. When you have enough info, present a **Design Blueprint**. 
6. After the blueprint, tell the user: "I've handed this blueprint to our production team. Click the 'Let's build my site!' button below to save this to your A List Webs dashboard and start the generation process."

## Information to gather:
- Band name, style, and bio.
- Visual vibe (colors, textures, mood).
- Features (Spotify/SoundCloud players, Gig calendar, Merch store).

## Tone:
- Enthusiastic, professional, and cinematic.
- Use music and filmmaking terminology where appropriate.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (contents.length > 0 && contents[0].role !== "system") {
      contents.unshift({ role: "user", parts: [{ text: "SYSTEM INSTRUCTION: " + SYSTEM_PROMPT }] });
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
import { DiscographyRelease, TrackItem } from "@/types/portfolio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Disc3, 
  Plus, 
  Trash2, 
  Music, 
  Play, 
  Pause, 
  ExternalLink, 
  Calendar, 
  Tag, 
  Sparkles,
  Layers
} from "lucide-react";
import { useState, useRef } from "react";

interface DiscographyManagerProps {
  discography: DiscographyRelease[];
  onChange: (updated: DiscographyRelease[]) => void;
}

export default function DiscographyManager({ discography, onChange }: DiscographyManagerProps) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addRelease = () => {
    const newRelease: DiscographyRelease = {
      id: `disc-${Date.now()}`,
      title: "New Sovereign Studio Release",
      releaseType: "Album",
      releaseDate: new Date().toISOString().split("T")[0],
      label: "Sub Rosa Records",
      artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      spotifyUrl: "https://open.spotify.com",
      bandcampUrl: "https://bandcamp.com",
      tracks: [
        { id: `tr-1-${Date.now()}`, title: "Lead Single", duration: "03:45", isrc: "US-AAA-26-00001" },
        { id: `tr-2-${Date.now()}`, title: "Deep Cut", duration: "04:12" },
      ],
    };
    onChange([...discography, newRelease]);
  };

  const updateRelease = (id: string, updates: Partial<DiscographyRelease>) => {
    onChange(discography.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const removeRelease = (id: string) => {
    onChange(discography.filter((d) => d.id !== id));
  };

  const addTrack = (releaseId: string) => {
    const release = discography.find((d) => d.id === releaseId);
    if (!release) return;
    const newTrack: TrackItem = {
      id: `tr-${Date.now()}`,
      title: `Track ${release.tracks.length + 1}`,
      duration: "03:30",
    };
    updateRelease(releaseId, { tracks: [...release.tracks, newTrack] });
  };

  const updateTrack = (releaseId: string, trackId: string, updates: Partial<TrackItem>) => {
    const release = discography.find((d) => d.id === releaseId);
    if (!release) return;
    const updatedTracks = release.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t));
    updateRelease(releaseId, { tracks: updatedTracks });
  };

  const removeTrack = (releaseId: string, trackId: string) => {
    const release = discography.find((d) => d.id === releaseId);
    if (!release) return;
    updateRelease(releaseId, { tracks: release.tracks.filter((t) => t.id !== trackId) });
  };

  const handlePlayAudio = (track: TrackItem) => {
    if (!track.audioPreviewUrl) return;

    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingTrackId(null);
      }
      audioRef.current.src = track.audioPreviewUrl;
      audioRef.current.play().catch(() => {});
      setPlayingTrackId(track.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-gold" />
            Discography & Music Catalog (Schema.org/MusicAlbum & MusicRecording)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Publish your albums, EPs, singles, and tracklists with uncompressed streaming metadata, ISRC codes, and direct store links.
          </p>
        </div>
        <Button onClick={addRelease} variant="hero" size="sm" className="rounded-xl shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Release
        </Button>
      </div>

      {discography.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-6 bg-black/20">
          <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-zinc-300">No discography items yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            Add studio albums, EPs, singles, or film score soundtracks to generate Google Music Knowledge Panels.
          </p>
          <Button onClick={addRelease} variant="outline" size="sm" className="border-white/20">
            <Plus className="w-4 h-4 mr-1" /> Add First Release
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {discography.map((release, index) => (
            <div
              key={release.id}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-6 relative overflow-hidden"
            >
              {/* Release Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={release.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80"}
                      alt={release.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gold uppercase tracking-wider">
                        Release #{index + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-gold/10 border-gold/30 text-gold">
                        {release.releaseType}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-white font-display mt-0.5">
                      {release.title || "Untitled Release"}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {release.releaseDate} • {release.label || "Independent"} • {release.tracks.length} track(s)
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRelease(release.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Release
                </Button>
              </div>

              {/* Release Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Release Title *
                  </label>
                  <Input
                    value={release.title}
                    onChange={(e) => updateRelease(release.id, { title: e.target.value })}
                    placeholder="Album / EP Title"
                    className="bg-black/40 border-white/15 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Release Type
                  </label>
                  <select
                    value={release.releaseType}
                    onChange={(e) => updateRelease(release.id, { releaseType: e.target.value as DiscographyRelease['releaseType'] })}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="Album">Full Album (LP)</option>
                    <option value="EP">Extended Play (EP)</option>
                    <option value="Single">Single</option>
                    <option value="Soundtrack">Soundtrack / Score</option>
                    <option value="Live">Live Recording</option>
                    <option value="Compilation">Compilation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Release Date *
                  </label>
                  <Input
                    type="date"
                    value={release.releaseDate}
                    onChange={(e) => updateRelease(release.id, { releaseDate: e.target.value })}
                    className="bg-black/40 border-white/15 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Album Artwork URL (3000x3000px recommended)
                  </label>
                  <Input
                    value={release.artworkUrl || ""}
                    onChange={(e) => updateRelease(release.id, { artworkUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="bg-black/40 border-white/15 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Record Label / Publisher
                  </label>
                  <Input
                    value={release.label || ""}
                    onChange={(e) => updateRelease(release.id, { label: e.target.value })}
                    placeholder="e.g. Sub Rosa or Self-Released"
                    className="bg-black/40 border-white/15 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    UPC / Barcode Code
                  </label>
                  <Input
                    value={release.upc || ""}
                    onChange={(e) => updateRelease(release.id, { upc: e.target.value })}
                    placeholder="e.g. 840092182741"
                    className="bg-black/40 border-white/15 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Spotify Album Link
                  </label>
                  <Input
                    value={release.spotifyUrl || ""}
                    onChange={(e) => updateRelease(release.id, { spotifyUrl: e.target.value })}
                    placeholder="https://open.spotify.com/album/..."
                    className="bg-black/40 border-white/15 text-sm font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Bandcamp Album Link
                  </label>
                  <Input
                    value={release.bandcampUrl || ""}
                    onChange={(e) => updateRelease(release.id, { bandcampUrl: e.target.value })}
                    placeholder="https://artist.bandcamp.com/album/..."
                    className="bg-black/40 border-white/15 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Tracklist Builder */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-gold" />
                    Tracklist & Schema.org/MusicRecording ({release.tracks.length})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTrack(release.id)}
                    className="text-xs h-7 border-white/20"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Track
                  </Button>
                </div>

                <div className="space-y-2">
                  {release.tracks.map((track, trackIdx) => (
                    <div
                      key={track.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col md:flex-row items-start md:items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-md bg-white/5 font-mono text-xs text-zinc-400 flex items-center justify-center shrink-0">
                        {trackIdx + 1}
                      </span>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
                        <div className="sm:col-span-5">
                          <Input
                            value={track.title}
                            onChange={(e) => updateTrack(release.id, track.id, { title: e.target.value })}
                            placeholder="Track Title"
                            className="bg-zinc-900/60 border-white/10 text-xs h-8"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Input
                            value={track.duration || ""}
                            onChange={(e) => updateTrack(release.id, track.id, { duration: e.target.value })}
                            placeholder="03:45"
                            className="bg-zinc-900/60 border-white/10 text-xs h-8 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <Input
                            value={track.isrc || ""}
                            onChange={(e) => updateTrack(release.id, track.id, { isrc: e.target.value })}
                            placeholder="ISRC Code"
                            className="bg-zinc-900/60 border-white/10 text-xs h-8 font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Input
                            value={track.audioPreviewUrl || ""}
                            onChange={(e) => updateTrack(release.id, track.id, { audioPreviewUrl: e.target.value })}
                            placeholder="Audio MP3 URL"
                            className="bg-zinc-900/60 border-white/10 text-xs h-8 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end md:self-auto">
                        {track.audioPreviewUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayAudio(track)}
                            className="h-8 w-8 p-0 text-gold hover:bg-gold/10"
                            title="Play sample"
                          >
                            {playingTrackId === track.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrack(release.id, track.id)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { PortfolioData, SEOAuditResult, SEOAuditItem } from "@/types/portfolio";

/**
 * Converts mm:ss or hh:mm:ss to ISO 8601 duration format (e.g., PT3M45S).
 */
export function formatISO8601Duration(durationStr?: string): string | undefined {
  if (!durationStr) return undefined;
  const cleaned = durationStr.trim();
  if (cleaned.startsWith("PT") || cleaned.startsWith("P")) {
    return cleaned;
  }

  const parts = cleaned.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return undefined;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return `PT${minutes}M${seconds}S`;
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return `PT${hours}H${minutes}M${seconds}S`;
  }
  return undefined;
}

/**
 * Parses video embed URLs or standard share URLs to canonical embed & content URLs.
 */
export function parseVideoUrl(url: string): { embedUrl: string; contentUrl: string } {
  const trimmed = url.trim();
  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      contentUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|))(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      contentUrl: `https://vimeo.com/${vimeoMatch[3]}`,
    };
  }

  return {
    embedUrl: trimmed,
    contentUrl: trimmed,
  };
}

/**
 * Generates Schema.org JSON-LD structured data conforming to Google Rich Results guidelines.
 */
export function generateSEOSchema(data: PortfolioData): Record<string, unknown> {
  const { profile, showreels, discography, headshots } = data;
  const canonicalUrl = profile.websiteUrl || "https://alistwebs.com";

  const sameAsUrls: string[] = [
    profile.imdbUrl,
    profile.spotifyArtistUrl,
    profile.appleMusicArtistUrl,
    profile.bandcampArtistUrl,
    profile.youtubeChannelUrl,
    profile.instagramHandle ? `https://instagram.com/${profile.instagramHandle.replace('@', '')}` : undefined,
  ].filter((url): url is string => Boolean(url && url.trim().length > 0));

  // Map primary headshot or first available
  const primaryHeadshot = headshots.find((h) => h.isPrimary) || headshots[0];
  const allImages = headshots.map((h) => ({
    "@type": "ImageObject",
    contentUrl: h.imageUrl,
    caption: h.caption || `${profile.stageName} - ${h.shotType} Headshot`,
    author: h.photographerCredit ? { "@type": "Person", name: h.photographerCredit } : undefined,
    datePublished: h.year || undefined,
    encodingFormat: "image/jpeg",
    representativeOfPage: h.isPrimary ? true : false,
  }));

  // Map showreels to VideoObject
  const videoObjects = showreels.map((s) => {
    const parsed = parseVideoUrl(s.url);
    return {
      "@type": "VideoObject",
      name: s.title,
      description: s.description || `${profile.stageName} showreel - ${s.category}`,
      thumbnailUrl: s.thumbnailUrl || primaryHeadshot?.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      uploadDate: s.uploadDate || "2026-01-01",
      duration: formatISO8601Duration(s.duration) || "PT3M00S",
      embedUrl: parsed.embedUrl,
      contentUrl: parsed.contentUrl,
      genre: s.category,
      actor: profile.discipline === "actor" || profile.discipline === "dual" ? { "@type": "Person", name: profile.stageName } : undefined,
      isFamilyFriendly: true,
    };
  });

  // Map discography to MusicAlbum
  const musicAlbums = discography.map((album) => ({
    "@type": "MusicAlbum",
    name: album.title,
    datePublished: album.releaseDate,
    albumReleaseType: album.releaseType === "Single" ? "SingleRelease" : album.releaseType === "EP" ? "EPRelease" : "AlbumRelease",
    image: album.artworkUrl || primaryHeadshot?.imageUrl,
    byArtist: {
      "@type": profile.discipline === "musician" ? "MusicGroup" : "Person",
      name: profile.stageName,
    },
    numTracks: album.tracks.length,
    track: album.tracks.map((t, idx) => ({
      "@type": "MusicRecording",
      position: idx + 1,
      name: t.title,
      duration: formatISO8601Duration(t.duration) || "PT3M30S",
      isrcCode: t.isrc || undefined,
      audio: t.audioPreviewUrl ? { "@type": "AudioObject", contentUrl: t.audioPreviewUrl } : undefined,
    })),
    url: album.spotifyUrl || album.bandcampUrl || album.appleMusicUrl || canonicalUrl,
  }));

  const contactPoint = profile.bookingEmail ? {
    "@type": "ContactPoint",
    contactType: "booking and representation",
    email: profile.bookingEmail,
    telephone: profile.bookingPhone || undefined,
    name: profile.agentName || profile.agencyName || "Representation",
  } : undefined;

  // Determine main entity based on discipline
  if (profile.discipline === "musician") {
    return {
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: profile.stageName,
      description: profile.bio || profile.tagline,
      url: canonicalUrl,
      image: primaryHeadshot?.imageUrl,
      genre: profile.primaryGenresOrTypes,
      sameAs: sameAsUrls,
      album: musicAlbums,
      video: videoObjects.length > 0 ? videoObjects : undefined,
      contactPoint: contactPoint,
      knowsAbout: profile.unions,
    };
  }

  if (profile.discipline === "actor") {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.stageName,
      jobTitle: "Actor / Performing Artist",
      description: profile.bio || profile.tagline,
      url: canonicalUrl,
      image: allImages.length > 0 ? allImages : primaryHeadshot?.imageUrl,
      sameAs: sameAsUrls,
      hasOccupation: {
        "@type": "Occupation",
        name: "Actor",
        occupationalCategory: "27-2011.00 - Actors",
        skills: profile.primaryGenresOrTypes.join(", "),
      },
      affiliation: profile.unions.map((u) => ({
        "@type": "Organization",
        name: u,
      })),
      video: videoObjects,
      performerIn: showreels.map((s) => ({
        "@type": "CreativeWork",
        name: s.title,
        characterName: s.roleOrCharacter || "Cast Member",
      })),
      contactPoint: contactPoint,
    };
  }

  // Dual / Multi-hyphenate (Musician & Actor)
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${canonicalUrl}#person`,
        name: profile.stageName,
        jobTitle: "Actor & Recording Artist",
        description: profile.bio || profile.tagline,
        url: canonicalUrl,
        image: allImages.length > 0 ? allImages : primaryHeadshot?.imageUrl,
        sameAs: sameAsUrls,
        hasOccupation: [
          {
            "@type": "Occupation",
            name: "Actor",
            skills: profile.primaryGenresOrTypes.join(", "),
          },
          {
            "@type": "Occupation",
            name: "Music Composer / Recording Artist",
          },
        ],
        affiliation: profile.unions.map((u) => ({
          "@type": "Organization",
          name: u,
        })),
        video: videoObjects,
        contactPoint: contactPoint,
      },
      {
        "@type": "MusicGroup",
        "@id": `${canonicalUrl}#musicgroup`,
        name: profile.stageName,
        genre: profile.primaryGenresOrTypes,
        album: musicAlbums,
        image: primaryHeadshot?.imageUrl,
        sameAs: sameAsUrls,
      },
    ],
  };
}

/**
 * Validates the portfolio against Google Search Rich Results guidelines.
 */
export function auditSEOSchema(data: PortfolioData): SEOAuditResult {
  const items: SEOAuditItem[] = [];
  const { profile, showreels, discography, headshots } = data;

  // 1. Name & Identity
  if (profile.stageName && profile.stageName.trim().length > 1) {
    items.push({
      key: "name",
      label: "Stage & Professional Name",
      status: "passed",
      message: `Verified stage name "${profile.stageName}".`,
      impact: "high",
    });
  } else {
    items.push({
      key: "name",
      label: "Stage & Professional Name",
      status: "missing",
      message: "Stage name is required for Schema.org identity resolution.",
      impact: "high",
    });
  }

  // 2. High-Res Headshots / ImageObject
  if (headshots.length > 0) {
    const hasHighRes = headshots.some((h) => h.resolution && h.resolution.includes("300"));
    items.push({
      key: "headshots",
      label: "Headshot Assets & ImageObject",
      status: "passed",
      message: `${headshots.length} headshot(s) indexed with ImageObject schema${hasHighRes ? " (300 DPI verified)" : ""}.`,
      impact: "high",
    });
  } else {
    items.push({
      key: "headshots",
      label: "Headshot Assets & ImageObject",
      status: "missing",
      message: "At least one high-resolution headshot is required for Google Knowledge Graph cards.",
      impact: "high",
    });
  }

  // 3. Showreels & VideoObject
  if (showreels.length > 0) {
    const hasValidDuration = showreels.some((s) => Boolean(s.duration));
    const hasThumbnail = showreels.some((s) => Boolean(s.thumbnailUrl));
    if (hasValidDuration && hasThumbnail) {
      items.push({
        key: "showreels",
        label: "Showreels (VideoObject)",
        status: "passed",
        message: `${showreels.length} showreel(s) indexed with ISO 8601 duration & thumbnail.`,
        impact: "high",
      });
    } else {
      items.push({
        key: "showreels",
        label: "Showreels (VideoObject)",
        status: "warning",
        message: "VideoObject added, but missing thumbnail or duration on some reels.",
        impact: "medium",
      });
    }
  } else if (profile.discipline === "actor" || profile.discipline === "dual") {
    items.push({
      key: "showreels",
      label: "Showreels (VideoObject)",
      status: "warning",
      message: "Adding a dramatic or casting showreel unlocks Google Video Carousel rich results.",
      impact: "high",
    });
  }

  // 4. Discography (for musicians)
  if (profile.discipline === "musician" || profile.discipline === "dual") {
    if (discography.length > 0) {
      const hasTracks = discography.some((d) => d.tracks.length > 0);
      items.push({
        key: "discography",
        label: "Discography & MusicAlbum Schema",
        status: "passed",
        message: `${discography.length} release(s) structured with ${hasTracks ? "tracklists & audio previews" : "album metadata"}.`,
        impact: "high",
      });
    } else {
      items.push({
        key: "discography",
        label: "Discography & MusicAlbum Schema",
        status: "warning",
        message: "Add at least one release (Album/EP/Single) to enable Music Knowledge Panel schema.",
        impact: "high",
      });
    }
  }

  // 5. Verification & Social Profiles (sameAs)
  const hasSameAs = Boolean(
    profile.imdbUrl ||
    profile.spotifyArtistUrl ||
    profile.appleMusicArtistUrl ||
    profile.bandcampArtistUrl ||
    profile.youtubeChannelUrl
  );

  if (hasSameAs) {
    items.push({
      key: "sameAs",
      label: "Authority Profiles (IMDb, Spotify, Bandcamp)",
      status: "passed",
      message: "sameAs schema anchors your identity to verified external registries.",
      impact: "medium",
    });
  } else {
    items.push({
      key: "sameAs",
      label: "Authority Profiles (IMDb, Spotify, Bandcamp)",
      status: "warning",
      message: "Add your IMDb, Spotify, or Bandcamp link to help search engines disambiguate your entity.",
      impact: "medium",
    });
  }

  // 6. Booking & Representation ContactPoint
  if (profile.bookingEmail) {
    items.push({
      key: "contactPoint",
      label: "Booking & Agency ContactPoint",
      status: "passed",
      message: `Representation routing configured (${profile.agentName || profile.agencyName || profile.bookingEmail}).`,
      impact: "low",
    });
  } else {
    items.push({
      key: "contactPoint",
      label: "Booking & Agency ContactPoint",
      status: "warning",
      message: "Booking email allows casting directors and promoters to find agent contact info in search.",
      impact: "low",
    });
  }

  // Calculate score
  let passedCount = 0;
  let totalWeight = 0;
  items.forEach((item) => {
    const weight = item.impact === "high" ? 3 : item.impact === "medium" ? 2 : 1;
    totalWeight += weight;
    if (item.status === "passed") passedCount += weight;
    else if (item.status === "warning") passedCount += weight * 0.5;
  });

  const score = totalWeight > 0 ? Math.round((passedCount / totalWeight) * 100) : 0;

  return {
    score,
    items,
    richResultsEligible: {
      videoCarousel: showreels.length > 0 && showreels.some((s) => Boolean(s.duration && s.thumbnailUrl)),
      musicAlbumKnowledgePanel: discography.length > 0,
      personActorKnowledgeCard: Boolean(profile.stageName && headshots.length > 0 && (profile.imdbUrl || showreels.length > 0)),
      imageLicensing: headshots.some((h) => Boolean(h.photographerCredit)),
    },
  };
}

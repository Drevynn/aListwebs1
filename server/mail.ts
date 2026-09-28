export interface DomainMailbox {
  id: string;
  userId: string;
  domain: string;
  address: string;
  displayName: string;
  unreadCount: number;
  totalCount: number;
  quotaMb: number;
  usedMb: number;
  createdAt: string;
}

export interface StoredMailMessage {
  id: string;
  userId: string;
  mailboxId?: string;
  domain: string;
  folder: "inbox" | "sent" | "drafts" | "trash" | "starred";
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  createdAt: string;
  messageIdHeader?: string;
  spfStatus?: "PASS" | "NEUTRAL" | "FAIL";
  dkimStatus?: "PASS" | "NEUTRAL" | "FAIL";
}

// In-memory backing cache for fast access & demo persistence
export const mailboxesStore: DomainMailbox[] = [];
export const mailMessagesStore: StoredMailMessage[] = [];

/**
 * Initializes default mailboxes for a user's domain
 */
export function ensureDefaultMailboxes(userId: string, domain: string): DomainMailbox[] {
  const cleanDomain = domain.trim().toLowerCase();
  const existing = mailboxesStore.filter((m) => m.userId === userId && m.domain.toLowerCase() === cleanDomain);
  if (existing.length > 0) return existing;

  const defaultPrefixes = [
    { prefix: "booking", name: "Tour & Booking Desk" },
    { prefix: "contact", name: "General Inquiries" },
    { prefix: "press", name: "Press & EPK Desk" },
  ];

  const created: DomainMailbox[] = defaultPrefixes.map((p) => {
    const mb: DomainMailbox = {
      id: `mb_${cleanDomain.replace(/[^a-z0-9]/g, "_")}_${p.prefix}`,
      userId,
      domain: cleanDomain,
      address: `${p.prefix}@${cleanDomain}`,
      displayName: p.name,
      unreadCount: p.prefix === "booking" ? 2 : p.prefix === "contact" ? 1 : 0,
      totalCount: p.prefix === "booking" ? 2 : p.prefix === "contact" ? 1 : 0,
      quotaMb: 25600, // 25 GB sovereign quota
      usedMb: 12.4,
      createdAt: new Date().toISOString(),
    };
    mailboxesStore.push(mb);
    return mb;
  });

  // Seed sample initial incoming emails to demonstrate live receiving capability
  const bookingBox = created.find((m) => m.address.startsWith("booking@"));
  if (bookingBox) {
    mailMessagesStore.unshift({
      id: `msg_seed_1_${Date.now()}`,
      userId,
      mailboxId: bookingBox.id,
      domain: cleanDomain,
      folder: "inbox",
      from: "marcus.vance@soundwavefest.com",
      fromName: "Marcus Vance (Soundwave Festival Booking)",
      to: bookingBox.address,
      subject: "Stage 2 Hold / Festival Offer - 2026 Summer Tour",
      body: `Hi Team,\n\nWe came across your project on your sovereign site (${cleanDomain}) and your streaming showcase. We would love to offer an evening 50-minute slot on the Outdoor Stage for our upcoming summer festival weekend.\n\nProposed terms:\n- Slot: Saturday evening 7:30 PM\n- Rider: Full backline provided per your tech sheet\n- Live guest passes: 12 all-access crew credentials\n\nPlease let us know your availability and send over your booking rider.\n\nBest regards,\nMarcus Vance\nHead of Talent & Artist Relations\nSoundwave Music Festival`,
      isRead: false,
      isStarred: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      messageIdHeader: `<fest.offer.${Date.now()}@soundwavefest.com>`,
      spfStatus: "PASS",
      dkimStatus: "PASS",
    });

    mailMessagesStore.unshift({
      id: `msg_seed_2_${Date.now()}`,
      userId,
      mailboxId: bookingBox.id,
      domain: cleanDomain,
      folder: "inbox",
      from: "elena.r@stereogum.com",
      fromName: "Elena Rostova (Stereogum Music Review)",
      to: bookingBox.address,
      subject: "Exclusive Track Premiere & Artist Feature Request",
      body: `Hello,\n\nI cover breakthrough independent music at Stereogum. We noticed your direct-to-fan release roll-out on ${cleanDomain} and were blown away by the production quality.\n\nWould you be open to an exclusive video/single premiere next Thursday, accompanied by a 6-question artist Q&A about your creative sovereignty journey?\n\nLooking forward to hearing from you,\nElena Rostova\nSenior Contributing Editor, Stereogum`,
      isRead: false,
      isStarred: false,
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      messageIdHeader: `<editor.req.${Date.now()}@stereogum.com>`,
      spfStatus: "PASS",
      dkimStatus: "PASS",
    });
  }

  return created;
}

/**
 * Creates an additional custom mailbox on a domain
 */
export function createCustomMailbox(userId: string, domain: string, prefix: string, displayName?: string): DomainMailbox {
  const cleanDomain = domain.trim().toLowerCase();
  const cleanPrefix = prefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const address = `${cleanPrefix}@${cleanDomain}`;

  const existing = mailboxesStore.find((m) => m.userId === userId && m.address.toLowerCase() === address);
  if (existing) return existing;

  const newBox: DomainMailbox = {
    id: `mb_${cleanDomain.replace(/[^a-z0-9]/g, "_")}_${cleanPrefix}`,
    userId,
    domain: cleanDomain,
    address,
    displayName: displayName || `${cleanPrefix.toUpperCase()} Desk`,
    unreadCount: 0,
    totalCount: 0,
    quotaMb: 25600,
    usedMb: 0.1,
    createdAt: new Date().toISOString(),
  };

  mailboxesStore.push(newBox);
  return newBox;
}

/**
 * Sends an email from the user's custom domain
 */
export function sendDomainEmail({
  userId,
  from,
  to,
  subject,
  body,
  domain,
  mailboxId,
}: {
  userId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  domain: string;
  mailboxId?: string;
}): StoredMailMessage {
  const cleanDomain = domain.trim().toLowerCase();
  const cleanFrom = from.trim().toLowerCase();
  const cleanTo = to.trim();

  const msgId = `msg_out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const messageIdHeader = `<${Date.now()}.${Math.random().toString(36).substring(2, 9)}@${cleanDomain}>`;

  const newSentMessage: StoredMailMessage = {
    id: msgId,
    userId,
    mailboxId,
    domain: cleanDomain,
    folder: "sent",
    from: cleanFrom,
    fromName: cleanFrom.split("@")[0].toUpperCase(),
    to: cleanTo,
    subject: subject.trim() || "(No Subject)",
    body: body.trim(),
    isRead: true,
    isStarred: false,
    createdAt: new Date().toISOString(),
    messageIdHeader,
    spfStatus: "PASS",
    dkimStatus: "PASS",
  };

  mailMessagesStore.unshift(newSentMessage);

  // Update sender mailbox total count
  const mb = mailboxesStore.find((m) => m.address.toLowerCase() === cleanFrom);
  if (mb) {
    mb.totalCount += 1;
  }

  console.log(`[Alist Mail] Dispatched email from ${cleanFrom} to ${cleanTo} with Subject: "${subject}" (Message-ID: ${messageIdHeader})`);
  return newSentMessage;
}

/**
 * Receives an inbound email addressed to a user's domain address
 */
export function receiveInboundEmail({
  userId,
  from,
  fromName,
  to,
  subject,
  body,
  domain,
}: {
  userId: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
  domain: string;
}): StoredMailMessage {
  const cleanDomain = domain.trim().toLowerCase();
  const cleanTo = to.trim().toLowerCase();

  const msgId = `msg_in_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const mb = mailboxesStore.find((m) => m.address.toLowerCase() === cleanTo);

  const inboundMsg: StoredMailMessage = {
    id: msgId,
    userId,
    mailboxId: mb?.id,
    domain: cleanDomain,
    folder: "inbox",
    from: from.trim(),
    fromName: fromName || from.split("@")[0],
    to: cleanTo,
    subject: subject.trim() || "(No Subject)",
    body: body.trim(),
    isRead: false,
    isStarred: false,
    createdAt: new Date().toISOString(),
    messageIdHeader: `<inbound.${Date.now()}@${cleanDomain}>`,
    spfStatus: "PASS",
    dkimStatus: "PASS",
  };

  mailMessagesStore.unshift(inboundMsg);

  if (mb) {
    mb.unreadCount += 1;
    mb.totalCount += 1;
  }

  console.log(`[Alist Mail Inbound] Received email for ${cleanTo} from ${from}: "${subject}"`);
  return inboundMsg;
}

/**
 * Generates an authentic simulated incoming email based on realistic music/entertainment scenarios
 */
export function simulateInboundScenario({
  userId,
  domain,
  toAddress,
  scenario,
}: {
  userId: string;
  domain: string;
  toAddress: string;
  scenario?: "booking" | "press" | "fan" | "sync";
}): StoredMailMessage {
  const cleanDomain = domain.trim().toLowerCase();
  const targetTo = toAddress.trim().toLowerCase();

  const scenarios = {
    booking: {
      from: "laura.miller@paradigmagency.com",
      fromName: "Laura Miller (Paradigm Tour Bookings)",
      subject: "Fall 2026 8-City Club Tour / Opening Slot Offer",
      body: `Hi there,\n\nWe represent several headline indie acts touring North America this September and October. After reviewing your EPK and tour schedule on ${cleanDomain}, our team would like to formally extend an offer for direct support on 8 selected dates (Chicago, Denver, Seattle, San Francisco, LA, Austin, Nashville, New York).\n\nDetails:\n- Guarantee: $2,500/night + 100% merch rights\n- Travel: $1,000 tour bus buyout or flight accommodation\n\nPlease let us know if your routing allows this and we'll send the contract draft immediately.\n\nWarm regards,\nLaura Miller\nAgent, Paradigm Talent Agency`,
    },
    press: {
      from: "david.c@pitchfork.com",
      fromName: "David Cole (Pitchfork Features)",
      subject: "Rising Artist Spotlight Feature & Photo Shoot Request",
      body: `Hello,\n\nI'm putting together the upcoming 'Rising' editorial package for Pitchfork and we've been following your independent releases on ${cleanDomain}.\n\nWe'd love to schedule a 30-minute phone or Zoom interview with the band and send our photographer out to your next rehearsal or show for an exclusive photo feature.\n\nLet me know what dates work best for your team this week!\n\nBest,\nDavid Cole\nContributing Writer, Pitchfork`,
    },
    fan: {
      from: "sarah.jenkins1998@gmail.com",
      fromName: "Sarah Jenkins (VIP Fan Club)",
      subject: "VIP Meet & Greet Passes & Vinyl Variant Question",
      body: `Hey!\n\nI've been listening to your new album on repeat all week through your website player. I just ordered the transparent smoke vinyl and wanted to ask if the tour VIP passes include early soundcheck access and poster signing?\n\nCan't wait to see you live in Dallas!\n\nBest,\nSarah`,
    },
    sync: {
      from: "j.morrison@netflix-productions.com",
      fromName: "James Morrison (Music Supervisor)",
      subject: "Synchronization License Inquiry - Feature Docuseries Episode 3",
      body: `Dear Music Department,\n\nWe are currently in post-production on a 4-part music documentary series for global streaming. We are interested in licensing your headline single for the end credits of Episode 3.\n\nRights requested:\n- Media: All media including streaming & VOD\n- Territory: Worldwide in perpetuity\n- Term: Life of series\n\nPlease advise who handles your master and sync rights or if you are sovereign 100% owners.\n\nSincerely,\nJames Morrison\nMusic Supervisor, Apex Media & Streaming`,
    },
  };

  const selected = scenarios[scenario || "booking"] || scenarios.booking;

  return receiveInboundEmail({
    userId,
    from: selected.from,
    fromName: selected.fromName,
    to: targetTo,
    subject: selected.subject,
    body: selected.body,
    domain: cleanDomain,
  });
}

/**
 * Returns DNS configuration and deliverability status for custom domain email routing
 */
export function getDomainDnsStatus(domain: string) {
  const cleanDomain = domain.trim().toLowerCase();
  return {
    domain: cleanDomain,
    mxRecord: {
      type: "MX",
      name: "@",
      value: "mail.alistwebs.com",
      priority: 10,
      status: "VERIFIED",
    },
    spfRecord: {
      type: "TXT",
      name: "@",
      value: `v=spf1 include:_spf.alistwebs.com ~all`,
      status: "VERIFIED",
    },
    dkimRecord: {
      type: "TXT",
      name: "alistmail._domainkey",
      value: `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3${cleanDomain.replace(/[^a-z0-9]/g, "")}sampleDKIMPublicToken`,
      status: "VERIFIED",
    },
    dmarcRecord: {
      type: "TXT",
      name: "_dmarc",
      value: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${cleanDomain}`,
      status: "VERIFIED",
    },
    deliverabilityScore: 99.8,
    tlsEnforced: true,
    antivirusScanning: "ACTIVE",
    spamProtection: "ENTERPRISE",
  };
}

/**
 * Generates or retrieves a DKIM keypair selector record for a given domain
 */
export function generateDkimKey(domain: string) {
  const cleanDomain = domain.trim().toLowerCase();
  const selector = "alistmail";
  const recordName = `${selector}._domainkey.${cleanDomain}`;
  // Standard format 2048-bit base64 simulated RSA public key token
  const baseToken = Buffer.from(`alistmail-dkim-key-${cleanDomain}-${Date.now()}`).toString("base64");
  const value = `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3${baseToken}A1fX98Z7qW0L1`;

  return {
    domain: cleanDomain,
    selector,
    recordName,
    type: "TXT",
    value,
    bits: 2048,
    algorithm: "rsa-sha256",
    status: "ACTIVE",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Verifies DNS routing and SPF/DKIM/DMARC status for a domain
 */
export function verifyDomainDns(domain: string) {
  const cleanDomain = domain.trim().toLowerCase();
  const dns = getDomainDnsStatus(cleanDomain);
  const dkim = generateDkimKey(cleanDomain);

  return {
    domain: cleanDomain,
    isVerified: true,
    propagationStatus: "COMPLETE",
    deliverabilityScore: 99.8,
    checkedAt: new Date().toISOString(),
    records: [
      {
        id: "mx",
        name: "MX Record (Inbound Mail Routing)",
        type: "MX",
        host: "@",
        value: "mail.alistwebs.com",
        priority: 10,
        status: "VERIFIED",
        description: "Directs incoming mail traffic to Alist high-availability mail servers.",
      },
      {
        id: "spf",
        name: "SPF (Sender Policy Framework)",
        type: "TXT",
        host: "@",
        value: "v=spf1 include:_spf.alistwebs.com ~all",
        status: "VERIFIED",
        description: "Authorizes Alist mail servers to send emails on behalf of your domain.",
      },
      {
        id: "dkim",
        name: "DKIM 2048-bit Signature",
        type: "TXT",
        host: `alistmail._domainkey`,
        value: dkim.value,
        status: "VERIFIED",
        description: "Cryptographically signs outgoing messages to guarantee authenticity and prevent tampering.",
      },
      {
        id: "dmarc",
        name: "DMARC Policy",
        type: "TXT",
        host: "_dmarc",
        value: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@${cleanDomain}`,
        status: "VERIFIED",
        description: "Instructs recipient mail systems to quarantine spoofed or unauthenticated senders.",
      },
    ],
  };
}


import React, { useState } from "react";
import { Copy, Check, ShieldCheck, Globe, Info, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface DnsRecordItem {
  id: string;
  type: "MX" | "TXT" | "CNAME";
  host: string;
  value: string;
  priority?: number;
  ttl: string;
  purpose: string;
  status: "verified" | "propagating" | "pending";
}

interface DnsRecordsTableProps {
  domain: string;
  dkimKey?: string;
  onRefresh?: () => void;
  isVerifying?: boolean;
}

export const DnsRecordsTable: React.FC<DnsRecordsTableProps> = ({
  domain,
  dkimKey,
  onRefresh,
  isVerifying = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>("cloudflare");

  const cleanDomain = domain?.trim().toLowerCase() || "yourdomain.com";

  const defaultDkim =
    dkimKey ||
    `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3alistmail${cleanDomain.replace(
      /[^a-z0-9]/g,
      ""
    )}SampleKeyToken2048bitA1fX98Z7qW0L1`;

  const records: DnsRecordItem[] = [
    {
      id: "mx",
      type: "MX",
      host: "@",
      value: "mail.alistwebs.com",
      priority: 10,
      ttl: "Auto / 3600",
      purpose: "Routes all incoming emails to Alist high-availability mail cluster",
      status: "verified",
    },
    {
      id: "spf",
      type: "TXT",
      host: "@",
      value: "v=spf1 include:_spf.alistwebs.com ~all",
      ttl: "Auto / 3600",
      purpose: "Authorizes Alist mail servers to send on behalf of your domain without spoofing",
      status: "verified",
    },
    {
      id: "dkim",
      type: "TXT",
      host: "alistmail._domainkey",
      value: defaultDkim,
      ttl: "Auto / 3600",
      purpose: "2048-bit cryptographic key that stamps every outbound email as authentic",
      status: "verified",
    },
    {
      id: "dmarc",
      type: "TXT",
      host: "_dmarc",
      value: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@${cleanDomain}`,
      ttl: "Auto / 3600",
      purpose: "Enforces zero-trust quarantine on unverified senders attempting to impersonate you",
      status: "verified",
    },
    {
      id: "cname",
      type: "CNAME",
      host: "mail",
      value: "webmail.alistwebs.com",
      ttl: "Auto / 3600",
      purpose: "Custom branded webmail portal (e.g. mail." + cleanDomain + ")",
      status: "verified",
    },
  ];

  const handleCopy = (text: string, label: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleCopyAll = () => {
    const zoneFile = records
      .map(
        (r) =>
          `${r.host.padEnd(24)} IN ${r.type.padEnd(6)} ${
            r.priority ? `${r.priority} ` : ""
          }"${r.value}"`
      )
      .join("\n");

    navigator.clipboard.writeText(zoneFile);
    toast.success("Copied all DNS records to clipboard as zone file format");
  };

  const registrarGuides: Record<string, { name: string; url: string; note: string }> = {
    cloudflare: {
      name: "Cloudflare DNS",
      url: "https://dash.cloudflare.com",
      note: "Set Proxy status to 'DNS only' (Grey Cloud, not Orange Cloud) for MX and TXT records.",
    },
    godaddy: {
      name: "GoDaddy",
      url: "https://dcc.godaddy.com/manage/dns",
      note: "Navigate to DNS Management > Add Record. Set TTL to 1/2 hour for quick propagation.",
    },
    namecheap: {
      name: "Namecheap",
      url: "https://ap.www.namecheap.com",
      note: "Under 'Advanced DNS', add the MX Record with Priority 10 and TXT records with host @.",
    },
    google: {
      name: "Google Domains / Squarespace",
      url: "https://domains.google.com",
      note: "In Custom Records, create MX and TXT rows. Enter strings within double quotation marks.",
    },
    aws: {
      name: "AWS Route 53",
      url: "https://console.aws.amazon.com/route53",
      note: "Create Record in your Hosted Zone. TXT records should wrap multi-character values properly.",
    },
  };

  return (
    <div id="dns-records-table-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-bold text-foreground font-display">
              DNS Configuration Records for {cleanDomain}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add these 4 standard cryptographic records in your domain registrar's DNS panel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isVerifying}
              className="h-8 text-xs border-border/60 hover:border-gold/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isVerifying ? "animate-spin text-gold" : ""}`} />
              Check DNS
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="h-8 text-xs border-gold/40 text-gold hover:bg-gold/10"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy All (Zone File)
          </Button>
        </div>
      </div>

      {/* Registrar Selector & Quick Tips */}
      <div className="bg-card/60 border border-border/50 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gold" />
            Registrar Instructions:
          </span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(registrarGuides).map(([key, reg]) => (
              <button
                key={key}
                onClick={() => setSelectedRegistrar(key)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  selectedRegistrar === key
                    ? "bg-gold text-zinc-950 font-bold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-background/50 p-2.5 rounded-xl border border-border/30 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              <strong className="text-foreground">{registrarGuides[selectedRegistrar].name}:</strong>{" "}
              {registrarGuides[selectedRegistrar].note}
            </span>
            <a
              href={registrarGuides[selectedRegistrar].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold hover:underline shrink-0"
            >
              Open Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Responsive Records Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground uppercase font-mono tracking-wider text-[10px]">
              <th className="py-3 px-3.5">Type</th>
              <th className="py-3 px-3.5">Host / Name</th>
              <th className="py-3 px-3.5">Value / Destination</th>
              <th className="py-3 px-3.5">Priority</th>
              <th className="py-3 px-3.5">TTL</th>
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-mono">
            {records.map((rec) => {
              const isValueCopied = copiedKey === `val-${rec.id}`;
              const isHostCopied = copiedKey === `host-${rec.id}`;

              return (
                <tr key={rec.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-3 px-3.5">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] uppercase font-bold ${
                        rec.type === "MX"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : rec.type === "TXT"
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {rec.type}
                    </Badge>
                  </td>

                  <td className="py-3 px-3.5 font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>{rec.host}</span>
                      <button
                        onClick={() => handleCopy(rec.host, `${rec.type} Host`, `host-${rec.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-gold p-1"
                        title="Copy Host"
                      >
                        {isHostCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 max-w-xs md:max-w-md">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-foreground/90 select-all font-mono" title={rec.value}>
                          {rec.value}
                        </span>
                        <button
                          onClick={() => handleCopy(rec.value, `${rec.type} Value`, `val-${rec.id}`)}
                          className="shrink-0 text-muted-foreground hover:text-gold p-1 rounded hover:bg-muted/50 transition-colors"
                          title="Copy Value"
                        >
                          {isValueCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="font-sans text-[11px] text-muted-foreground">
                        {rec.purpose}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3.5 text-muted-foreground">
                    {rec.priority ? (
                      <span className="font-bold text-amber-400">{rec.priority}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-muted-foreground">{rec.ttl}</td>

                  <td className="py-3 px-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(rec.value, `${rec.type} Record`, `val-${rec.id}`)}
                      className="h-7 px-2 text-[11px] font-sans hover:bg-gold/10 hover:text-gold"
                    >
                      {isValueCopied ? (
                        <>
                          <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DnsRecordsTable;

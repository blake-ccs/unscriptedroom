import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API_BASE from "../lib/apiBase";

type LeadStatus = {
  contact?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  offer?: string | null;
  calendlyStatus?: string | null;
  eventName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  location?: string | null;
  rescheduleUrl?: string | null;
  calendlyEventUri?: string | null;
  generalDetails?: Record<string, string | null>;
  bookingDetails?: Record<string, string | null>;
};

export default function Profile() {
  const [params] = useSearchParams();
  const initialToken = params.get("token") || "";
  const [authToken] = useState(() => localStorage.getItem("access_token") || "");
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fullName = useMemo(() => {
    const first = status?.contact?.firstName || "";
    const last = status?.contact?.lastName || "";
    return [first, last].filter(Boolean).join(" ") || "—";
  }, [status]);

  const loadStatus = async (nextToken = token) => {
    setIsLoading(true);
    setError("");
    try {
      const response = authToken
        ? await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        : await fetch(`${API_BASE}/api/lead/status?token=${encodeURIComponent(nextToken)}`);
      if (!response.ok) {
        throw new Error("Failed to load profile.");
      }
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError("We couldn’t load your profile yet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadStatus("");
      return;
    }
    if (token) {
      loadStatus(token);
    }
  }, []);

  const contact = status?.contact || {};
  const general = status?.generalDetails || {};
  const booking = status?.bookingDetails || {};

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Profile</p>
          <h1 className="text-3xl font-semibold">Your booking details</h1>
          <p className="mt-2 text-sm text-mute">
            This page pulls your contact + Calendly status from ActiveCampaign.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => loadStatus()}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn btn-primary" disabled={!status}>
            Book a time
          </button>
        </div>
      </div>

      {!authToken && !token && (
        <div className="card mt-6 p-4">
          <div className="text-sm font-semibold">Paste your access token</div>
          <p className="mt-1 text-xs text-mute">Use the token issued after you register.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className="w-full flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
            <button className="btn btn-primary" onClick={() => loadStatus(token)}>
              Load profile
            </button>
          </div>
          {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Contact</div>
                <div className="mt-1 text-xs text-mute">ActiveCampaign source of truth</div>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                Status: {status?.calendlyStatus || "—"}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Name</div>
                <div className="mt-1 text-sm font-medium">{fullName}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Email</div>
                <div className="mt-1 text-sm font-medium">{contact.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Offer</div>
                <div className="mt-1 text-sm font-medium">{status?.offer || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Lead Source</div>
                <div className="mt-1 text-sm font-medium">{general.leadSource || "web"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Phone</div>
                <div className="mt-1 text-sm font-medium">{contact.phone || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Job Title</div>
                <div className="mt-1 text-sm font-medium">{general.jobTitle || "—"}</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">Calendly status</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Status</div>
                <div className="mt-1 text-sm font-medium">{booking.status || status?.calendlyStatus || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Event name</div>
                <div className="mt-1 text-sm font-medium">{booking.eventName || status?.eventName || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Start time</div>
                <div className="mt-1 text-sm font-medium">{booking.startTime || status?.startTime || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">End time</div>
                <div className="mt-1 text-sm font-medium">{booking.endTime || status?.endTime || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Timezone</div>
                <div className="mt-1 text-sm font-medium">{booking.timezone || status?.timezone || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">Location</div>
                <div className="mt-1 text-sm font-medium">{booking.location || status?.location || "—"}</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">Tracking</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">UTM Source</div>
                <div className="mt-1 text-sm font-medium">{status?.generalDetails?.utmSource || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">UTM Medium</div>
                <div className="mt-1 text-sm font-medium">{status?.generalDetails?.utmMedium || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">UTM Campaign</div>
                <div className="mt-1 text-sm font-medium">{status?.generalDetails?.utmCampaign || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">UTM Content</div>
                <div className="mt-1 text-sm font-medium">{status?.generalDetails?.utmContent || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-mute">UTM Term</div>
                <div className="mt-1 text-sm font-medium">{status?.generalDetails?.utmTerm || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="text-sm font-semibold">Next steps</div>
            <ul className="mt-3 space-y-2 text-sm text-mute">
              <li>Book your time with the correct Calendly link.</li>
              <li>Reschedule or cancel with the link from your invitee.</li>
              <li>We’ll sync any updates back into ActiveCampaign.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={!status}>
                Book now
              </button>
              {status?.rescheduleUrl ? (
                <a className="btn btn-ghost" href={status.rescheduleUrl} target="_blank" rel="noreferrer">
                  Reschedule
                </a>
              ) : (
                <button className="btn btn-ghost" disabled>
                  Reschedule
                </button>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">Links</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-mute">Invitee URL</span>
                <span className="font-medium">{booking.inviteeUri || status?.rescheduleUrl || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mute">Event URL</span>
                <span className="font-medium">{booking.eventUri || status?.calendlyEventUri || "—"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

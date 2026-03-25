import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE from "../lib/apiBase";
import ContactUsModal from "../components/ContactUsModal";
import { getAuthEmail, clearAuth } from "../lib/auth";

const logoImageUrl = new URL("../assets/UR LOGO dark.png", import.meta.url).href;

export default function My() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [logoDance, setLogoDance] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setStatus(null);
      setForm({});
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/register");
          return;
        }
        const emailParam = getAuthEmail();
        const url = emailParam ? `${API_BASE}/auth/me?email=${encodeURIComponent(emailParam)}` : `${API_BASE}/auth/me`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) {
          clearAuth();
          navigate("/register");
          return;
        }
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError("We could not load your profile yet.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [location.key]);

  const refreshProfile = async () => {
    setLoading(true);
    setError("");
    setStatus(null);
    setForm({});
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/register");
      return;
    }
    try {
      const emailParam = getAuthEmail();
      const url = emailParam ? `${API_BASE}/auth/me?email=${encodeURIComponent(emailParam)}` : `${API_BASE}/auth/me`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        clearAuth();
        navigate("/register");
        return;
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError("We could not load your profile yet.");
    } finally {
      setLoading(false);
    }
  };

  const contact = status?.contact || {};
  const general = status?.generalDetails || {};
  const booking = status?.bookingDetails || {};
  const startTime = status?.startTime || booking.startTime || null;
  const endTime = status?.endTime || booking.endTime || null;
  const eventName = status?.eventName || booking.eventName || null;
  const bookingLocation = status?.location || booking.location || null;
  const timezone = status?.timezone || booking.timezone || null;
  const calendlyStatus = status?.calendlyStatus || booking.status || null;

  const formattedStart = useMemo(() => (startTime ? new Date(startTime).toLocaleString() : null), [startTime]);
  const formattedEnd = useMemo(() => (endTime ? new Date(endTime).toLocaleString() : null), [endTime]);
  const isUpcoming = useMemo(() => (endTime ? new Date(endTime).getTime() > Date.now() : false), [endTime]);

  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    setForm({
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      phone: contact.phone || "",
      leadSource: general.leadSource || "",
      preferredLanguage: general.preferredLanguage || "",
      dateOfBirth: general.dateOfBirth || "",
      gender: general.gender || "",
      streetAddress: general.streetAddress || "",
      city: general.city || "",
      stateProvince: general.stateProvince || "",
      zipPostalCode: general.zipPostalCode || "",
      jobTitle: general.jobTitle || "",
      companyName: general.companyName || "",
      interestsHobbies: general.interestsHobbies || "",
      preferredCommunicationMethod: general.preferredCommunicationMethod || "",
      linkedInProfile: general.linkedInProfile || "",
      twitterXHandle: general.twitterXHandle || "",
      instagramHandle: general.instagramHandle || "",
      preferredDay: general.preferredDay || "",
      preferredTime: general.preferredTime || "",
      reasonsForSignup: general.reasonsForSignup || "",
      reasonsForJoining: general.reasonsForJoining || "",
      urEventDateTime: general.urEventDateTime || "",
      trevorExample: general.trevorExample || "",
      eventDay: general.eventDay || "",
    });
  }, [status]);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsSaving(true);
    setSaveNotice("");
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to save profile.");
      }
      const data = await res.json();
      setStatus(data);
      setSaveNotice("Saved!");
      setIsEditing(false);
    } catch (err) {
      setSaveNotice("Save failed. Try again.");
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveNotice(""), 2000);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                onClick={() => {
                  setLogoDance(true);
                  window.setTimeout(() => setLogoDance(false), 900);
                }}
                className="group flex items-center focus:outline-none"
                aria-label="The Unscripted Room logo"
              >
                <img
                  src={logoImageUrl}
                  alt="The Unscripted Room logo"
                  className={`h-10 w-auto transition duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,0,0,0.25)] sm:h-12 ${
                    logoDance ? "logo-dance" : ""
                  }`}
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost" onClick={() => setIsContactOpen(true)}>
                Contact Us
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="mt-1 text-sm text-mute">Your Profile contact + booking details.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="text-sm text-mute">
              {saveNotice ? saveNotice : "Review your profile and booking details below."}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <button className="btn btn-primary" onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save updates"}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit profile
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={() => {
              clearAuth();
              navigate("/register");
            }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      {loading && <div className="mt-6 text-sm text-mute">Loading your details...</div>}
      {error && <div className="mt-6 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Contact details</div>
                  <div className="mt-1 text-xs text-mute">Primary identity for your account.</div>
                </div>
                <div className="rounded-full bg-[#f4ece1] px-3 py-1 text-xs font-semibold text-black">
                  Contact #{contact.id || "—"}
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-mute">Name</div>
                  {isEditing ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="First name"
                        value={form.firstName || ""}
                        onChange={(e) => updateField("firstName", e.target.value)}
                      />
                      <input
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Last name"
                        value={form.lastName || ""}
                        onChange={(e) => updateField("lastName", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-sm font-medium">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-mute">Email</div>
                  <div className="mt-1 text-sm font-medium">{contact.email || "—"}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-mute">Phone</div>
                  {isEditing ? (
                    <input
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Phone"
                      value={form.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  ) : (
                    <div className="mt-1 text-sm font-medium">{contact.phone || "—"}</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Upcoming booking</div>
                  <div className="mt-1 text-xs text-mute">Next scheduled session.</div>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                  {calendlyStatus || "—"}
                </span>
              </div>
              {eventName ? (
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-mute">Event</div>
                    <div className="mt-1 font-medium">{eventName}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-mute">Start</div>
                    <div className="mt-1 font-medium">{formattedStart || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-mute">End</div>
                    <div className="mt-1 font-medium">{formattedEnd || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-mute">Timezone</div>
                    <div className="mt-1 font-medium">{timezone || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-mute">Location</div>
                    <div className="mt-1 font-medium whitespace-pre-line">{bookingLocation || "—"}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-mute">No booking details yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-semibold text-black">Past booking</div>
              {eventName && !isUpcoming ? (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="font-medium">{eventName}</div>
                  <div className="text-mute">{formattedStart}</div>
                  <div className="text-mute">{bookingLocation || "—"}</div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-mute">No past bookings yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes logoDance {
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-2px); }
          50% { transform: rotate(8deg) translateY(2px); }
          75% { transform: rotate(-4deg) translateY(-1px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        .logo-dance {
          animation: logoDance 0.8s ease-in-out;
        }
      `}</style>
      <ContactUsModal isOpen={isContactOpen} initialMode="contact" onClose={() => setIsContactOpen(false)} />
    </section>
  );
}

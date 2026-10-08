import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Season Two guest invitation. Rules:
// - appears after 15 seconds on the site (counted across page views in this browser session)
// - at most once per session, never on the application, Join a Conversation or Guest Intake pages
// - waits while the visitor is filling in a form
// - closing it hides it for 7 days; clicking the CTA hides it for 30 days
// It collects nothing; the CTA just links to the existing application.
const DELAY_MS = 15_000;
const RETRY_MS = 3_000;
const FORM_IDLE_MS = 20_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DISMISS_DAYS = 7;
const CTA_DAYS = 30;
const EXCLUDED_PATHS = ["/apply", "/join-a-conversation", "/guest-intake"];

const KEY_HIDE_UNTIL = "ur_s2_invite_hide_until"; // localStorage, epoch ms
const KEY_SHOWN = "ur_s2_invite_shown"; // sessionStorage
const KEY_SESSION_START = "ur_session_start"; // sessionStorage, epoch ms

function read(storage: "local" | "session", key: string) {
  try {
    return (storage === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(storage: "local" | "session", key: string, value: string) {
  try {
    (storage === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.): worst case the invite can show again next session.
  }
}

const isFormField = (el: Element | null) =>
  !!el && (el.matches("input, textarea, select") || (el as HTMLElement).isContentEditable);

export function SeasonTwoInvite() {
  const [open, setOpen] = React.useState(false);
  const ctaClicked = React.useRef(false);
  const restoreFocus = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (read("session", KEY_SHOWN)) return;
    if (Number(read("local", KEY_HIDE_UNTIL) || 0) > Date.now()) return;

    let start = Number(read("session", KEY_SESSION_START) || 0);
    if (!start) {
      start = Date.now();
      write("session", KEY_SESSION_START, String(start));
    }

    let lastFormActivity = 0;
    const onFormActivity = (event: Event) => {
      if (isFormField(event.target as Element)) lastFormActivity = Date.now();
    };
    document.addEventListener("input", onFormActivity, true);
    document.addEventListener("focusin", onFormActivity, true);

    let timer: ReturnType<typeof setTimeout>;
    const tryShow = () => {
      const path = window.location.pathname.replace(/\/$/, "") || "/";
      const busyWithForm =
        isFormField(document.activeElement) || Date.now() - lastFormActivity < FORM_IDLE_MS;
      if (EXCLUDED_PATHS.includes(path) || busyWithForm || document.visibilityState !== "visible") {
        timer = setTimeout(tryShow, RETRY_MS);
        return;
      }
      restoreFocus.current = document.activeElement as HTMLElement | null;
      write("session", KEY_SHOWN, "1");
      setOpen(true);
    };
    timer = setTimeout(tryShow, Math.max(0, start + DELAY_MS - Date.now()));

    return () => {
      clearTimeout(timer);
      document.removeEventListener("input", onFormActivity, true);
      document.removeEventListener("focusin", onFormActivity, true);
    };
  }, []);

  const onOpenChange = (next: boolean) => {
    if (next) return;
    const days = ctaClicked.current ? CTA_DAYS : DISMISS_DAYS;
    write("local", KEY_HIDE_UNTIL, String(Date.now() + days * DAY_MS));
    setOpen(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/60" />
        <DialogPrimitive.Content
          aria-describedby="s2-invite-copy"
          onCloseAutoFocus={(event) => {
            const el = restoreFocus.current;
            if (el && el !== document.body && document.contains(el)) {
              event.preventDefault();
              el.focus();
            }
          }}
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-deep-purple px-7 pb-8 pt-12 text-warm-white shadow-[0_24px_60px_rgba(0,0,0,.35)] sm:px-10 sm:pb-10 sm:pt-14"
        >
          <DialogPrimitive.Close
            aria-label="Close invitation"
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center text-warm-white/80 transition-colors hover:text-warm-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </DialogPrimitive.Close>
          <p className="rule-label text-warm-white/70">The Unscripted Room · Season Two</p>
          <DialogPrimitive.Title asChild>
            <h2 className="mt-5 text-warm-white">There&rsquo;s a seat at the table for you.</h2>
          </DialogPrimitive.Title>
          <p id="s2-invite-copy" className="mt-5 text-lg text-warm-white/85">
            We&rsquo;re inviting new voices to join us for Season Two. Have a perspective worth
            sharing? We&rsquo;d like to hear from you.
          </p>
          <Button asChild variant="apply" size="lg" className="mt-8 w-full sm:w-auto">
            <Link
              to="/apply"
              onClick={() => {
                ctaClicked.current = true;
                onOpenChange(false);
              }}
            >
              Join a Conversation
            </Link>
          </Button>
          <p className="mt-8 border-t border-warm-white/15 pt-5 text-sm text-warm-white/60">
            Real people. Different perspectives. Unscripted conversations.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

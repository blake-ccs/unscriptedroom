const CALENDLY_WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";
const REDIRECT_URL = `${window.location.origin}/my`;
const BASE_CALENDLY_URL = "https://calendly.com/theunscriptedroom-ccs/unscripted-room";

const ensureCalendlyAssets = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as any).Calendly) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${CALENDLY_WIDGET_SRC}"]`
    );
    if (!document.querySelector(`link[href="${CALENDLY_WIDGET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDLY_WIDGET_CSS;
      document.head.appendChild(link);
    }

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Calendly script failed to load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = CALENDLY_WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly script failed to load"));
    document.body.appendChild(script);
  });

const withRedirect = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    if (!parsed.searchParams.get("redirect_uri")) {
      parsed.searchParams.set("redirect_uri", REDIRECT_URL);
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

export const openCalendlyPopup = async (urlOrEvent?: unknown) => {
  const rawUrl = typeof urlOrEvent === "string" && urlOrEvent ? urlOrEvent : BASE_CALENDLY_URL;
  const url = withRedirect(rawUrl);
  await ensureCalendlyAssets();
  if ((window as any).Calendly?.initPopupWidget) {
    (window as any).Calendly.initPopupWidget({ url });
  }
};

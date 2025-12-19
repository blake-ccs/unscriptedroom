export function setPendingPurchase(priceEnvKeys: string[]) {
    localStorage.setItem("pending_purchase", JSON.stringify(priceEnvKeys));
  }
  export function getPendingPurchase(): string[] {
    try { return JSON.parse(localStorage.getItem("pending_purchase") || "[]"); } catch { return []; }
  }
  export function clearPendingPurchase() {
    localStorage.removeItem("pending_purchase");
  }
  export function setActiveTeamId(id: number) {
    localStorage.setItem("active_team_id", String(id));
  }
  export function getActiveTeamId(): number | null {
    const v = localStorage.getItem("active_team_id");
    return v ? Number(v) : null;
  }
  
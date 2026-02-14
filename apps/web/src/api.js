const API = import.meta.env.VITE_API_BASE;

export async function getIncidents() {
  const r = await fetch(`${API}/incidents`);
  return r.json();
}

export async function getTrends(id) {
  const r = await fetch(`${API}/incidents/${id}/trends`);
  return r.json();
}

export async function getClusters(id) {
  const r = await fetch(`${API}/incidents/${id}/clusters`);
  return r.json();
}

export async function simulateAlert(scenario) {
  const r = await fetch(`${API}/simulate-alert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenario ? { scenario } : {}),
  });

  const text = await r.text();
  if (!r.ok) throw new Error(`simulate-alert failed: ${r.status} ${text}`);
  return JSON.parse(text);
}

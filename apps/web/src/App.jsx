import { useEffect, useState } from "react";
import "./styles.css";
import IncidentPanel from "./components/IncidentPanel";
import ChartsGrid from "./components/ChartsGrid";
import { getIncidents, getTrends, getClusters, simulateAlert } from "./api";
import Login from "./Login";

function toHHMM(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "??:??";
  return d.toISOString().slice(11, 16);
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [trends, setTrends] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Restore login from localStorage
  useEffect(() => {
    if (localStorage.getItem("ai_logged_in") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  async function refreshIncidents(selectNewest = false) {
    const list = (await getIncidents()) || [];
    setIncidents(list);

    if (selectNewest && list[0]?.id) {
      setSelectedId(list[0].id);
      return list[0].id;
    }

    if (!selectedId && list[0]?.id) {
      setSelectedId(list[0].id);
      return list[0].id;
    }

    return selectedId || list[0]?.id || "";
  }

  async function refreshIncidentData(id) {
    if (!id) {
      setTrends([]);
      setClusters([]);
      return;
    }

    const [tr, cl] = await Promise.all([getTrends(id), getClusters(id)]);
    setTrends((tr || []).map((x) => ({ ...x, t: toHHMM(x.ts) })));
    setClusters(cl || []);
  }

  useEffect(() => {
    if (!isLoggedIn) return;

    (async () => {
      const id = await refreshIncidents(true);
      await refreshIncidentData(id);
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    refreshIncidentData(selectedId);
  }, [selectedId, isLoggedIn]);

  async function handleSimulate(scenario) {
    try {
      setLoading(true);
      await simulateAlert(scenario);
      const newestId = await refreshIncidents(true);
      await refreshIncidentData(newestId);
    } catch (e) {
      console.error(e);
      alert("Simulate failed.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ SAFE conditional render AFTER hooks
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem("ai_logged_in", "true");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <h2>AI Incident Intelligence Platform — MVP</h2>
        <button 
          className="logout-btn"
          onClick={() => {
          localStorage.removeItem("ai_logged_in");
          setIsLoggedIn(false);
        }}>Log Out</button>
      </header>

      <div className="layout">
        <IncidentPanel
          incidents={incidents}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSimulate={handleSimulate}
          loading={loading}
          search={search}
          setSearch={setSearch}
        />
        <ChartsGrid trends={trends} clusters={clusters} />
      </div>
    </div>
  );
}

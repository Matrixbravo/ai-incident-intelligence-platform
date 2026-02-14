export default function IncidentPanel({
  incidents = [],
  selectedId,
  onSelect,
  onSimulate,
  loading,
  search,
  setSearch,
}) {
  return (
    <aside className="panel">
      <div className="panel__header">
        <div className="panel__title">Incidents</div>

        <button
          className="btn btn--primary"
          onClick={() => onSimulate("mixed")}
          disabled={loading}
          type="button"
        >
          {loading ? "Running AI Analysis..." : "Simulate Alert (Run AI Analysis)"}
        </button>

        {/* Scenario buttons */}
        <div className="scenarioRow">
          {["timeout", "auth", "throttle", "mixed"].map((s) => (
            <button
              key={s}
              className="btn btn--chip"
              onClick={() => onSimulate(s)}
              disabled={loading}
              type="button"
              title={`Simulate ${s} scenario`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          className="input"
          placeholder="Search incidents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Incident list */}
      <div className="panel__list">
        {incidents
          .filter((x) => {
            const q = (search || "").trim().toLowerCase();
            if (!q) return true;
            const hay = `${x.id} ${x.service} ${x.status} ${x.severity} ${x.scenario || ""}`.toLowerCase();
            return hay.includes(q);
          })
          .map((x) => (
            <button
              key={x.id}
              className={`incident ${x.id === selectedId ? "incident--active" : ""}`}
              onClick={() => onSelect(x.id)}
              type="button"
            >
              <div className="incident__top">
                <div className="incident__id">{x.id}</div>
                <div className="badge">{x.severity}</div>
              </div>

              <div className="incident__meta">{x.service}</div>

              <div className="mutedRow">
                <span>{x.status}</span>
                <span className="dot">•</span>
                <span className="cap">{x.scenario || "mixed"}</span>
              </div>
            </button>
          ))}

        {incidents.length === 0 && (
          <div style={{ opacity: 0.8, fontSize: 13, marginTop: 10 }}>
            No incidents found. Make sure API is running on port 4000.
          </div>
        )}
      </div>
    </aside>
  );
}

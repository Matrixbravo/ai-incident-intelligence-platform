import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import Card from "./Card";

export default function ChartsGrid({ trends, clusters }) {
  const pieData = useMemo(() => {
    const map = {};
    for (const c of clusters || []) map[c.category] = (map[c.category] || 0) + c.count;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clusters]);

  return (
    <div className="grid2x2">
      <Card title="Error Trend (errors/min)">
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="errors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Top Error Clusters">
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={clusters}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clusterId" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Probable Cause Categories">
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={95} label />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Cluster Details">
        <div className="detailsScrollFill">
          {(clusters || []).map((c) => (
            <div key={c.clusterId} className="detailCard">
              <div className="detailTop">
                <div>
                  <b>{c.clusterId}</b> · {c.category}
                </div>
                <div className="muted">
                  count: <b>{c.count}</b> · conf: <b>{c.confidence}</b>
                </div>
              </div>
              <div className="detailLine">
                <b>Signature:</b> {c.signature}
              </div>
              <div className="detailLine">
                <b>Sample:</b> {c.sample}
              </div>
            </div>
          ))}
          {(clusters || []).length === 0 && <div className="muted">No clusters for this incident.</div>}
        </div>
      </Card>
    </div>
  );
}

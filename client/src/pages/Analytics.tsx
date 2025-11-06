import { useState, useEffect } from "react";
import { TrendingUp, Radio, AlertTriangle, Target, Loader2 } from "lucide-react";
import KPICard from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { analyticsAPI } from "@/lib/api";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [threatsPerDay, setThreatsPerDay] = useState<any[]>([]);
  const [threatTypeDistribution, setThreatTypeDistribution] = useState<any[]>([]);
  const [activeSources, setActiveSources] = useState<any[]>([]);
  const [severityTrends, setSeverityTrends] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, threatsRes, distributionRes, sourcesRes, trendsRes] = await Promise.all([
          analyticsAPI.getStats(),
          analyticsAPI.getThreatsPerDay(),
          analyticsAPI.getThreatTypeDistribution(),
          analyticsAPI.getActiveSources(),
          analyticsAPI.getSeverityTrends()
        ]);

        setAnalyticsStats(statsRes.data);
        setThreatsPerDay(threatsRes.data);
        setThreatTypeDistribution(distributionRes.data);
        setActiveSources(sourcesRes.data);
        setSeverityTrends(trendsRes.data);
      } catch (err) {
        setError("Failed to load analytics data. Please try again later.");
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-center">Error Loading Data</h2>
          <p className="text-muted-foreground text-center">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Analytics</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">
          Comprehensive threat intelligence analytics and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Avg Daily Threats"
          value={analyticsStats?.avgDailyThreats?.value || "0"}
          subtitle={analyticsStats?.avgDailyThreats?.change || ""}
          icon={TrendingUp}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Active Sources"
          value={analyticsStats?.activeSources?.value || "0"}
          subtitle={analyticsStats?.activeSources?.change || ""}
          icon={Radio}
          iconColor="text-green-500"
        />
        <KPICard
          title="Critical Alerts"
          value={analyticsStats?.criticalAlerts?.value || "0"}
          subtitle={analyticsStats?.criticalAlerts?.change || ""}
          icon={AlertTriangle}
          iconColor="text-red-500"
        />
        <KPICard
          title="Detection Rate"
          value={analyticsStats?.detectionRate?.value || "0"}
          subtitle={analyticsStats?.detectionRate?.change || ""}
          icon={Target}
          iconColor="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-chart-title-threats-per-day">
            Threats Per Day (8 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={threatsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-chart-title-threat-type">
            Threat Type Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={threatTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {threatTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-chart-title-active-sources">
            Most Active Sources
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeSources} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-chart-title-severity-trends">
            Severity Trends (4 Weeks)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--popover))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Legend />
              <Bar dataKey="Critical" stackId="a" fill="#ef4444" />
              <Bar dataKey="High" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Medium" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Low" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

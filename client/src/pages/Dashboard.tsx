import { useState, useEffect } from "react";
import { Activity, Radio, AlertTriangle, Globe, Loader2, RefreshCw } from "lucide-react";
import KPICard from "@/components/KPICard";
import DataTable from "@/components/DataTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardAPI, threatIntelAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentThreats, setRecentThreats] = useState<any[]>([]);
  const [threatTrends, setThreatTrends] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, threatsRes, trendsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentThreats(),
        dashboardAPI.getThreatTrends()
      ]);

      setStats(statsRes.data);
      setRecentThreats(threatsRes.data);
      setThreatTrends(trendsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast({
        title: "Refreshing Feeds",
        description: "Fetching latest threat intelligence data...",
      });

      await threatIntelAPI.refresh();
      
      // Fetch updated dashboard data
      await fetchDashboardData();

      toast({
        title: "Feeds Refreshed",
        description: "Latest threat intelligence data has been loaded successfully.",
      });
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh threat feeds. Please try again.",
        variant: "destructive",
      });
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const threatColumns = [
    { key: "ioc", label: "IOC", width: "30%" },
    { key: "type", label: "Type", width: "20%" },
    { key: "severity", label: "Severity", width: "20%" },
    { key: "time", label: "Time", width: "30%" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Overview of your cyber threat intelligence
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          data-testid="button-refresh-feeds"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Feeds'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total IOCs"
          value={stats?.totalIOCs?.value?.toLocaleString() || "0"}
          subtitle={stats?.totalIOCs?.change || ""}
          icon={Activity}
          iconColor="text-blue-500"
        />
        <KPICard
          title="New Feeds"
          value={stats?.newFeeds?.value || "0"}
          subtitle={stats?.newFeeds?.change || ""}
          icon={Radio}
          iconColor="text-green-500"
        />
        <KPICard
          title="Critical CVEs"
          value={stats?.criticalCVEs?.value || "0"}
          subtitle={stats?.criticalCVEs?.change || ""}
          icon={AlertTriangle}
          iconColor="text-amber-500"
        />
        <KPICard
          title="Phishing Domains"
          value={stats?.phishingDomains?.value || "0"}
          subtitle={stats?.phishingDomains?.change || ""}
          icon={Globe}
          iconColor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-section-title-recent-threats">
            Recent Threats
          </h2>
          <DataTable columns={threatColumns} data={recentThreats} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-section-title-threat-trends">
            Threat Trends (7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={threatTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
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
      </div>
    </div>
  );
}

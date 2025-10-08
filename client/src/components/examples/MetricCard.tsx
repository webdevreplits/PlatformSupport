import { MetricCard } from "../MetricCard";
import { TrendingUp, Users, DollarSign } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-950 to-purple-950 min-h-[300px]">
      <MetricCard
        title="Total Revenue"
        value="$45.2K"
        subtitle="Last 30 days"
        icon={DollarSign}
        gradient="blue"
        badge={{ text: "On Track", variant: "success" }}
        trend={{ value: "+12%", isPositive: true }}
      />
      <MetricCard
        title="Active Users"
        value="1,234"
        subtitle="Current online"
        icon={Users}
        gradient="mint"
        actionButton={{ text: "View All", onClick: () => console.log("View clicked") }}
      />
      <MetricCard
        title="Conversion Rate"
        value="3.24%"
        icon={TrendingUp}
        gradient="coral"
        badge={{ text: "Needs Review", variant: "warning" }}
        trend={{ value: "-2%", isPositive: false }}
      />
    </div>
  );
}

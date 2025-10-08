import { MiniAreaChart } from "../MiniAreaChart";

export default function MiniAreaChartExample() {
  const data1 = [30, 45, 35, 60, 55, 70, 65, 80];
  const data2 = [50, 40, 60, 45, 70, 55, 75, 65];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gradient-to-br from-blue-950 to-purple-950">
      <div className="h-32">
        <MiniAreaChart data={data1} color="stroke-chart-1 fill-chart-1" />
      </div>
      <div className="h-32">
        <MiniAreaChart data={data2} color="stroke-chart-2 fill-chart-2" />
      </div>
    </div>
  );
}

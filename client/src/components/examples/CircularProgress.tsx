import { CircularProgress } from "../CircularProgress";

export default function CircularProgressExample() {
  return (
    <div className="flex items-center justify-center gap-8 p-8 bg-gradient-to-br from-blue-950 to-purple-950 min-h-[300px]">
      <CircularProgress value={75} color="stroke-chart-1" />
      <CircularProgress value={45} color="stroke-chart-2" />
      <CircularProgress value={90} color="stroke-chart-3" />
    </div>
  );
}

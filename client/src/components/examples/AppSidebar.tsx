import { AppSidebar } from "../AppSidebar";

export default function AppSidebarExample() {
  return (
    <div className="bg-gradient-to-br from-blue-950 to-purple-950 h-screen">
      <AppSidebar />
      <div className="ml-16 p-8">
        <h1 className="text-2xl font-bold text-white">Main Content Area</h1>
        <p className="text-white/70 mt-2">Sidebar is on the left</p>
      </div>
    </div>
  );
}

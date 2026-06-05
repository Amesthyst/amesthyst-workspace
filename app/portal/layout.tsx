import Sidebar from "@/components/portal/Sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        <header className="h-16 border-b flex items-center px-6">
          <h2 className="font-medium">
            Amesthyst Workspace
          </h2>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-muted/30">
          {children}
        </main>

      </div>
    </div>
  );
}
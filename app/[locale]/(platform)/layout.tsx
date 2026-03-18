import { DashboardWorkspaceProvider } from "@/features/dashboard/providers/DashboardWorkspaceProvider";
import { AppShell } from "@/features/navigation/components/AppShell";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardWorkspaceProvider>
      <AppShell>{children}</AppShell>
    </DashboardWorkspaceProvider>
  );
}

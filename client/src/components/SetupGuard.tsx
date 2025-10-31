import { useQuery } from '@tanstack/react-query';
import SetupWizard from '@/pages/SetupWizard';
import UnlockPrompt from './UnlockPrompt';
import { Loader2 } from 'lucide-react';

interface SetupStatus {
  setupCompleted: boolean;
  databaseConfigured: boolean;
  locked: boolean;
  requiresSetup: boolean;
}

export default function SetupGuard({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading } = useQuery<SetupStatus>({
    queryKey: ['/api/bootstrap/status'],
    retry: false,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status?.locked) {
    return <UnlockPrompt />;
  }

  if (status?.requiresSetup) {
    return <SetupWizard />;
  }

  return <>{children}</>;
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UnlockPrompt() {
  const [passphrase, setPassphrase] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const { toast } = useToast();

  const handleUnlock = async () => {
    if (!passphrase) {
      toast({
        title: 'Error',
        description: 'Please enter your encryption passphrase',
        variant: 'destructive'
      });
      return;
    }

    setUnlocking(true);
    try {
      const response = await fetch('/api/bootstrap/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptionPassphrase: passphrase })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application unlocked successfully'
        });
        
        // Reload to continue
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: 'Unlock Failed',
          description: data.message || data.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md" data-testid="card-unlock-prompt">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Application Locked</CardTitle>
              <CardDescription>Enter your encryption passphrase to continue</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The application is locked because the encryption passphrase is not available in the environment. 
              Enter the passphrase you set during initial setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="passphrase">Encryption Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              placeholder="Enter your passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock();
                }
              }}
              disabled={unlocking}
              data-testid="input-passphrase"
              autoFocus
            />
          </div>

          <Alert variant="default" className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>For permanent unlock:</strong> Add ENCRYPTION_PASSPHRASE to your Databricks Apps environment variables and restart the app.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleUnlock}
            disabled={unlocking || !passphrase}
            className="w-full"
            data-testid="button-unlock"
          >
            {unlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unlock Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

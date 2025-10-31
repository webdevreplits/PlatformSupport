import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, Database, User, Key, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  // Form data
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [databaseValid, setDatabaseValid] = useState<boolean | null>(null);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('Default Organization');
  const [sessionSecret, setSessionSecret] = useState('');
  const [databricksHost, setDatabricksHost] = useState('');
  const [databricksToken, setDatabricksToken] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const validateDatabase = async () => {
    if (!databaseUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a database URL',
        variant: 'destructive'
      });
      return;
    }

    setValidating(true);
    try {
      const response = await fetch('/api/bootstrap/validate-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl })
      });

      const data = await response.json();
      
      if (data.valid) {
        setDatabaseValid(true);
        toast({
          title: 'Success',
          description: 'Database connection validated successfully'
        });
      } else {
        setDatabaseValid(false);
        toast({
          title: 'Connection Failed',
          description: data.details || 'Could not connect to database',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setDatabaseValid(false);
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleComplete = async () => {
    if (!databaseUrl || !encryptionPassphrase || !adminEmail || !adminPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bootstrap/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseUrl,
          encryptionPassphrase,
          sessionSecret: sessionSecret || undefined,
          databricksHost: databricksHost || undefined,
          databricksToken: databricksToken || undefined,
          openaiApiKey: openaiApiKey || undefined,
          adminEmail,
          adminPassword,
          organizationName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show important post-setup instructions
        alert(`Setup Complete!\n\nIMPORTANT: To persist your configuration after server restarts, add this environment variable to your Databricks Apps:\n\nName: ENCRYPTION_PASSPHRASE\nValue: ${encryptionPassphrase}\n\nWithout this, the app won't be able to decrypt your database credentials after a restart.\n\nClick OK to continue to the application.`);
        
        toast({
          title: 'Setup Complete!',
          description: 'Redirecting to application...'
        });
        
        // Reload to apply changes
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        if (data.requiresMigration) {
          toast({
            title: 'Database Setup Required',
            description: data.message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Setup Failed',
            description: data.details || data.error,
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSessionSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setSessionSecret(secret);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl" data-testid="card-setup-wizard">
        <CardHeader>
          <CardTitle className="text-2xl">Application Setup</CardTitle>
          <CardDescription>
            Step {step} of 4: Configure your application
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Database className="h-5 w-5" />
                Database Configuration
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need a PostgreSQL database. We recommend <strong>Neon</strong> (https://neon.tech) for quick setup.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL *</Label>
                <Input
                  id="database-url"
                  type="text"
                  placeholder="postgresql://user:password@host:5432/database?sslmode=require"
                  value={databaseUrl}
                  onChange={(e) => {
                    setDatabaseUrl(e.target.value);
                    setDatabaseValid(null);
                  }}
                  data-testid="input-database-url"
                />
                <p className="text-sm text-muted-foreground">
                  Format: postgresql://username:password@host:port/database
                </p>
              </div>

              {databaseValid === true && (
                <Alert className="border-green-500 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Database connection verified</AlertDescription>
                </Alert>
              )}

              {databaseValid === false && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Database connection failed. Please check your URL.</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={validateDatabase} 
                disabled={validating || !databaseUrl}
                variant="outline"
                data-testid="button-validate-database"
              >
                {validating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Admin Account
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  data-testid="input-org-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  data-testid="input-admin-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password *</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  data-testid="input-admin-password"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Settings className="h-5 w-5" />
                AI Configuration (Optional)
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Configure AI features for RCA analysis and assistance. You can skip this and configure later in Settings.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="databricks-host">Databricks Host</Label>
                <Input
                  id="databricks-host"
                  placeholder="https://your-workspace.cloud.databricks.com"
                  value={databricksHost}
                  onChange={(e) => setDatabricksHost(e.target.value)}
                  data-testid="input-databricks-host"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="databricks-token">Databricks Token</Label>
                <Input
                  id="databricks-token"
                  type="password"
                  value={databricksToken}
                  onChange={(e) => setDatabricksToken(e.target.value)}
                  data-testid="input-databricks-token"
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">or</div>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  data-testid="input-openai-key"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Key className="h-5 w-5" />
                Security Configuration
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The encryption passphrase is used to secure your database credentials and API keys. Keep it safe!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="encryption-passphrase">Encryption Passphrase *</Label>
                <Input
                  id="encryption-passphrase"
                  type="password"
                  placeholder="Enter a strong passphrase"
                  value={encryptionPassphrase}
                  onChange={(e) => setEncryptionPassphrase(e.target.value)}
                  data-testid="input-encryption-passphrase"
                />
                <p className="text-sm text-muted-foreground">
                  At least 12 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-secret">Session Secret (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="session-secret"
                    type="password"
                    value={sessionSecret}
                    onChange={(e) => setSessionSecret(e.target.value)}
                    data-testid="input-session-secret"
                  />
                  <Button
                    onClick={generateSessionSecret}
                    variant="outline"
                    data-testid="button-generate-secret"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to auto-generate
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            data-testid="button-previous"
          >
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && databaseValid !== true}
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              data-testid="button-complete-setup"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

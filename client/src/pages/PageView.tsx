import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { PageViewer } from "@/components/PageViewer";
import { useAuth } from "@/contexts/AuthContext";
import type { Page } from "@shared/schema";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Footer } from "@/components/Footer";

export default function PageView() {
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  const params = useParams();
  const pageId = params.id ? parseInt(params.id) : null;
  const { user } = useAuth();

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ["/api/pages", pageId],
    enabled: Boolean(pageId),
  });

  const canEdit = user?.role === "admin" || user?.role === "editor";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <div className="relative z-10">
        <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />
        <main className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/pages">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{page.name}</h1>
                <Badge 
                  variant={page.status === "published" ? "default" : page.status === "draft" ? "secondary" : "outline"}
                  data-testid="badge-page-status"
                >
                  {page.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                /{page.slug} • Version {page.version}
              </p>
            </div>
          </div>
          {canEdit && (
            <Link href={`/pages/${page.id}/edit`}>
              <Button data-testid="button-edit-page">
                <Edit className="mr-2 h-4 w-4" />
                Edit Page
              </Button>
            </Link>
          )}
        </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <PageViewer page={page} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

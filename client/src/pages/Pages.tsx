import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Link } from "wouter";
import type { Page } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Pages() {
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: number) => {
      await apiRequest("DELETE", `/api/pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page",
        variant: "destructive",
      });
    },
  });

  const canEdit = user?.role === "admin" || user?.role === "editor";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div>
              <h1 className="text-3xl font-bold">Pages</h1>
              <p className="text-muted-foreground mt-1">Manage your application pages</p>
            </div>
          {canEdit && (
            <Link href="/pages/new">
              <Button data-testid="button-create-page">
                <Plus className="mr-2 h-4 w-4" />
                Create Page
              </Button>
            </Link>
          )}
        </div>

        {pages && pages.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No pages found</p>
              {canEdit && (
                <Link href="/pages/new">
                  <Button variant="outline" data-testid="button-create-first-page">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first page
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages?.map((page) => (
              <Card key={page.id} className="shadow-sm" data-testid={`card-page-${page.id}`}>
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    <Badge 
                      variant={page.status === "published" ? "default" : page.status === "draft" ? "secondary" : "outline"}
                      data-testid={`badge-status-${page.id}`}
                    >
                      {page.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Slug: /{page.slug} • Version {page.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/pages/${page.id}/view`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-${page.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {canEdit && (
                      <>
                        <Link href={`/pages/${page.id}/edit`}>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${page.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(page.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${page.id}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

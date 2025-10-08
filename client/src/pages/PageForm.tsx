import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Page } from "@shared/schema";

export default function PageForm() {
  const params = useParams();
  const pageId = params.id ? parseInt(params.id) : null;
  const isEdit = Boolean(pageId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: page, isLoading: isLoadingPage } = useQuery<Page>({
    queryKey: ["/api/pages", pageId],
    enabled: isEdit && Boolean(pageId),
  });

  const [formData, setFormData] = useState({
    name: page?.name || "",
    slug: page?.slug || "",
    status: page?.status || "draft",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/pages", {
        ...data,
        layoutJson: { rows: [] },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Success",
        description: "Page created successfully",
      });
      setLocation("/pages");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", `/api/pages/${pageId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
      setLocation("/pages");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleSlugGenerate = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({ ...formData, slug });
  };

  if (isEdit && isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(235,50%,9%)] via-[hsl(240,45%,11%)] to-[hsl(250,40%,12%)] p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/pages">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pages
          </Button>
        </Link>

        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Page" : "Create New Page"}</CardTitle>
            <CardDescription>
              {isEdit ? "Update page details" : "Create a new page for your application"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Page Name</Label>
                <Input
                  id="name"
                  placeholder="My Dashboard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-page-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder="my-dashboard"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    data-testid="input-page-slug"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSlugGenerate}
                    data-testid="button-generate-slug"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  URL: /{formData.slug || "page-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger data-testid="select-page-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-page"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{isEdit ? "Update Page" : "Create Page"}</>
                  )}
                </Button>
                <Link href="/pages">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

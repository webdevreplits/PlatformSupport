import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { WidgetRenderer, type WidgetConfig } from "./widgets/WidgetRegistry";
import { cn } from "@/lib/utils";
import type { Page, Widget } from "@shared/schema";

interface PageViewerProps {
  page: Page;
  className?: string;
}

export function PageViewer({ page, className }: PageViewerProps) {
  const { data: widgets, isLoading } = useQuery<Widget[]>({
    queryKey: ["/api/pages", page.id, "widgets"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const layoutJson = page.layoutJson as {
    rows: Array<{
      id: string;
      columns: Array<{
        id: string;
        width: number;
        widgetId?: string;
      }>;
    }>;
  };

  const widgetMap = new Map<string, Widget>();
  widgets?.forEach((widget) => {
    widgetMap.set(`widget-${widget.id}`, widget);
  });

  if (!layoutJson || !layoutJson.rows || layoutJson.rows.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">This page has no content yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="page-viewer">
      {layoutJson.rows.map((row) => (
        <div key={row.id} className="grid grid-cols-12 gap-4">
          {row.columns.map((column) => {
            const widget = column.widgetId ? widgetMap.get(column.widgetId) : null;
            
            return (
              <div
                key={column.id}
                className={cn(`col-span-${column.width}`)}
                data-testid={`column-${column.id}`}
              >
                {widget ? (
                  <WidgetRenderer
                    widget={{
                      id: String(widget.id),
                      type: widget.type,
                      props: widget.propsJson,
                    }}
                  />
                ) : (
                  <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md">
                    <p className="text-sm text-muted-foreground">Empty</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

import { HeadingWidget } from "./HeadingWidget";
import { TextWidget } from "./TextWidget";
import { ButtonWidget } from "./ButtonWidget";
import { MetricWidget } from "./MetricWidget";

export interface WidgetConfig {
  id: string;
  type: string;
  props: any;
}

interface WidgetRendererProps {
  widget: WidgetConfig;
  className?: string;
}

export function WidgetRenderer({ widget, className }: WidgetRendererProps) {
  switch (widget.type) {
    case "heading":
      return <HeadingWidget {...widget.props} className={className} />;
    case "text":
      return <TextWidget {...widget.props} className={className} />;
    case "button":
      return <ButtonWidget {...widget.props} className={className} />;
    case "metric":
      return <MetricWidget {...widget.props} className={className} />;
    default:
      return (
        <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md">
          <p className="text-sm text-muted-foreground">
            Unknown widget type: {widget.type}
          </p>
        </div>
      );
  }
}

export const widgetTypes = [
  {
    type: "heading",
    label: "Heading",
    icon: "Type",
    defaultProps: {
      text: "Heading",
      level: 2,
      align: "left",
    },
  },
  {
    type: "text",
    label: "Text",
    icon: "AlignLeft",
    defaultProps: {
      content: "This is a text widget",
      size: "base",
      weight: "normal",
      color: "default",
    },
  },
  {
    type: "button",
    label: "Button",
    icon: "SquareMousePointer",
    defaultProps: {
      text: "Click me",
      variant: "default",
      size: "default",
    },
  },
  {
    type: "metric",
    label: "Metric",
    icon: "BarChart3",
    defaultProps: {
      title: "Total Users",
      value: "1,234",
      subtitle: "Active users",
    },
  },
];

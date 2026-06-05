import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

type Props = {
  lead: Lead;
  onClick?: () => void;
  onConvert?: (leadId: string) => void;
};

export default function LeadCard({
  lead,
  onClick,
  onConvert,
}: Props) {
  return (
    <Card
      className="
        p-4
        hover:shadow-lg
        transition-all
        cursor-pointer
        border
      "
    >
      <div
        onClick={onClick}
        className="space-y-3"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">
            {lead.name}
          </h3>

          <Badge
            variant={
              lead.status === "WON"
                ? "default"
                : "secondary"
            }
          >
            {lead.status}
          </Badge>
        </div>

        {/* Email */}
        <p className="text-sm text-muted-foreground break-all">
          {lead.email || "No Email"}
        </p>
      </div>

      {/* Actions */}
      {lead.status === "WON" && (
        <div className="mt-4">
          <Button
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();

              onConvert?.(lead.id);
            }}
          >
            Convert to Contact
          </Button>
        </div>
      )}
    </Card>
  );
}
import { useNavigate } from "react-router-dom";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Play, Edit, Copy, Trash2, CalendarClock, Download } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CUSTOM_REPORTS } from "@/data/reportTemplates";
import { format } from "date-fns";
import { toast } from "sonner";

const VIS_CHIP: Record<string, string> = {
  Private: "bg-muted text-muted-foreground",
  Team: "bg-[hsl(220_85%_94%)] text-[hsl(220_85%_40%)]",
  Tenant: "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
};

export function CustomReportsTable() {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="text-xs">Report Name</TableHead>
            <TableHead className="text-xs">Owner</TableHead>
            <TableHead className="text-xs">Created</TableHead>
            <TableHead className="text-xs">Last Run</TableHead>
            <TableHead className="text-xs">Schedule</TableHead>
            <TableHead className="text-xs">Shared With</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {CUSTOM_REPORTS.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-sm font-medium">
                <div>{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.description}</div>
              </TableCell>
              <TableCell className="text-xs">{r.owner}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{format(new Date(r.createdDate), "PP")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{format(new Date(r.lastRun), "PP")}</TableCell>
              <TableCell className="text-xs">{r.schedule ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={`text-[10px] ${VIS_CHIP[r.sharedWith]}`}>{r.sharedWith}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/reports/view/${r.templateId}`)}>
                      <Play className="mr-2 h-3.5 w-3.5" /> Generate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Edit configuration")}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(`Duplicated "${r.name}"`)}><Copy className="mr-2 h-3.5 w-3.5" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Schedule editor")}><CalendarClock className="mr-2 h-3.5 w-3.5" /> Schedule</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Exported")}><Download className="mr-2 h-3.5 w-3.5" /> Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success(`Deleted "${r.name}"`)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

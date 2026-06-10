import { useNavigate } from "react-router-dom";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Play, Pause, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { SCHEDULED, ScheduleStatus } from "@/data/reportTemplates";
import { format } from "date-fns";
import { toast } from "sonner";

const STATUS_CHIP: Record<ScheduleStatus, string> = {
  Active: "bg-[hsl(140_55%_92%)] text-[hsl(140_55%_30%)]",
  Paused: "bg-[hsl(220_10%_92%)] text-[hsl(220_10%_40%)]",
  Failed: "bg-[hsl(0_75%_94%)] text-[hsl(0_75%_45%)]",
};

export function ScheduledReportsTable() {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="text-xs">Report</TableHead>
            <TableHead className="text-xs">Frequency</TableHead>
            <TableHead className="text-xs">Recipients</TableHead>
            <TableHead className="text-xs">Next Run</TableHead>
            <TableHead className="text-xs">Last Run</TableHead>
            <TableHead className="text-xs">Format</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {SCHEDULED.map((s) => {
            const inactive = s.recipients.filter(r => !r.active);
            return (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-medium">{s.reportName}</TableCell>
                <TableCell className="text-xs">{s.frequency}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-muted/70">
                        {s.recipients.length} recipient{s.recipients.length === 1 ? "" : "s"}
                        {inactive.length > 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="space-y-1">
                        {s.recipients.map((r) => (
                          <div key={r.email} className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${r.active ? "" : "text-destructive"}`}>
                            <span className="truncate">{r.email}</span>
                            {!r.active && <span className="text-[10px] uppercase">Inactive</span>}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(s.nextRun), "PP")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.lastRun ? format(new Date(s.lastRun), "PP") : "—"}</TableCell>
                <TableCell className="text-xs">{s.format}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] ${STATUS_CHIP[s.status]}`}>{s.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/reports/view/${s.templateId}`)}><Play className="mr-2 h-3.5 w-3.5" /> Run Now</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(s.status === "Paused" ? "Resumed" : "Paused")}>
                        <Pause className="mr-2 h-3.5 w-3.5" /> {s.status === "Paused" ? "Resume" : "Pause"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Edit schedule")}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success("Removed schedule")}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

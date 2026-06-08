import { ShieldCheck, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SSOPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">SSO Management</h3>
        </div>
        <Badge variant="outline" className="border-success/40 bg-success/10 text-success">Connected</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-xs text-muted-foreground">Provider</dt><dd className="font-medium">Azure AD</dd></div>
        <div><dt className="text-xs text-muted-foreground">SSO Identifier</dt><dd className="font-mono text-xs">aok-events.onmicrosoft.com</dd></div>
        <div><dt className="text-xs text-muted-foreground">Last Sync</dt><dd className="font-medium">12 minutes ago</dd></div>
        <div><dt className="text-xs text-muted-foreground">Provisioning</dt><dd><Badge variant="secondary">Active</Badge></dd></div>
        <div><dt className="text-xs text-muted-foreground">Auto-Provisioning</dt><dd><Badge variant="secondary">Enabled</Badge></dd></div>
        <div><dt className="text-xs text-muted-foreground">Sync Mode</dt><dd className="inline-flex items-center gap-1 text-xs text-muted-foreground"><RefreshCw className="h-3 w-3" /> Read-only</dd></div>
      </dl>
    </div>
  );
}

import { CAPABILITIES, CAPABILITY_SECTIONS } from "@/data/users";
import { Switch } from "@/components/ui/switch";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({ value, onChange, readOnly }: Props) {
  const toggle = (key: string) => {
    if (readOnly) return;
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  };
  return (
    <div className="space-y-4">
      {CAPABILITY_SECTIONS.map((section) => {
        const caps = CAPABILITIES.filter((c) => c.section === section);
        return (
          <div key={section} className="rounded-xl border border-border bg-card">
            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section}
            </div>
            <div className="divide-y divide-border">
              {caps.map((c) => {
                const on = value.includes(c.key);
                return (
                  <label
                    key={c.key}
                    className="flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors hover:bg-secondary/30"
                  >
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-[11px] text-muted-foreground">{c.key}</div>
                    </div>
                    <Switch checked={on} onCheckedChange={() => toggle(c.key)} disabled={readOnly} />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

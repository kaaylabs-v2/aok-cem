import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_GROUPS, USERS, UserGroup, userFullName } from "@/data/users";
import { NotificationItem } from "@/data/portfolio";
import { ChevronLeft, FolderPlus, Users as UsersIcon, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PermissionMatrix } from "@/components/users/PermissionMatrix";
import { toast } from "sonner";

const UserGroups = () => {
  const [groups, setGroups] = useState<UserGroup[]>(USER_GROUPS);
  const [editing, setEditing] = useState<UserGroup | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [caps, setCaps] = useState<string[]>([]);

  const startCreate = () => { setName(""); setDesc(""); setCaps([]); setCreating(true); };
  const startEdit = (g: UserGroup) => { setName(g.name); setDesc(g.description); setCaps(g.capabilities); setEditing(g); };

  const saveCreate = () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    const ng: UserGroup = { id: "g" + Date.now(), name, description: desc, capabilities: caps, userIds: [] };
    setGroups((g) => [ng, ...g]);
    toast.success(`Group "${name}" created`);
    setCreating(false);
  };
  const saveEdit = () => {
    if (!editing) return;
    setGroups((gs) => gs.map((g) => (g.id === editing.id ? { ...g, name, description: desc, capabilities: caps } : g)));
    toast.success(`Group "${name}" updated`);
    setEditing(null);
  };
  const removeGroup = (g: UserGroup) => {
    setGroups((gs) => gs.filter((x) => x.id !== g.id));
    toast.success(`Group "${g.name}" deleted`);
  };

  const onOpenNotification = (_n: NotificationItem) => {};

  return (
    <AppShell onOpenNotification={onOpenNotification}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1"><Link to="/users" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="h-3 w-3" /> Back to users</Link></div>
            <h1 className="text-2xl font-bold tracking-tight">User Groups</h1>
            <p className="mt-1 text-sm text-muted-foreground">Bundle capabilities for fast onboarding by team or function.</p>
          </div>
          <Button size="sm" onClick={startCreate}><FolderPlus className="mr-1.5 h-4 w-4" /> Create Group</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const members = USERS.filter((u) => u.groupId === g.id);
            return (
              <div key={g.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{g.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => removeGroup(g)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.capabilities.slice(0, 6).map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                  {g.capabilities.length > 6 && <Badge variant="outline" className="text-[10px]">+{g.capabilities.length - 6}</Badge>}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <UsersIcon className="h-3.5 w-3.5" /> {members.length} member{members.length === 1 ? "" : "s"}
                </div>
                {members.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {members.slice(0, 4).map((u) => <Badge key={u.id} variant="outline" className="text-[10px]">{userFullName(u)}</Badge>)}
                    {members.length > 4 && <Badge variant="outline" className="text-[10px]">+{members.length - 4}</Badge>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={creating || !!editing} onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Group" : "Create Group"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
            <div><Label>Capabilities</Label><div className="mt-2"><PermissionMatrix value={caps} onChange={setCaps} /></div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={editing ? saveEdit : saveCreate}>{editing ? "Save changes" : "Create group"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default UserGroups;

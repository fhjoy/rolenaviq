import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localFollowUpDate } from "@/features/applications/follow-up-date";
import { createAction, deleteAction, updateAction, type FollowUpAction } from "./actions.api";
import { useActions } from "./useActions";

function ActionRow({ action }: { action: FollowUpAction }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(action.title);
  const [dueDate, setDueDate] = useState(action.dueDate.slice(0, 10));
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["actions"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);
  const change = useMutation({ mutationFn: (value: { title?: string; dueDate?: string; completed?: boolean }) => updateAction(action._id, value), onSuccess: refresh, onError: () => toast.error("Could not update action") });
  const remove = useMutation({ mutationFn: () => deleteAction(action._id), onSuccess: refresh, onError: () => toast.error("Could not delete action") });
  return <li className="rounded-xl border p-4">
    <p className="mb-3 font-semibold">{action.title}</p>
    <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_auto] sm:items-end" onSubmit={event => { event.preventDefault(); change.mutate({ title: title.trim(), dueDate }); }}>
      <div><Label htmlFor={`title-${action._id}`}>Action</Label><Input id={`title-${action._id}`} maxLength={200} required value={title} onChange={event => setTitle(event.target.value)} disabled={!!action.completedAt} /></div>
      <div><Label htmlFor={`date-${action._id}`}>Due date</Label><Input id={`date-${action._id}`} type="date" required value={dueDate} onChange={event => setDueDate(event.target.value)} disabled={!!action.completedAt} /></div>
      {!action.completedAt && <Button variant="outline" type="submit" disabled={change.isPending || (title === action.title && dueDate === action.dueDate.slice(0, 10))}>Save changes</Button>}
    </form>
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
      {action.completedAt ? <span>Completed {new Date(action.completedAt).toLocaleDateString()}</span> : <span>Due {localFollowUpDate(action.dueDate).toLocaleDateString()}</span>}
      <Button variant="outline" size="sm" type="button" disabled={change.isPending} onClick={() => change.mutate({ completed: !action.completedAt })}>{action.completedAt ? "Reopen" : "Mark complete"}</Button>
      <Button variant="ghost" size="sm" type="button" disabled={remove.isPending} onClick={() => remove.mutate()}>Delete</Button>
    </div>
  </li>;
}

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const queryClient = useQueryClient();
  const actions = useActions(applicationId, "all");
  const create = useMutation({
    mutationFn: () => createAction(applicationId, title.trim(), dueDate),
    onSuccess: async () => {
      setTitle(""); setDueDate("");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["actions"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
      toast.success("Action added");
    },
    onError: () => toast.error("Could not add action"),
  });
  const all = actions.data?.pages.flatMap(page => page.actions) ?? [];
  const open = all.filter(action => !action.completedAt);
  const completed = all.filter(action => action.completedAt);
  function submit(event: FormEvent) { event.preventDefault(); if (title.trim() && dueDate) create.mutate(); }
  return <Card className="mt-6 border-border/70 bg-card shadow-sm">
    <CardHeader><CardTitle>Follow-up actions</CardTitle><p className="text-sm text-muted-foreground">Plan several next steps and keep completed ones as a record.</p></CardHeader>
    <CardContent>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)_auto] sm:items-end">
        <div><Label htmlFor="new-action">Next action</Label><Input id="new-action" maxLength={200} required placeholder="Email the recruiter" value={title} onChange={event => setTitle(event.target.value)} /></div>
        <div><Label htmlFor="new-action-date">Due date</Label><Input id="new-action-date" type="date" required value={dueDate} onChange={event => setDueDate(event.target.value)} /></div>
        <Button type="submit" disabled={create.isPending}>Add action</Button>
      </form>
      {actions.isError && <p className="mt-4 text-destructive" role="alert">Could not load actions. <Button variant="outline" onClick={() => void actions.refetch()}>Try again</Button></p>}
      {actions.isPending && <p className="mt-4" role="status">Loading actions...</p>}
      {!actions.isPending && !actions.isError && open.length === 0 && <p className="mt-5 text-sm text-muted-foreground">No open actions yet.</p>}
      {open.length > 0 && <><h3 className="mt-6 mb-3 font-semibold">Open ({open.length})</h3><ul className="space-y-3">{open.map(action => <ActionRow key={action._id} action={action} />)}</ul></>}
      {completed.length > 0 && <><h3 className="mt-6 mb-3 font-semibold">Completed ({completed.length})</h3><ul className="space-y-3">{completed.map(action => <ActionRow key={action._id} action={action} />)}</ul></>}
      {actions.hasNextPage && <Button className="mt-4" variant="outline" disabled={actions.isFetchingNextPage} onClick={() => void actions.fetchNextPage()}>Load more actions</Button>}
    </CardContent>
  </Card>;
}

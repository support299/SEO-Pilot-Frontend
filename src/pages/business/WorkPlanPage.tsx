import { useCallback, useEffect, useState } from "react";
import { sitePlanService } from "@/api/sitePlanService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { useToast } from "@/hooks/useToast";
import { errorMessage } from "@/types/api";
import type { PlanTask, SitePlan, SitePlanWorkspace, TaskStatus } from "@/types/sitePlan";

const TASK_LABEL: Record<TaskStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  waiting: "Waiting",
  done: "Done",
  deferred: "Deferred",
  cancelled: "Cancelled",
};
const TASK_STYLE: Record<TaskStatus, string> = {
  planned: "bg-black/5 text-muted",
  in_progress: "bg-indigo-100 text-indigo-800",
  waiting: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  deferred: "bg-black/5 text-muted",
  cancelled: "bg-black/5 text-muted",
};
const PRIORITY_STYLE = { high: "text-red-700", medium: "text-foreground", low: "text-muted" };

function formatDate(value: string | null | undefined) {
  return value ? new Date(`${value}T12:00:00`).toLocaleDateString() : null;
}

export function WorkPlanPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const isStaff = Boolean(user?.is_agency_admin);
  const [data, setData] = useState<SitePlanWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await sitePlanService.get(business.id));
      setError(null);
    } catch {
      setError("Couldn't load the work plan right now.");
    }
  }, [business.id]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load();
  }, [load]);

  return (
    <>
      <PageHeader eyebrow="Work plan" title="Work plan" description="The work agreed for this website: what is being done, in what order, and how we'll know it's finished." />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {!data && !error ? <LoadingState label="Loading work plan…" /> : null}

      {data && isStaff && data.open ? <OpenPlanCard businessId={business.id} plan={data.open} onChanged={load} /> : null}

      {data && data.active ? (
        <PlanCard plan={data.active} businessId={business.id} isStaff={isStaff} onChanged={load} />
      ) : data ? (
        <div className="mt-6">
          <EmptyState title="No approved plan yet" description="The plan for this website is still being prepared. Nothing is assumed missing in the meantime." />
        </div>
      ) : null}
    </>
  );
}

function OpenPlanCard({ businessId, plan, onChanged }: { businessId: number; plan: SitePlan; onChanged: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const awaiting = plan.status === "submitted";

  async function decide(decision: "approve" | "request_changes" | "reject") {
    setBusy(true);
    try {
      await sitePlanService.decide(businessId, plan.id, decision, note);
      toast.show("success", decision === "approve" ? `Version ${plan.version} approved and now active.` : decision === "reject" ? "Plan rejected." : "Sent back with your note.");
      setNote("");
      onChanged();
    } catch (err) {
      toast.show("error", errorMessage(err, "That didn't work. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className={`mt-6 ${awaiting ? "border-amber-300" : "border-primary/30"}`}>
      <div data-testid="open-plan">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Staff only</p>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">
            {awaiting ? "Awaiting your approval" : "Being drafted"} · version {plan.version}
          </h2>
          <p className="text-xs text-muted">
            Drafted by {plan.created_by ?? "unknown"} · {plan.tasks.length} tasks · about {plan.estimate_minutes_total ?? 0} min estimated
          </p>
        </div>
        {plan.summary ? <p className="mt-2 text-sm text-foreground">{plan.summary}</p> : null}
        {plan.decision_note ? <p className="mt-2 text-xs text-amber-800">Your last note: {plan.decision_note}</p> : null}
        <TaskList tasks={plan.tasks} isStaff />
        {awaiting ? (
          <div className="mt-4 flex flex-col gap-3">
            <TextInput aria-label="Note for the plan" placeholder="Note (required to send back or reject)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button loading={busy} onClick={() => decide("approve")}>
                Approve plan
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => decide("request_changes")}>
                Request changes
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => decide("reject")} className="text-danger">
                Reject
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">The AI is still working on this draft. You'll be able to approve it once it's submitted.</p>
        )}
      </div>
    </Card>
  );
}

function PlanCard({ plan, businessId, isStaff, onChanged }: { plan: SitePlan; businessId: number; isStaff: boolean; onChanged: () => void }) {
  const done = plan.tasks.filter((t) => t.status === "done").length;
  return (
    <Card className="mt-6">
      <div data-testid="active-plan">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">Current plan · version {plan.version}</h2>
          <p className="text-xs text-muted">
            {formatDate(plan.effective_from) ? `Approved ${formatDate(plan.effective_from)}` : null}
            {plan.reassess_on ? ` · Next review ${formatDate(plan.reassess_on)}` : ""}
            {` · ${done} of ${plan.tasks.length} done`}
          </p>
        </div>
        {plan.summary ? <p className="mt-2 text-sm text-foreground">{plan.summary}</p> : null}
        <TaskList tasks={plan.tasks} isStaff={isStaff} businessId={businessId} onChanged={onChanged} editable={isStaff} />
        <p className="mt-4 text-xs text-muted">Finishing a task means the work was done. It doesn't promise a change in rankings or traffic.</p>
      </div>
    </Card>
  );
}

function TaskList({ tasks, isStaff, businessId, onChanged, editable = false }: { tasks: PlanTask[]; isStaff: boolean; businessId?: number; onChanged?: () => void; editable?: boolean }) {
  if (tasks.length === 0) return <p className="mt-3 text-sm text-muted">No tasks yet.</p>;
  return (
    <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
      {tasks.map((task) => (
        <li key={task.id} className="px-4 py-3" data-testid={`task-${task.feature_id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                <span className={`mr-2 text-xs font-semibold uppercase ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
                {task.title}
              </p>
              <p className="text-xs text-muted">
                {task.feature_id} {task.feature_title}
                {task.target ? ` · ${task.target}` : ""}
                {task.planned_start || task.planned_end ? ` · ${formatDate(task.planned_start) ?? "…"} – ${formatDate(task.planned_end) ?? "…"}` : ""}
              </p>
              <p className="mt-1 text-xs text-foreground">Done when: {task.completion_criteria}</p>
              {task.status_note ? <p className="mt-1 text-xs text-amber-800">{task.status_note}</p> : null}
              {isStaff ? (
                <p className="mt-1 text-xs text-muted">
                  {task.estimate_minutes ? `Est. ${task.estimate_minutes} min` : "No estimate"}
                  {task.risk ? ` · risk ${task.risk}` : ""}
                  {task.scope_justification ? ` · Why in scope: ${task.scope_justification}` : ""}
                  {task.completion_evidence ? ` · Proof: ${task.completion_evidence}` : ""}
                  {task.updated_by_agent ? ` · last by ${task.updated_by_agent}` : ""}
                </p>
              ) : null}
              {isStaff && task.eligibility && !task.eligibility.ok ? (
                <p className="mt-1 text-xs font-semibold text-red-700">Not allowed under the current package ({task.eligibility.code.replaceAll("_", " ")})</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {editable && businessId && onChanged ? <ProgressControl businessId={businessId} task={task} onChanged={onChanged} /> : null}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TASK_STYLE[task.status]}`}>{TASK_LABEL[task.status]}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Staff can nudge progress by hand; normally the AI records it through the agent API. */
function ProgressControl({ businessId, task, onChanged }: { businessId: number; task: PlanTask; onChanged: () => void }) {
  const toast = useToast();
  async function change(status: TaskStatus) {
    const needsNote = status === "waiting" || status === "deferred" || status === "cancelled";
    const status_note = needsNote ? (window.prompt("What is it waiting on, or why?") ?? "") : undefined;
    const completion_evidence = status === "done" ? (window.prompt("Link or describe the proof it was done") ?? "") : undefined;
    try {
      await sitePlanService.recordProgress(businessId, task.id, { status, status_note, completion_evidence });
      toast.show("success", "Progress recorded.");
      onChanged();
    } catch (err) {
      toast.show("error", errorMessage(err, "Couldn't record that."));
    }
  }
  return (
    <select aria-label={`Progress for ${task.title}`} value="" onChange={(e) => e.target.value && change(e.target.value as TaskStatus)} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs">
      <option value="">Update…</option>
      {(Object.keys(TASK_LABEL) as TaskStatus[])
        .filter((s) => s !== task.status)
        .map((s) => (
          <option key={s} value={s}>
            {TASK_LABEL[s]}
          </option>
        ))}
    </select>
  );
}

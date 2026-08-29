import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Container } from "@/components/s2b/primitives";
import {
  adminOverview,
  adminSetUsage,
  adminDeleteUser,
  adminActivity,
  adminBlocks,
  adminBlock,
  adminUnblock,
} from "@/lib/auth/admin.functions";
import { seedCatalog, type SeedReport } from "@/lib/products/seed.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin panel | Source2BD" },
      {
        name: "description",
        content: "Source2BD owner dashboard: accounts, daily lookups and cached searches.",
      },
      { property: "og:title", content: "Source2BD admin panel" },
      { property: "og:description", content: "Accounts, daily lookups and cached searches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"users" | "activity" | "blocks" | "searches" | "errors">("users");
  const [filter, setFilter] = useState("");
  const [onlyBlocked, setOnlyBlocked] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    refetchInterval: 60_000,
  });

  const activity = useQuery({
    queryKey: ["admin-activity", onlyBlocked, logSearch],
    queryFn: () => adminActivity({ data: { onlyBlocked, search: logSearch, limit: 200 } }),
    refetchInterval: 30_000,
  });
  const blocks = useQuery({ queryKey: ["admin-blocks"], queryFn: () => adminBlocks() });

  const reset = useMutation({
    mutationFn: (userId: string) => adminSetUsage({ data: { userId, used: 0 } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });
  const remove = useMutation({
    mutationFn: (userId: string) => adminDeleteUser({ data: { userId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });
  const block = useMutation({
    mutationFn: (input: {
      subjectType: "user" | "ip";
      subject: string;
      reason?: string | undefined;
      hours?: number | undefined;
    }) => adminBlock({ data: { ...input, hours: input.hours ?? 0 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
  });
  const unblock = useMutation({
    mutationFn: (id: string) => adminUnblock({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blocks"] }),
  });

  const [seedReport, setSeedReport] = useState<SeedReport | null>(null);
  const seed = useMutation({
    mutationFn: (dryRun: boolean) => seedCatalog({ data: { dryRun } }),
    onSuccess: (report: SeedReport) => {
      setSeedReport(report);
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });

  function askBlock(subjectType: "user" | "ip", subject: string) {
    const reason = prompt(`Block this ${subjectType}? Optional note:`, "abuse");
    if (reason === null) return;
    block.mutate({ subjectType, subject, reason });
  }

  if (error) {
    return (
      <Container className="py-16">
        <p className="text-[15px] font-semibold text-destructive">
          You do not have access to this page.
        </p>
        <Link to="/" className="mt-3 inline-block text-[14px] font-bold text-accent">
          ← Back home
        </Link>
      </Container>
    );
  }

  const users = (data?.users ?? []).filter((u) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return [u.email, u.phone, u.fullName].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <Container className="py-[clamp(1.5rem,4vw,3rem)]">
      <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-foreground">Admin panel</h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Dhaka day {data?.day ?? "—"} · limit {data?.limit ?? 30} live lookups per account
      </p>

      <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <Stat label="Accounts" value={data?.totals.users ?? 0} />
        <Stat label="New today" value={data?.totals.newToday ?? 0} />
        <Stat label="Lookups today" value={data?.totals.lookupsToday ?? 0} />
        <Stat label="Guest devices" value={data?.totals.guestsToday ?? 0} />
        <Stat label="Cached searches" value={data?.totals.cachedSearches ?? 0} />
        <Stat label="Errors (24h)" value={data?.totals.errors24h ?? 0} />
        <Stat label="Requests (24h)" value={activity.data?.requests24h ?? 0} />
        <Stat label="Blocked (24h)" value={activity.data?.blocked24h ?? 0} />
        <Stat label="Active blocks" value={blocks.data?.length ?? 0} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["users", "activity", "blocks", "searches", "errors"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={`h-11 rounded-full px-5 text-[14px] font-bold capitalize transition-colors ${
              tab === k
                ? "bg-foreground text-background"
                : "bg-foreground/[0.06] text-muted-foreground"
            }`}
          >
            {k}
          </button>
        ))}
        {tab === "users" ? (
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search email, phone or name"
            className="ml-auto h-11 w-full max-w-[280px] rounded-full border border-foreground/12 bg-background px-4 text-[14px] outline-none focus:border-accent"
          />
        ) : null}
        {tab === "activity" ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyBlocked((v) => !v)}
              aria-pressed={onlyBlocked}
              className={`h-11 rounded-full px-4 text-[14px] font-bold ${
                onlyBlocked
                  ? "bg-destructive/15 text-destructive"
                  : "bg-foreground/[0.06] text-muted-foreground"
              }`}
            >
              Blocked only
            </button>
            <input
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Filter by IP, query or user id"
              className="h-11 w-full max-w-[280px] rounded-full border border-foreground/12 bg-background px-4 text-[14px] outline-none focus:border-accent"
            />
          </div>
        ) : null}
      </div>

      {isLoading ? <p className="mt-6 text-[14px] text-muted-foreground">Loading…</p> : null}

      {tab === "users" ? (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-foreground/10">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="bg-foreground/[0.04] text-[12px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Devices</th>
                <th className="px-4 py-3">Used today</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-foreground/8">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {u.fullName || u.phone || u.email || u.id.slice(0, 8)}
                      {u.isAdmin ? (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                          admin
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {u.signupMethod === "phone" ? u.phone : u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.devices}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {u.usedToday} / {data?.limit ?? 30}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => reset.mutate(u.id)}
                        className="h-9 rounded-full bg-foreground/[0.06] px-3 text-[13px] font-bold text-foreground"
                      >
                        Reset quota
                      </button>
                      {!u.isAdmin ? (
                        <button
                          type="button"
                          onClick={() => askBlock("user", u.id)}
                          className="h-9 rounded-full bg-foreground/[0.06] px-3 text-[13px] font-bold text-foreground"
                        >
                          Block
                        </button>
                      ) : null}
                      {!u.isAdmin ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this account permanently?")) remove.mutate(u.id);
                          }}
                          className="h-9 rounded-full bg-destructive/10 px-3 text-[13px] font-bold text-destructive"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No accounts yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : tab === "activity" ? (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-foreground/10">
          {activity.data?.topIps.length ? (
            <div className="flex flex-wrap gap-2 border-b border-foreground/8 p-3 text-[12px]">
              <span className="font-bold text-muted-foreground">Busiest IPs:</span>
              {activity.data.topIps.map((t) => (
                <button
                  key={t.ip}
                  type="button"
                  onClick={() => setLogSearch(t.ip)}
                  className="rounded-full bg-foreground/[0.06] px-3 py-1 font-semibold text-foreground"
                >
                  {t.ip} · {t.count}
                </button>
              ))}
            </div>
          ) : null}
          <table className="w-full min-w-[860px] text-left text-[14px]">
            <thead className="bg-foreground/[0.04] text-[12px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(activity.data?.events ?? []).map((e) => (
                <tr key={e.id} className="border-t border-foreground/8 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {e.createdAt.slice(0, 19).replace("T", " ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{e.kind}</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    <div>{e.userId ? e.userId.slice(0, 8) : "guest"}</div>
                    <div className="font-mono">{e.ip ?? "—"}</div>
                  </td>
                  <td className="max-w-[280px] break-words px-4 py-3 text-muted-foreground">
                    {e.detail ?? "—"}
                    {e.userAgent ? (
                      <div className="mt-1 truncate text-[11px] opacity-70" title={e.userAgent}>
                        {e.userAgent}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {e.allowed ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[12px] font-bold text-accent">
                        allowed
                      </span>
                    ) : (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[12px] font-bold text-destructive">
                        {e.reason ?? "blocked"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.ip ? (
                      <button
                        type="button"
                        onClick={() => askBlock("ip", e.ip!)}
                        className="h-9 rounded-full bg-foreground/[0.06] px-3 text-[13px] font-bold text-foreground"
                      >
                        Block IP
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!activity.isLoading && (activity.data?.events ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No requests logged for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : tab === "blocks" ? (
        <div className="mt-4 space-y-4">
          <BlockForm onSubmit={(v) => block.mutate(v)} pending={block.isPending} />
          <div className="overflow-x-auto rounded-3xl border border-foreground/10">
            <table className="w-full min-w-[620px] text-left text-[14px]">
              <thead className="bg-foreground/[0.04] text-[12px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(blocks.data ?? []).map((b) => (
                  <tr key={b.id} className="border-t border-foreground/8">
                    <td className="px-4 py-3 font-semibold text-foreground">{b.subjectType}</td>
                    <td className="break-all px-4 py-3 font-mono text-[13px] text-muted-foreground">
                      {b.subject}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.reason ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.expiresAt ? b.expiresAt.slice(0, 16).replace("T", " ") : "never"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => unblock.mutate(b.id)}
                        className="h-9 rounded-full bg-foreground/[0.06] px-3 text-[13px] font-bold text-foreground"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
                {(blocks.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nobody is blocked right now.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "searches" ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => seed.mutate(true)}
              disabled={seed.isPending}
              className="h-11 rounded-full bg-foreground/[0.06] px-4 text-[14px] font-bold text-muted-foreground disabled:opacity-50"
            >
              {seed.isPending ? "Working…" : "Check seed status"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Run live searches for the curated seed list? This spends provider credit.",
                  )
                )
                  seed.mutate(false);
              }}
              disabled={seed.isPending}
              className="h-11 rounded-full bg-accent px-4 text-[14px] font-bold text-background disabled:opacity-50"
            >
              Seed catalogue
            </button>
          </div>
          {seedReport ? (
            <p className="mt-2 text-[13px] text-muted-foreground">
              Seeded {seedReport.done.length} ({seedReport.items} products) · skipped{" "}
              {seedReport.skipped.length}
              {seedReport.failed.length ? (
                <span className="text-destructive">
                  {" "}
                  · failed {seedReport.failed.length}:{" "}
                  {seedReport.failed.map((f) => f.query).join(", ")}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-3 overflow-x-auto rounded-3xl border border-foreground/10">
            <table className="w-full min-w-[620px] text-left text-[14px]">
              <thead className="bg-foreground/[0.04] text-[12px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Query</th>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Hits</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {(data?.searches ?? []).map((s) => (
                  <tr key={`${s.marketplace}-${s.query}`} className="border-t border-foreground/8">
                    <td className="px-4 py-3 font-semibold text-foreground">{s.query}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.marketplace}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.items}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.hits}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.updatedAt.slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-foreground/10">
          <table className="w-full min-w-[620px] text-left text-[14px]">
            <thead className="bg-foreground/[0.04] text-[12px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Where</th>
                <th className="px-4 py-3">What happened</th>
              </tr>
            </thead>
            <tbody>
              {(data?.errors ?? []).map((e) => (
                <tr key={e.id} className="border-t border-foreground/8 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {e.createdAt.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[12px] font-bold text-destructive">
                      {e.scope}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{e.message}</div>
                    {e.detail ? (
                      <div className="mt-1 break-all text-[12px] text-muted-foreground">
                        {e.detail}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.errors ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No upstream failures logged. Everything is healthy.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-foreground/10 p-4">
      <div className="text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold text-foreground">{value}</div>
      <div className="text-[13px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

type BlockInput = {
  subjectType: "user" | "ip";
  subject: string;
  reason?: string | undefined;
  hours: number;
};

function BlockForm({
  onSubmit,
  pending,
}: {
  onSubmit: (value: BlockInput) => void;
  pending: boolean;
}) {
  const [subjectType, setSubjectType] = useState<"user" | "ip">("ip");
  const [subject, setSubject] = useState("");
  const [reason, setReason] = useState("");
  const [hours, setHours] = useState("0");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!subject.trim()) return;
        onSubmit({
          subjectType,
          subject: subject.trim(),
          reason: reason.trim() || undefined,
          hours: Number.parseInt(hours, 10) || 0,
        });
        setSubject("");
        setReason("");
      }}
      className="flex flex-wrap items-center gap-2 rounded-3xl border border-foreground/10 p-3"
    >
      <select
        value={subjectType}
        onChange={(e) => setSubjectType(e.target.value as "user" | "ip")}
        className="h-11 rounded-full border border-foreground/12 bg-background px-4 text-[14px]"
      >
        <option value="ip">IP address</option>
        <option value="user">User id</option>
      </select>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder={subjectType === "ip" ? "203.0.113.9" : "user uuid"}
        className="h-11 min-w-[220px] flex-1 rounded-full border border-foreground/12 bg-background px-4 text-[14px] outline-none focus:border-accent"
      />
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Note (optional)"
        className="h-11 min-w-[160px] flex-1 rounded-full border border-foreground/12 bg-background px-4 text-[14px] outline-none focus:border-accent"
      />
      <input
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        inputMode="numeric"
        title="Hours (0 = permanent)"
        className="h-11 w-[110px] rounded-full border border-foreground/12 bg-background px-4 text-[14px] outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-foreground px-5 text-[14px] font-bold text-background disabled:opacity-50"
      >
        Block
      </button>
    </form>
  );
}

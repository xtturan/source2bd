import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Container } from "@/components/s2b/primitives";
import { adminOverview, adminSetUsage, adminDeleteUser } from "@/lib/auth/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel | Source2BD" },
      { name: "description", content: "Source2BD owner dashboard: accounts, daily lookups and cached searches." },
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
  const [tab, setTab] = useState<"users" | "searches">("users");
  const [filter, setFilter] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    refetchInterval: 60_000,
  });

  const reset = useMutation({
    mutationFn: (userId: string) => adminSetUsage({ data: { userId, used: 0 } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });
  const remove = useMutation({
    mutationFn: (userId: string) => adminDeleteUser({ data: { userId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

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
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["users", "searches"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            aria-pressed={tab === k}
            className={`h-11 rounded-full px-5 text-[14px] font-bold capitalize transition-colors ${
              tab === k ? "bg-foreground text-background" : "bg-foreground/[0.06] text-muted-foreground"
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
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl border border-foreground/10">
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
                  <td className="px-4 py-3 text-muted-foreground">{s.updatedAt.slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))}
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

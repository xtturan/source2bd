import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/s2b/primitives";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { myAccount } from "@/lib/auth/account.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "আমার অ্যাকাউন্ট | Source2BD account" },
      { name: "description", content: "Your Source2BD account: daily search allowance and profile." },
      { property: "og:title", content: "My Source2BD account" },
      { property: "og:description", content: "Daily search allowance and profile details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-account"], queryFn: () => myAccount() });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Container className="py-[clamp(1.5rem,5vw,4rem)]">
      <div className="mx-auto w-full max-w-[560px]">
        <h1 className="font-bn text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold text-foreground">
          {t("আমার অ্যাকাউন্ট", "My account")}
        </h1>

        <dl className="mt-5 space-y-3 rounded-3xl border border-foreground/10 p-5">
          <Row label={t("নাম", "Name")} value={data?.profile?.full_name ?? "—"} />
          <Row label={t("মোবাইল", "Phone")} value={data?.profile?.phone ?? "—"} />
          <Row label={t("ইমেইল", "Email")} value={data?.profile?.email ?? "—"} />
          <Row label={t("দৈনিক সার্চ", "Daily searches")} value="30" />
        </dl>

        {data?.isAdmin ? (
          <Link
            to="/admin"
            className="font-bn mt-4 flex h-16 items-center justify-center rounded-2xl bg-foreground text-[17px] font-extrabold text-background"
          >
            {t("অ্যাডমিন প্যানেল", "Admin panel")}
          </Link>
        ) : null}

        <Link
          to="/sourcing"
          className="font-bn mt-3 flex h-16 items-center justify-center rounded-2xl bg-wa text-[17px] font-extrabold text-wa-foreground"
        >
          {t("পণ্য খুঁজুন", "Find products")}
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="font-bn mt-3 h-14 w-full rounded-2xl border border-foreground/12 text-[15px] font-bold text-muted-foreground"
        >
          {t("লগ আউট", "Log out")}
        </button>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-bn text-[14px] font-bold text-muted-foreground">{label}</dt>
      <dd className="text-[15px] font-semibold text-foreground">{value}</dd>
    </div>
  );
}

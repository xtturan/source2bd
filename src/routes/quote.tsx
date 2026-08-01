import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { z } from "zod";
import { Container, Section, Badge } from "@/components/s2b/primitives";
import { ExternalButton, Field, Input, Select, Textarea } from "@/components/s2b/button";
import { services } from "@/config/site";
import { serviceQuote } from "@/lib/whatsapp";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Request a cargo quote — TWT International" },
      {
        name: "description",
        content:
          "Tell us your shipping mode, weight and delivery city. We build the WhatsApp message for you and reply with a China to Bangladesh path quote.",
      },
      { property: "og:title", content: "Request a quote — TWT International" },
      {
        property: "og:description",
        content: "Build your cargo enquiry in seconds and send it straight to our WhatsApp desk.",
      },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
  component: QuotePage,
});

const schema = z.object({
  mode: z.string().min(1, "Choose a shipping mode"),
  weight: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(600).optional(),
});

function QuotePage() {
  const [mode, setMode] = useState(services[0]?.title ?? "Air Freight");
  const [weight, setWeight] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parsed = schema.safeParse({ mode, weight, city, notes });
  const href = parsed.success
    ? serviceQuote({
        mode,
        weight: weight || undefined,
        city: city || undefined,
        notes: notes || undefined,
      })
    : "#";

  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Quote request</Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Build your enquiry, send it in one tap.
          </h1>
          <p className="font-bn mt-3 text-white/70">কোট রিকোয়েস্ট করুন</p>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              const result = schema.safeParse({ mode, weight, city, notes });
              if (!result.success) {
                const next: Record<string, string> = {};
                for (const issue of result.error.issues) {
                  next[String(issue.path[0])] = issue.message;
                }
                setErrors(next);
                return;
              }
              setErrors({});
              window.open(href, "_blank", "noopener,noreferrer");
            }}
          >
            <Field label="Shipping mode" error={errors["mode"]}>
              <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                {services.map((s) => (
                  <option key={s.key} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Weight or volume" hint="optional" error={errors["weight"]}>
              <Input
                value={weight}
                maxLength={60}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 65 kg, 4 cartons, ~0.8 CBM"
              />
            </Field>

            <Field label="Delivery city in Bangladesh" hint="optional" error={errors["city"]}>
              <Input
                value={city}
                maxLength={60}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dhaka, Chattogram, Sylhet…"
              />
            </Field>

            <Field label="What are you shipping?" hint="optional" error={errors["notes"]}>
              <Textarea
                value={notes}
                maxLength={600}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Product type, supplier city, deadline, anything else we should know."
              />
            </Field>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-signal px-6 font-semibold text-white shadow-[var(--shadow-lift)] transition-all hover:-translate-y-0.5 hover:bg-signal-600"
            >
              <MessageCircle className="size-5" /> Send on WhatsApp
            </button>
            <p className="text-xs text-steel">
              This opens WhatsApp with your details pre-written. Nothing is stored on this site.
            </p>
          </form>

          <aside className="h-fit matte rounded-2xl border border-navy/8 bg-mist/60 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">
              Message preview
            </h2>
            <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-navy/8 bg-white/70 p-4 backdrop-blur-md text-sm leading-relaxed text-navy">
              {decodeURIComponent((href.split("text=")[1] ?? "").replace(/\+/g, " "))}
            </pre>
            <p className="mt-4 text-xs leading-relaxed text-steel">
              We handle legal, permitted goods only. Duty and taxes are assessed by Bangladesh
              customs and quoted separately from freight.
            </p>
            <div className="mt-5">
              <ExternalButton href={href} variant="outline" className="w-full">
                Open WhatsApp
              </ExternalButton>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
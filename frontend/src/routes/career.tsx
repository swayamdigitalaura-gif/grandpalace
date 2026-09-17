import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { Briefcase, Check, Mail, ChefHat, Clock, Upload, Loader2 } from "lucide-react";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/gallery/Interior_058.jpg";
import kitchenImg from "@/assets/gallery/SLA09464.jpg";
import { api, API_URL } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

type Job = {
  id: string;
  title: string; subtitle: string | null; badge1: string | null; badge2: string | null;
  openings: number;
  requirements: string[]; responsibilities: string[];
};

// Job openings are managed at Admin -> Career (add/edit/delete/hide), stored
// in the JobPosting table — fetched here the same way set-menu.tsx reads its
// packages, so admin changes show up without a code deploy.
async function fetchJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API_URL}/api/jobs`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/career")({
  loader: async () => {
    const [content, jobs] = await Promise.all([
      fetchPageContent("/career"),
      fetchJobs(),
    ]);
    return { content, jobs };
  },
  head: () => ({
    meta: [
      { title: "Careers — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Join the team at The Grand Palace. We're looking for passionate people to join our family-run restaurant in Sydney CBD. Current opening: Chef / Cook." },
    ],
  }),
  component: CareerPage,
});

type ApplyState = { name: string; email: string; phone: string; message: string };
const EMPTY_APPLY: ApplyState = { name: "", email: "", phone: "", message: "" };

function ApplyForm({ role, onClose }: { role: string; onClose: () => void }) {
  const [form, setForm] = useState<ApplyState>(EMPTY_APPLY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const captcha = useSimpleCaptcha();

  function update(k: keyof ApplyState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!captcha.verify()) return;
    setStatus("saving");
    try {
      let resumeUrl: string | null = null;
      if (resumeFile) {
        const uploaded = await api.upload<{ url: string }>("/api/career-uploads", resumeFile, "file");
        resumeUrl = uploaded.url;
      }
      await api.post("/api/enquiries", {
        type: "career",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `${role} Application`,
        message: form.message || null,
        data: { role, resumeUrl },
      });
      setStatus("sent");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again or email us directly." });
      setStatus("error");
    }
  }

  const fieldCls = (k: string) =>
    `w-full rounded-lg border px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:ring-2 transition text-sm ${
      errors[k] ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-saffron/30 bg-white/70 focus:border-saffron focus:ring-saffron/20"
    }`;
  const labelCls = "text-xs uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

  if (status === "sent") {
    return (
      <div className="border-t border-saffron/15 bg-stone-50/80 p-6 md:p-8 text-center">
        <p className="text-palace font-semibold text-[15px] mb-1">Application received!</p>
        <p className="text-palace/60 text-[13px]">Thanks for applying — our hiring team will be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="border-t border-saffron/15 bg-stone-50/80 p-6 md:p-8 space-y-4">
      <p className="text-palace/90 font-semibold text-[14px] mb-1">Apply for {role}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className={fieldCls("name")} placeholder="Your full name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={fieldCls("email")} placeholder="your@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label className={labelCls}>Phone Number *</label>
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={fieldCls("phone")} placeholder="+61 4xx xxx xxx" />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
      <div>
        <label className={labelCls}>Message</label>
        <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} className={`${fieldCls("message")} resize-none`}
          placeholder="Tell us about your experience…" />
      </div>
      <div>
        <label className={labelCls}>Resume / CV (PDF or Word, max 5MB)</label>
        <label className="flex items-center gap-2 rounded-lg border border-dashed border-saffron/40 bg-white/70 px-4 py-3 text-sm text-palace/60 cursor-pointer hover:border-saffron/70 transition">
          <Upload className="h-4 w-4 text-saffron shrink-0" />
          {resumeFile ? resumeFile.name : "Choose a file…"}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <SimpleCaptcha captcha={captcha} />
      {errors.submit && <p className="text-red-500 text-xs">{errors.submit}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-gold flex items-center gap-2 disabled:opacity-60">
          {status === "saving" ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit Application</>}
        </button>
        <button type="button" onClick={onClose} className="btn-outline-gold">Cancel</button>
      </div>
    </form>
  );
}

function CareerPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/career", loaderData.content);
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;
  const jobs = loaderData.jobs;
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  return (
    <PageShell crumbs={[{ label: "Career" }]}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroImg} alt="" data-tgp-key="hero.image" className="w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.55),rgba(8,3,0,0.92))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p data-tgp-key="hero.kicker" className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{c("hero.kicker", "Join Our Team")}</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-gold-gradient">{c("hero.title", "Careers")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/60 text-sm tracking-wider">{c("hero.subtitle", "Be part of Sydney's finest Indian dining experience")}</p>
        </div>
      </div>

      <section className="relative section-cream py-16 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.08] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -bottom-28 w-[460px] opacity-[0.08] animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="relative z-10 max-w-5xl mx-auto">

          {/* Intro */}
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3">Namaste from The Grand Palace</p>
            <h2 className="font-display text-4xl text-palace mb-5">
              The Most Authentic Indian<br /><span className="italic text-saffron">Food in Sydney CBD</span>
            </h2>
            <p data-tgp-key="intro.body" className="text-palace/65 text-[14px] leading-relaxed">
              {c("intro.body", "We are a family-run Indian restaurant in Sydney's CBD, serving traditional cuisine meticulously prepared in an upscale setting modelled after India's royal palaces. We welcome enthusiastic individuals who are passionate about authentic Indian cooking and eager to grow with our team.")}
            </p>
          </div>

          {/* Job listings */}
          {jobs.length === 0 && (
            <div className="rounded-2xl border border-saffron/20 bg-white/70 p-8 text-center text-palace/60 text-sm">
              No current openings — check back soon, or send us your resume anyway.
            </div>
          )}
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-2xl bg-white/80 border border-saffron/20 shadow-sm overflow-hidden">
                {/* Job header */}
                <div className="bg-palace p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-saffron/20 border border-saffron/30 flex items-center justify-center">
                      <ChefHat className="h-7 w-7 text-saffron" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-cream">{job.title}</h3>
                      <p className="text-cream/55 text-[13px] mt-0.5">{job.subtitle}</p>
                      <p className="text-saffron text-[12px] font-semibold mt-1">{job.openings} position{job.openings === 1 ? "" : "s"} open</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.badge1 && (
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white px-3 py-1.5 rounded-full"
                            style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                        {job.badge1}
                      </span>
                    )}
                    {job.badge2 && (
                      <span className="text-[11px] font-bold uppercase tracking-widest bg-green-600 text-white px-3 py-1.5 rounded-full">
                        {job.badge2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                  {/* Left col */}
                  <div>
                    <h4 className="font-display text-xl text-palace mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-saffron" /> Requirements
                    </h4>
                    <ul className="space-y-3">
                      {job.requirements.map((q) => (
                        <li key={q} className="flex items-start gap-3 text-palace/70 text-[13px]">
                          <Check className="h-4 w-4 text-saffron mt-0.5 shrink-0" /> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right col */}
                  <div>
                    <h4 className="font-display text-xl text-palace mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-saffron" /> Key Responsibilities
                    </h4>
                    <ul className="space-y-3">
                      {job.responsibilities.map((r) => (
                        <li key={r} className="flex items-start gap-3 text-palace/70 text-[13px]">
                          <span className="text-saffron mt-1 text-[10px] shrink-0">✦</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Apply bar */}
                {applyingTo === job.title ? (
                  <ApplyForm role={job.title} onClose={() => setApplyingTo(null)} />
                ) : (
                  <div className="border-t border-saffron/15 bg-stone-50/80 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <div>
                      <p className="text-palace/90 font-semibold text-[14px] mb-1">How to Apply</p>
                      <p className="text-palace/60 text-[13px]">Fill out our quick application form — we'd love to hear from passionate culinary professionals.</p>
                    </div>
                    <button type="button" onClick={() => setApplyingTo(job.title)}
                       className="btn-gold shrink-0 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Apply Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Restaurant image */}
          <div className="mt-10 relative rounded-2xl overflow-hidden min-h-[220px] shadow-md">
            <img src={kitchenImg} alt="The Grand Palace cuisine" loading="lazy" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-palace/80 to-palace/10" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="font-display text-2xl text-cream mb-1">Cook with passion. Serve with pride.</p>
              <p className="text-cream/60 text-sm">Join a team dedicated to authentic Indian culinary excellence.</p>
            </div>
          </div>

          {/* More openings note */}
          <div className="mt-8 rounded-2xl border border-saffron/20 bg-white/70 p-6 text-center">
            <p className="text-palace/70 text-[14px] leading-relaxed mb-3">
              Don't see a role that fits? We're always interested in hearing from talented and passionate individuals.
              Send your resume to <a href="mailto:bookings@thegrandpalace.com.au" className="text-saffron hover:text-gold transition font-semibold">bookings@thegrandpalace.com.au</a> and we'll keep you in mind for future openings.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

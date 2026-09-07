import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Briefcase, Check, Mail, ChefHat, Clock } from "lucide-react";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/gallery/Interior_058.jpg";
import kitchenImg from "@/assets/gallery/SLA09464.jpg";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

export const Route = createFileRoute("/career")({
  loader: () => fetchPageContent("/career"),
  head: () => ({
    meta: [
      { title: "Careers — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Join the team at The Grand Palace. We're looking for passionate people to join our family-run restaurant in Sydney CBD. Current opening: Chef / Cook." },
    ],
  }),
  component: CareerPage,
});

type Job = {
  title: string; subtitle: string; badge1: string; badge2: string;
  requirements: string[]; responsibilities: string[];
};

// The admin's Career tab manages this whole array as JSON under the
// "jobs.list" block key — add/remove postings there, not by editing code.
const DEFAULT_JOBS: Job[] = [
  {
    title: "Chef / Cook",
    subtitle: "The Grand Palace Indian Restaurant · Sydney CBD",
    badge1: "Full Time",
    badge2: "Current Opening",
    requirements: [
      "Minimum 3–4 years culinary experience with Tandoor and Curry cooking",
      "Certificate III or IV in Commercial Cookery (preferred)",
      "Ability to prepare breads and meats in the Tandoor (Indian style clay oven)",
      "Knowledge of Indian regional cuisines and spice blending techniques",
      "Passion for authentic Indian cooking and commitment to quality",
    ],
    responsibilities: [
      "Plan and oversee food preparation and cooking activities",
      "Prepare breads and meats in the Tandoor (Indian style clay oven)",
      "Estimate food requirements and maintain inventory records",
      "Ensure portion control and food quality standards at all times",
      "Maintain cleanliness to meet health and safety requirements",
      "Assist with menu planning and garnishing techniques",
      "Work collaboratively with the kitchen team during service",
    ],
  },
];

function parseJobs(raw: string | undefined): Job[] {
  if (!raw) return DEFAULT_JOBS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_JOBS;
  } catch {
    return DEFAULT_JOBS;
  }
}

function CareerPage() {
  const content = useLiveContent("/career", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;
  const jobs = parseJobs(content["jobs.list"]);
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
            {jobs.map((job, i) => (
              <div key={i} className="rounded-2xl bg-white/80 border border-saffron/20 shadow-sm overflow-hidden">
                {/* Job header */}
                <div className="bg-palace p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-saffron/20 border border-saffron/30 flex items-center justify-center">
                      <ChefHat className="h-7 w-7 text-saffron" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-cream">{job.title}</h3>
                      <p className="text-cream/55 text-[13px] mt-0.5">{job.subtitle}</p>
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
                <div className="border-t border-saffron/15 bg-stone-50/80 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div>
                    <p className="text-palace/90 font-semibold text-[14px] mb-1">How to Apply</p>
                    <p className="text-palace/60 text-[13px]">Send your resume to our hiring team — we'd love to hear from passionate culinary professionals.</p>
                  </div>
                  <a href={`mailto:bookings@thegrandpalace.com.au?subject=${encodeURIComponent(job.title + " Application — The Grand Palace")}`}
                     className="btn-gold shrink-0 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Apply Now
                  </a>
                </div>
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

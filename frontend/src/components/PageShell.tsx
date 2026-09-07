import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; to?: string };

function PageBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="absolute top-4 left-4 md:top-6 md:left-8 z-20">
      <div className="inline-flex items-center px-3.5 py-2 rounded-full backdrop-blur-sm"
           style={{ background: "rgba(8,3,0,0.45)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <Breadcrumb>
          <BreadcrumbList className="text-[12px] flex-nowrap gap-1.5">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1 text-cream/85 hover:text-gold transition font-medium whitespace-nowrap">
                  <Home className="h-3 w-3" /> Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.map((item, i) => (
              <Fragment key={i}>
                <BreadcrumbSeparator className="text-cream/40">/</BreadcrumbSeparator>
                <BreadcrumbItem>
                  {item.to ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.to} className="text-cream/85 hover:text-gold transition font-medium whitespace-nowrap">{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-gold font-semibold whitespace-nowrap">{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "24px",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "linear-gradient(135deg,#c8860a,#e6a020)",
        boxShadow: "0 4px 16px rgba(200,134,10,0.45)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        zIndex: 9999,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 14V4M9 4L4 9M9 4L14 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export function PageShell({ children, crumbs }: { children: ReactNode; crumbs?: Crumb[] }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        {crumbs && <PageBreadcrumb items={crumbs} />}
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export function StubPage({ title, kicker, crumbs }: { title: string; kicker?: string; crumbs?: Crumb[] }) {
  return (
    <PageShell crumbs={crumbs}>
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        {kicker && <div className="text-xs tracking-[0.4em] uppercase text-gold/80 mb-4">{kicker}</div>}
        <h1 className="text-5xl md:text-6xl text-gold-gradient mb-4">{title}</h1>
        <p className="text-muted-foreground">Content coming soon.</p>
      </section>
    </PageShell>
  );
}

import { Link } from "@tanstack/react-router";

type MenuCard = { to: string; img: string; kicker: string; title: string; desc: string; pos?: string };

export function ExploreMenus({ cards }: { cards: MenuCard[] }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
      <p className="text-center text-[11px] tracking-[0.35em] uppercase font-bold text-amber-700 mb-6">Explore Our Other Menus</p>
      <div className={`grid gap-5 ${
        cards.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cards.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : cards.length === 2 ? "sm:grid-cols-2" : ""
      }`}>
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="group relative rounded-xl overflow-hidden h-56 block shadow-sm">
            <img src={c.img} alt={c.title} loading="lazy" decoding="async"
                 style={{ objectPosition: c.pos ?? "center" }}
                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,3,0,0.92) 0%, rgba(8,3,0,0.55) 55%, rgba(8,3,0,0.15) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
              <p className="text-amber-300 text-[10px] tracking-[0.3em] uppercase font-bold mb-1.5">{c.kicker}</p>
              <h3 className="font-display text-2xl md:text-3xl text-white leading-tight mb-1.5">{c.title}</h3>
              <p className="text-cream/80 text-[13px] leading-relaxed mb-3">{c.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-amber-300 text-[12px] font-bold uppercase tracking-wider group-hover:gap-2.5 transition-all">
                View Menu <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

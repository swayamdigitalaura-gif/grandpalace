import mandala from "@/assets/mandala.png";

export function MandalaDivider({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 my-6">
      <img src={mandala} alt="" aria-hidden className="h-10 w-10 opacity-90" />
      {label && (
        <div className="divider-mandala text-xs tracking-[0.4em] uppercase">{label}</div>
      )}
    </div>
  );
}

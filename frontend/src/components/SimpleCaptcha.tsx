import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

function randInt() {
  return Math.floor(Math.random() * 8) + 1;
}

export function useSimpleCaptcha() {
  // Seed with fixed numbers so server and initial client render match exactly —
  // Math.random() would otherwise produce a different a/b on each side and
  // trigger a hydration mismatch. The real random numbers are rolled in the
  // effect below, which only ever runs client-side after hydration.
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setA(randInt());
    setB(randInt());
  }, []);

  const refresh = useCallback(() => {
    setA(randInt());
    setB(randInt());
    setAnswer("");
    setError(false);
  }, []);

  const verify = useCallback(() => {
    const ok = parseInt(answer, 10) === a + b;
    setError(!ok);
    return ok;
  }, [answer, a, b]);

  return { a, b, answer, setAnswer, error, refresh, verify };
}

export type SimpleCaptchaState = ReturnType<typeof useSimpleCaptcha>;

export function SimpleCaptcha({ captcha, dark }: { captcha: SimpleCaptchaState; dark?: boolean }) {
  return (
    <div>
      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? "text-cream/70" : "text-stone-600"}`}>
        Security Check — What is {captcha.a} + {captcha.b}? <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={captcha.answer}
          onChange={(e) => captcha.setAnswer(e.target.value)}
          placeholder="Your answer"
          className={`flex-1 rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${
            captcha.error
              ? "border-red-400 focus:border-red-500"
              : dark
                ? "bg-white/5 border-cream/20 text-cream placeholder:text-cream/30 focus:border-gold"
                : "border-stone-300 focus:border-amber-500"
          }`}
        />
        <button type="button" onClick={captcha.refresh} aria-label="Get a new question"
          className={`flex-shrink-0 p-2.5 rounded-lg border transition ${
            dark ? "border-cream/20 hover:bg-white/5 text-cream/60" : "border-stone-300 hover:bg-stone-50 text-stone-500"
          }`}>
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      {captcha.error && <p className="text-red-500 text-xs mt-1.5">That's not quite right — please try again.</p>}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Mail } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { usePopupVisibility, useSubscribers } from "../hooks/useNewsletter";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SuccessState({ text, title }: { title: string; text: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-4"
    >
      <div className="h-14 w-14 rounded-full border border-stone-800 flex items-center justify-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          <Mail className="h-6 w-6 text-stone-300" />
        </motion.div>
      </div>
      <h3 className="font-display text-2xl text-white mb-3">{title}</h3>
      <p className="text-stone-400 text-sm font-light leading-relaxed max-w-xs">{text}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function NewsletterPopup() {
  const { t, lang } = useLang();
  const nt = t.newsletter.popup;

  const { isOpen, close } = usePopupVisibility(800);
  const { add }           = useSubscribers();

  const [email, setEmail]     = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  // Focus trap: focus input when popup opens
  useEffect(() => {
    if (isOpen && !success) {
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [isOpen, success]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  function validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function handleSubmit() {
    const trimmed = email.trim();

    if (!validate(trimmed)) {
      setError(nt.errorInvalid);
      inputRef.current?.focus();
      return;
    }

    const ok = add(trimmed, lang as "fr" | "en");
    if (!ok) {
      setError(nt.errorDuplicate);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setSuccess(true);
    setTimeout(close, 2600);
  }

  function handleClose() {
    close();
    setEmail("");
    setError(null);
    setSuccess(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={nt.eyebrow}
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[201] inset-x-4 bottom-8 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-auto md:w-full md:max-w-lg"
          >
            <div className="relative bg-stone-950 border border-stone-800 text-white overflow-hidden">

              {/* Top accent line — matches site's editorial separators */}
              <div className="h-px w-full bg-stone-700" />

              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 p-1.5 text-stone-500 hover:text-white transition-colors z-10"
                aria-label={nt.close}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="px-8 pt-10 pb-10 md:px-12 md:pt-12 md:pb-12">
                <AnimatePresence mode="wait">
                  {success ? (
                    <SuccessState
                      key="success"
                      title={nt.successTitle}
                      text={nt.successText}
                    />
                  ) : (
                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Eyebrow */}
                      <span className="eyebrow text-stone-500 block mb-5">
                        — {nt.eyebrow}
                      </span>

                      {/* Title — uses font-display (Playfair) like the rest of the site */}
                      <h2 className="font-display text-3xl md:text-4xl leading-tight text-white mb-4 whitespace-pre-line">
                        {nt.title}
                      </h2>

                      <p className="text-stone-400 text-sm font-light leading-relaxed mb-8 max-w-sm">
                        {nt.subtitle}
                      </p>

                      {/* Input row */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <input
                            ref={inputRef}
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (error) setError(null);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder={nt.placeholder}
                            className={[
                              "w-full bg-black border px-4 py-3 text-sm text-white placeholder:text-stone-600",
                              "outline-none focus:border-stone-500 transition-colors",
                              error ? "border-red-800" : "border-stone-800",
                            ].join(" ")}
                          />
                          {error && (
                            <p className="mt-1.5 text-xs text-red-400 font-light">{error}</p>
                          )}
                        </div>

                        <button
                          onClick={handleSubmit}
                          className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 text-xs tracking-[0.2em] uppercase hover:bg-stone-200 transition shrink-0"
                        >
                          {nt.cta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Privacy */}
                      <p className="mt-5 text-[11px] text-stone-600 tracking-wide">
                        {nt.privacy}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
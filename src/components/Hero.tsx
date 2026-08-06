import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-20 right-[-10%] select-none pointer-events-none opacity-[0.03] scale-150">
        <span className="font-serif text-[600px] leading-none">Å</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-[clamp(3.5rem,8vw,7rem)] leading-[1.1] tracking-tight">
            Uspostavljanje
            <br />
            <span className="text-brand-accent italic font-normal">Istine</span>
            <br />
            Kroz dokaze
          </h1>

          <p className="mt-12 text-lg text-brand-dim leading-relaxed max-w-xl font-light">
            Naučna baza znanja posvećena odbrani islama kroz rukopisne dokaze,
            lingvističke dokaze i autentifikaciju hadisa, izgrađena za tragaoce
            za istinom u doba organizovane sumnje.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

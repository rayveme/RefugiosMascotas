import { useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import type { DonationFrequency } from "../../types";
import "./Donation.css";

const AMOUNTS = [5, 10, 25, 50, 100] as const;
type Amount = (typeof AMOUNTS)[number] | null;

const IMPACT: Record<number, Record<DonationFrequency, string>> = {
  5: {
    once: "Con $5 cubrirás la alimentación de una mascota por 1 día completo.",
    monthly:
      "Con $5/mes ayudarás al cuidado básico de una mascota todo el mes.",
  },
  10: {
    once: "Con $10 alimentarás a una mascota durante 3 días.",
    monthly:
      "Con $10/mes cubrirás la alimentación de una mascota durante un mes.",
  },
  25: {
    once: "Con $25 cubrirás una consulta veterinaria de emergencia.",
    monthly:
      "Con $25/mes cubrirás la alimentación de 2 mascotas durante un mes completo.",
  },
  50: {
    once: "Con $50 costearás la vacunación completa de una mascota.",
    monthly:
      "Con $50/mes apoyarás el cuidado veterinario de 3 mascotas mensualmente.",
  },
  100: {
    once: "Con $100 financiarás el rescate y atención inicial de una mascota en crisis.",
    monthly:
      "Con $100/mes serás el padrino de 5 mascotas en cuidado intensivo.",
  },
};

const impactItems = [
  { value: "$10", label: "Alimenta a una mascota\npor 3 días" },
  { value: "$25", label: "Cubre una consulta\nveterinaria" },
  { value: "$50", label: "Costea una vacunación\ncompleta" },
];

export default function Donation() {
  const [freq, setFreq] = useState<DonationFrequency>("monthly");
  const [amount, setAmount] = useState<Amount>(25);
  const [custom, setCustom] = useState("");

  const leftRef = useReveal<HTMLDivElement>();
  const rightRef = useReveal<HTMLDivElement>();

  const impactText = amount
    ? (IMPACT[amount]?.[freq] ??
      `Tu donación de $${amount} marcará una diferencia real.`)
    : custom
      ? `Tu donación de $${custom} marcará una diferencia real para las mascotas.`
      : "Selecciona un monto para ver tu impacto.";

  return (
    <section className="section-donar" id="donar" aria-labelledby="donar-title">
      <div className="container donar-grid">
        {/* Left */}
        <div className="reveal" ref={leftRef}>
          <div className="eyebrow">
            <span
              className="eyebrow__line"
              style={{ background: "var(--crimson)" }}
              aria-hidden="true"
            />
            <span className="eyebrow__text" style={{ color: "#abc339" }}>
              Haz la diferencia
            </span>
          </div>
          <h2 className="display-lg donar-headline" id="donar-title">
            Tu apoyo salva
            <br />
            <em>vidas reales</em>
          </h2>
          <p className="donar-desc">
            Cada donación contribuye directamente a la alimentación, cuidado
            veterinario y bienestar de miles de mascotas en situación de
            abandono a lo largo del país.
          </p>
          <div className="donar-impact">
            {impactItems.map((item) => (
              <div className="impact-item" key={item.value}>
                <span className="impact-item__num">{item.value}</span>
                <span className="impact-item__lbl">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donation card */}
        <div
          className="reveal"
          ref={rightRef}
          style={{ transitionDelay: ".15s" }}
        >
          <div className="donar-card">
            <h3 className="donar-card__title">Hacer una donación</h3>
            <p className="donar-card__sub">
              100% va directamente a los refugios
            </p>

            {/* Frequency toggle */}
            <div
              className="freq-toggle"
              role="group"
              aria-label="Frecuencia de donación"
            >
              <button
                className={`freq-btn${freq === "once" ? " active" : ""}`}
                onClick={() => setFreq("once")}
                aria-pressed={freq === "once"}
              >
                Una vez
              </button>
              <button
                className={`freq-btn${freq === "monthly" ? " active" : ""}`}
                onClick={() => setFreq("monthly")}
                aria-pressed={freq === "monthly"}
              >
                Mensual
              </button>
            </div>

            {/* Amount grid */}
            <div
              className="amount-grid"
              role="group"
              aria-label="Seleccionar monto"
            >
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  className={`amount-btn${amount === a ? " active" : ""}`}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                  aria-pressed={amount === a}
                >
                  ${a}
                </button>
              ))}
              <button
                className={`amount-btn${amount === null ? " active" : ""}`}
                onClick={() => setAmount(null)}
                aria-pressed={amount === null}
              >
                Otro
              </button>
              {amount === null && (
                <input
                  type="number"
                  className="amount-custom"
                  placeholder="Ingresa un monto personalizado"
                  aria-label="Monto personalizado"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Impact preview */}
            <div className="impact-preview">
              <p className="impact-preview__label">Tu impacto</p>
              <p className="impact-preview__text">{impactText}</p>
            </div>

            <button className="btn-donate" type="button">
              Donar ahora
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginLeft: 7,
                }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <p className="donate-note">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Pago 100% seguro · Cancela en cualquier momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

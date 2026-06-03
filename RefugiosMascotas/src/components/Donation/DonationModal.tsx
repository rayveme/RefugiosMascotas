import { useState, type FormEvent, type ChangeEvent } from 'react';
import Modal from '../ui/Modal/Modal';
import type { DonationFrequency } from '../../types';
import './DonationModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  amount: number | null;
  custom: string;
  freq: DonationFrequency;
}

interface CardForm {
  nombre: string;
  numero: string;
  expiry: string;
  cvv: string;
}

type Errors = Partial<Record<keyof CardForm, string>>;

function detectCardType(num: string): 'visa' | 'mastercard' | 'amex' | null {
  const raw = num.replace(/\s/g, '');
  if (/^4/.test(raw)) return 'visa';
  if (/^5[1-5]/.test(raw)) return 'mastercard';
  if (/^3[47]/.test(raw)) return 'amex';
  return null;
}

function formatCardNumber(value: string): string {
  const raw = value.replace(/\D/g, '').slice(0, 16);
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const raw = value.replace(/\D/g, '').slice(0, 4);
  if (raw.length >= 3) return raw.slice(0, 2) + '/' + raw.slice(2);
  return raw;
}

function validate(form: CardForm): Errors {
  const e: Errors = {};
  if (!form.nombre.trim()) e.nombre = 'Ingresa el nombre del titular.';
  const rawNum = form.numero.replace(/\s/g, '');
  if (!rawNum) e.numero = 'Ingresa el número de tarjeta.';
  else if (rawNum.length < 16) e.numero = 'El número debe tener 16 dígitos.';
  if (!form.expiry) e.expiry = 'Ingresa la fecha de vencimiento.';
  else {
    const [mm, yy] = form.expiry.split('/');
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy ?? '0', 10);
    const now = new Date();
    if (month < 1 || month > 12) e.expiry = 'Mes inválido.';
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
      e.expiry = 'Tarjeta vencida.';
  }
  if (!form.cvv) e.cvv = 'Ingresa el CVV.';
  else if (form.cvv.length < 3) e.cvv = 'CVV inválido.';
  return e;
}

const initialForm: CardForm = { nombre: '', numero: '', expiry: '', cvv: '' };

export default function DonationModal({ open, onClose, amount, custom, freq }: Props) {
  const [form, setForm] = useState<CardForm>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cvvFocus, setCvvFocus] = useState(false);

  const displayAmount = amount ?? (custom ? parseInt(custom, 10) : 0);
  const cardType = detectCardType(form.numero);

  const set = (field: keyof CardForm) => (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'numero') val = formatCardNumber(val);
    if (field === 'expiry') val = formatExpiry(val);
    if (field === 'cvv') val = val.replace(/\D/g, '').slice(0, 4);
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setSuccess(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
  };

  const maskedNum = form.numero
    ? form.numero.replace(/\d(?=(?:\s?\d){4})/g, '•')
    : '•••• •••• •••• ••••';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="sm"
    >
      {success ? (
        <div className="donation-success">
          <div className="donation-success__icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="donation-success__title">¡Gracias por tu donación!</h2>
          <p className="donation-success__amount">
            ${displayAmount} {freq === 'monthly' ? '/ mes' : 'única vez'}
          </p>
          <p className="donation-success__msg">
            Tu apoyo llegará directamente a los refugios. Recibirás una confirmación en tu correo pronto.
          </p>
          <button className="btn-donate" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="donation-form" noValidate>

          {/* Resumen */}
          <div className="donation-summary">
            <span className="donation-summary__label">
              {freq === 'monthly' ? 'Donación mensual' : 'Donación única'}
            </span>
            <span className="donation-summary__amount">${displayAmount}</span>
          </div>

          {/* Tarjeta visual */}
          <div className={`card-preview${cvvFocus ? ' card-preview--flip' : ''}`} aria-hidden="true">
            <div className="card-preview__front">
              <div className="card-preview__top">
                <div className="card-preview__chip" />
                {cardType === 'visa' && <span className="card-brand card-brand--visa">VISA</span>}
                {cardType === 'mastercard' && (
                  <span className="card-brand card-brand--mc">
                    <span className="mc-circle mc-circle--l" />
                    <span className="mc-circle mc-circle--r" />
                  </span>
                )}
                {cardType === 'amex' && <span className="card-brand card-brand--amex">AMEX</span>}
              </div>
              <div className="card-preview__num">{maskedNum || '•••• •••• •••• ••••'}</div>
              <div className="card-preview__bottom">
                <span className="card-preview__holder">
                  {form.nombre.toUpperCase() || 'TITULAR'}
                </span>
                <span className="card-preview__exp">
                  {form.expiry || 'MM/AA'}
                </span>
              </div>
            </div>
            <div className="card-preview__back">
              <div className="card-preview__stripe" />
              <div className="card-preview__cvv-row">
                <span className="card-preview__cvv-label">CVV</span>
                <span className="card-preview__cvv-val">{form.cvv ? '•'.repeat(form.cvv.length) : '•••'}</span>
              </div>
            </div>
          </div>

          {/* Campos */}
          <div className="donation-fields">
            <div className={`dfield${errors.nombre ? ' dfield--error' : ''}`}>
              <label className="dfield__label" htmlFor="d-nombre">
                Nombre en la tarjeta <span aria-hidden="true">*</span>
              </label>
              <input
                id="d-nombre"
                type="text"
                placeholder="Como aparece en la tarjeta"
                value={form.nombre}
                onChange={set('nombre')}
                autoComplete="cc-name"
              />
              {errors.nombre && <span className="dfield__err">{errors.nombre}</span>}
            </div>

            <div className={`dfield${errors.numero ? ' dfield--error' : ''}`}>
              <label className="dfield__label" htmlFor="d-numero">
                Número de tarjeta <span aria-hidden="true">*</span>
              </label>
              <input
                id="d-numero"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={form.numero}
                onChange={set('numero')}
                autoComplete="cc-number"
              />
              {errors.numero && <span className="dfield__err">{errors.numero}</span>}
            </div>

            <div className="dfield-row">
              <div className={`dfield${errors.expiry ? ' dfield--error' : ''}`}>
                <label className="dfield__label" htmlFor="d-expiry">
                  Vencimiento <span aria-hidden="true">*</span>
                </label>
                <input
                  id="d-expiry"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  value={form.expiry}
                  onChange={set('expiry')}
                  autoComplete="cc-exp"
                />
                {errors.expiry && <span className="dfield__err">{errors.expiry}</span>}
              </div>

              <div className={`dfield${errors.cvv ? ' dfield--error' : ''}`}>
                <label className="dfield__label" htmlFor="d-cvv">
                  CVV <span aria-hidden="true">*</span>
                </label>
                <input
                  id="d-cvv"
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  value={form.cvv}
                  onChange={set('cvv')}
                  onFocus={() => setCvvFocus(true)}
                  onBlur={() => setCvvFocus(false)}
                  autoComplete="cc-csc"
                />
                {errors.cvv && <span className="dfield__err">{errors.cvv}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-donate" disabled={submitting}>
            {submitting ? 'Procesando…' : `Donar $${displayAmount}${freq === 'monthly' ? ' / mes' : ''}`}
            {!submitting && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>

          <p className="donate-note" style={{ textAlign: 'center', marginTop: 12 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Pago 100% seguro · Cancela en cualquier momento
          </p>
        </form>
      )}
    </Modal>
  );
}

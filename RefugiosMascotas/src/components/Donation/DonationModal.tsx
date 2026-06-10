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

export default function DonationModal({ open, onClose, amount, custom, freq }: Props) {
  const displayAmount = amount ?? (custom ? parseInt(custom, 10) : 0);

  return (
    <Modal open={open} onClose={onClose} width="sm">
      <div className="donation-coming-soon">
        <div className="donation-coming-soon__icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <h2 className="donation-coming-soon__title">¡Gracias por tu generosidad!</h2>

        <p className="donation-coming-soon__amount">
          {displayAmount > 0
            ? `Querías donar $${displayAmount}${freq === 'monthly' ? ' / mes' : ''}`
            : 'Tu intención de donar nos llena de alegría'}
        </p>

        <div className="donation-coming-soon__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Próximamente disponible
        </div>

        <p className="donation-coming-soon__msg">
          El módulo de donaciones está en desarrollo. Pronto podrás apoyar directamente
          a los refugios de forma segura desde aquí.
        </p>

        <p className="donation-coming-soon__note">
          Mientras tanto, puedes contactar directamente a los refugios para hacer tu donación.
        </p>

        <button className="btn-donate" onClick={onClose}>
          Entendido
        </button>
      </div>
    </Modal>
  );
}

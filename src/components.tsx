import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  X,
  ArrowUpRight,
  Check,
  Grape,
  Wine,
  Droplets,
  FlaskConical,
  Package,
  Sprout,
  CircleHelp,
  Cylinder,
  ShoppingBag,
  Map,
  BookOpen,
  Wallet,
  TrendingUp,
  Trophy,
  Sun,
  CloudRain,
  Cloud,
  Snowflake,
  Leaf,
} from 'lucide-react';
export const icons = {
  grape: Grape,
  glass: Wine,
  water: Droplets,
  flask: FlaskConical,
  package: Package,
  sprout: Sprout,
  help: CircleHelp,
  barrel: Cylinder,
  shop: ShoppingBag,
  map: Map,
  book: BookOpen,
  wallet: Wallet,
  trend: TrendingUp,
  trophy: Trophy,
  sun: Sun,
  rain: CloudRain,
  cloud: Cloud,
  snow: Snowflake,
  leaf: Leaf,
};
export function Icon({
  name,
  size = 20,
  ...props
}: {
  name: keyof typeof icons;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={1.7} {...props} />;
}
export function Progress({
  value,
  gold = false,
}: {
  value: number;
  gold?: boolean;
}) {
  return (
    <div className={`progress ${gold ? 'gold' : ''}`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function Empty({
  icon,
  title,
  children,
  action,
  onAction,
}: {
  icon: keyof typeof icons;
  title: string;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={32} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      {action && (
        <button className="button primary" onClick={onAction}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const focusables = panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), a[href], select, [tabindex="0"]',
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === panel.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === panel.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose, title]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Done({ children }: { children: ReactNode }) {
  return (
    <span className="done-label">
      <Check size={14} />
      {children}
    </span>
  );
}

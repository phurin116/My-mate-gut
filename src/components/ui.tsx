import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useT } from '../i18n';

// ---------- Button ----------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  loading,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  block,
  icon,
  iconAfter,
  children,
  state,
}: {
  to: string;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
  children: ReactNode;
  state?: unknown;
}) {
  const cls = ['btn', `btn-${variant}`, size !== 'md' ? `btn-${size}` : '', block ? 'btn-block' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <Link to={to} className={cls} state={state}>
      {icon}
      {children}
      {iconAfter}
    </Link>
  );
}

// ---------- Form field ----------

export function Field({
  label,
  help,
  error,
  optional,
  children,
}: {
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  /** Render prop receives the ids to wire onto the control. */
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}) {
  const t = useT();
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label} {optional && <span className="opt">({t.actions.optional})</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {help && !error && (
        <p className="help" id={helpId}>
          {help}
        </p>
      )}
      {error && (
        <p className="error-text" id={errorId} role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Multi-select chip group with proper group semantics. */
export function ChipGroup<T extends string>({
  label,
  help,
  error,
  options,
  value,
  onChange,
  getLabel,
  max,
}: {
  label: string;
  help?: string;
  error?: string;
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  getLabel: (option: T) => string;
  max?: number;
}) {
  const id = useId();
  const toggle = (opt: T) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else if (!max || value.length < max) onChange([...value, opt]);
  };
  return (
    <fieldset className="field" aria-describedby={help ? `${id}-help` : undefined}>
      <legend className="label" style={{ marginBottom: 6 }}>
        {label}
      </legend>
      {help && (
        <p className="help" id={`${id}-help`} style={{ marginBottom: 4 }}>
          {help}
        </p>
      )}
      <div className="chips">
        {options.map((opt) => (
          <button key={opt} type="button" className="chip" aria-pressed={value.includes(opt)} onClick={() => toggle(opt)}>
            {getLabel(opt)}
          </button>
        ))}
      </div>
      {error && (
        <p className="error-text" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ---------- Dialog ----------

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`dialog${wide ? ' dialog-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className="dialog-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t.actions.close}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
        {footer && <div className="dialog-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{t.actions.cancel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="muted">{body}</div>
    </Dialog>
  );
}

// ---------- Toasts ----------

interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error';
  action?: { label: string; to?: string; onClick?: () => void };
}

type ToastFn = (message: string, options?: { kind?: Toast['kind']; action?: Toast['action'] }) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const push = useCallback<ToastFn>(
    (message, options) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, kind: options?.kind ?? 'success', action: options?.action }]);
      window.setTimeout(() => dismiss(id), options?.action ? 6000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast${toast.kind === 'error' ? ' is-error' : ''}`}>
              {toast.kind === 'error' ? (
                <CircleAlert size={18} aria-hidden="true" />
              ) : (
                <CircleCheck size={18} aria-hidden="true" />
              )}
              <span>{toast.message}</span>
              {toast.action?.to && (
                <Link to={toast.action.to} onClick={() => dismiss(toast.id)}>
                  {toast.action.label}
                </Link>
              )}
              {toast.action?.onClick && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick?.();
                    dismiss(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// ---------- Small display components ----------

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {children && <div className="row-wrap">{children}</div>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 14 }: { width?: number | string; height?: number | string }) {
  return <span className="skeleton" style={{ display: 'block', width, height }} aria-hidden="true" />;
}

export function Tooltip({
  text,
  children,
  align,
}: {
  text: string;
  children: ReactNode;
  align?: 'start' | 'end';
}) {
  const id = useId();
  return (
    <span className={`tip${align ? ` tip-${align}` : ''}`}>
      <span aria-describedby={id} tabIndex={0} style={{ display: 'inline-flex', borderRadius: 6 }}>
        {children}
      </span>
      <span className="tip-bubble" role="tooltip" id={id}>
        {text}
      </span>
    </span>
  );
}

export function DemoTag() {
  const t = useT();
  return (
    <Tooltip text={t.demo.labelHelp}>
      <span className="tag tag-demo">{t.demo.label}</span>
    </Tooltip>
  );
}

export function Monogram({ name, hue, size }: { name: string; hue: number; size?: 'sm' | 'lg' }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className={`monogram${size ? ` ${size}` : ''}`}
      style={{ background: `hsl(${hue} 32% 30%)` }}
      aria-hidden="true"
    >
      {letters}
    </span>
  );
}

export function PageHead({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="grow">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
      {actions && <div className="row-wrap">{actions}</div>}
    </header>
  );
}

/**
 * Short artificial delay before showing data, so list pages exercise their
 * skeleton state in demo mode exactly as they will when data comes from an API.
 */
export function useDemoLoading(key: string, ms = 350): boolean {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoadedKey(key), ms);
    return () => window.clearTimeout(timer);
  }, [key, ms]);
  return loadedKey !== key;
}

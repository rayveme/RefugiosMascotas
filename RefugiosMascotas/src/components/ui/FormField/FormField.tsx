import {
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';
import './FormField.css';

interface Common {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

type InputProps = Common & InputHTMLAttributes<HTMLInputElement> & { variant?: 'input' };
type TextareaProps = Common & TextareaHTMLAttributes<HTMLTextAreaElement> & { variant: 'textarea' };
type SelectProps = Common & SelectHTMLAttributes<HTMLSelectElement> & {
  variant: 'select';
  children: ReactNode;
};

type Props = InputProps | TextareaProps | SelectProps;

export default function FormField(props: Props) {
  const { label, name, hint, error, required } = props;
  const showError = Boolean(error);

  let control: ReactNode;
  if (props.variant === 'textarea') {
    const { label: _l, name: _n, hint: _h, error: _e, required: _r, variant: _v, ...rest } = props;
    void _l; void _n; void _h; void _e; void _r; void _v;
    control = <textarea id={name} name={name} {...rest} />;
  } else if (props.variant === 'select') {
    const { label: _l, name: _n, hint: _h, error: _e, required: _r, variant: _v, children, ...rest } = props;
    void _l; void _n; void _h; void _e; void _r; void _v;
    control = (
      <select id={name} name={name} {...rest}>
        {children}
      </select>
    );
  } else {
    const { label: _l, name: _n, hint: _h, error: _e, required: _r, variant: _v, ...rest } = props;
    void _l; void _n; void _h; void _e; void _r; void _v;
    control = <input id={name} name={name} {...rest} />;
  }

  return (
    <label className={`field${showError ? ' field--error' : ''}`} htmlFor={name}>
      <span className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true">*</span>}
      </span>
      {control}
      {showError ? (
        <span className="field__msg field__msg--error" role="alert">{error}</span>
      ) : hint ? (
        <span className="field__msg">{hint}</span>
      ) : null}
    </label>
  );
}

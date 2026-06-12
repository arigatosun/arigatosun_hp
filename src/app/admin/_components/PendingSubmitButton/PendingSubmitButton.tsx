'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

interface PendingSubmitButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  pendingLabel?: ReactNode;
}

export default function PendingSubmitButton({
  children,
  pendingLabel = '処理中...',
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      data-pending={pending ? 'true' : undefined}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

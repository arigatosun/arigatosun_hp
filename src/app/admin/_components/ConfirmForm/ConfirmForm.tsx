'use client';

import type { ReactNode } from 'react';

interface ConfirmFormProps {
  action: (formData: FormData) => Promise<void> | void;
  message: string;
  className?: string;
  children: ReactNode;
}

// Server Action を受け取り、submit 前に window.confirm でユーザー確認を取るフォーム。
// 削除など破壊的操作で使う。
export default function ConfirmForm({ action, message, className, children }: ConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {children}
    </form>
  );
}

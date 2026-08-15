import * as React from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Overlay + centered panel, header/body/footer slots — the shape every
 * module's "+ New" form uses (§10 form-view pattern), not just Patients.
 */
export function Modal({ title, onClose, children, footer }: ModalProps) {
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8 sm:items-center">
      <div className="w-full max-w-3xl rounded-lg bg-surface shadow-card" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between rounded-t-lg bg-accent px-5 py-3.5">
          <h2 className="text-[15px] font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>

        {footer && <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

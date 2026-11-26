import React, { useLayoutEffect, useRef } from 'react';

export function ModalDialog({ className = 'arena-dialog', labelledBy, label, onDismiss, children }) {
  const dialogRef = useRef(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog ref={dialogRef} className={className} aria-labelledby={labelledBy} aria-label={label}
      onCancel={(event) => { event.preventDefault(); onDismiss(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onDismiss(); }}>
      {children}
    </dialog>
  );
}


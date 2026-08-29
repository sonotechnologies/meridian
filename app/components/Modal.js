"use client";

export default function Modal({ icon, iconType = "warn", title, children, onClose, closeLabel = "Close" }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon ${iconType}`}>{icon}</div>
        <div className="modal-title">{title}</div>
        <div className="modal-text">{children}</div>
        <button className="btn-primary" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

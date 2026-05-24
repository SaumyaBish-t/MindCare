import { useEffect, useState } from "react";
import { Icon } from "../lib/icon.jsx";

// ===== Spinner =====
export const Spinner = ({ size = 18, light = false }) => (
  <span
    style={{
      width: size,
      height: size,
      border: `2px solid ${light ? "rgba(255,255,255,0.3)" : "rgba(212, 129, 107, 0.25)"}`,
      borderTopColor: light ? "#fff" : "var(--dawn-peach)",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

// ===== Modal =====
export const Modal = ({ open, onClose, title, children, danger }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {danger && (
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--dawn-danger-bg)", color: "var(--dawn-danger)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon name="alert-triangle" size={18} strokeWidth={2} />
            </div>
          )}
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete" }) => (
  <Modal open={open} onClose={onCancel} title={title} danger>
    <p style={{ color: "var(--dawn-text-secondary)", marginBottom: 20 }}>{message}</p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      <button className="btn btn-danger" onClick={onConfirm}>
        <Icon name="trash-2" size={16} /> {confirmLabel}
      </button>
    </div>
  </Modal>
);

// ===== EmptyState =====
export const EmptyState = ({ icon, title, subtitle, action }) => (
  <div style={{ textAlign: "center", padding: "64px 24px", maxWidth: 400, margin: "0 auto" }}>
    <div style={{ opacity: 0.4, display: "inline-flex", color: "var(--dawn-text-muted)" }}>
      <Icon name={icon} size={48} strokeWidth={1.25} />
    </div>
    <h3 style={{ marginTop: 16, fontWeight: 600, fontSize: 18 }}>{title}</h3>
    {subtitle && <p style={{ fontSize: 14, color: "var(--dawn-text-muted)", marginTop: 8 }}>{subtitle}</p>}
    {action && <div style={{ marginTop: 24 }}>{action}</div>}
  </div>
);

// ===== PageHeader =====
export const PageHeader = ({ icon, title, subtitle, right }) => (
  <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        {icon && (
          <div className="icon-bubble">
            <Icon name={icon} size={22} />
          </div>
        )}
        <h1>{title}</h1>
      </div>
      {subtitle && (
        <p style={{ fontSize: 15, color: "var(--dawn-text-muted)", maxWidth: 600, marginLeft: icon ? 56 : 0 }}>
          {subtitle}
        </p>
      )}
    </div>
    {right}
  </div>
);

// ===== Toast =====
export const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };
  const node = toast && (
    <div
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "var(--dawn-text-primary)", color: "#fff",
        padding: "12px 20px", borderRadius: 999,
        fontSize: 14, fontWeight: 500,
        display: "flex", alignItems: "center", gap: 8,
        zIndex: 1000, boxShadow: "var(--shadow-soft)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <Icon
        name={toast.type === "success" ? "check-circle-2" : "info"}
        size={16}
        strokeWidth={2}
        color={toast.type === "success" ? "#a8e8c0" : "#ffd589"}
      />
      {toast.msg}
    </div>
  );
  return { show, node };
};

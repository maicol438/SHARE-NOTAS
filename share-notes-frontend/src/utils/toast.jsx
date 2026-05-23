import toast from "react-hot-toast";

export const showToast = (message, type = "success", options = {}) => {
  const { duration = 3500, ...rest } = options;

  const icons = {
    success: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const config = {
    success: {
      iconColor:   "#10b981",
      iconBg:      "rgba(16,185,129,0.15)",
      iconBorder:  "rgba(16,185,129,0.35)",
      glowColor:   "rgba(16,185,129,0.25)",
      borderColor: "rgba(16,185,129,0.3)",
      barColor:    "#10b981",
    },
    error: {
      iconColor:   "#f43f5e",
      iconBg:      "rgba(244,63,94,0.15)",
      iconBorder:  "rgba(244,63,94,0.35)",
      glowColor:   "rgba(244,63,94,0.25)",
      borderColor: "rgba(244,63,94,0.3)",
      barColor:    "#f43f5e",
    },
    info: {
      iconColor:   "#60a5fa",
      iconBg:      "rgba(96,165,250,0.15)",
      iconBorder:  "rgba(96,165,250,0.35)",
      glowColor:   "rgba(96,165,250,0.25)",
      borderColor: "rgba(96,165,250,0.3)",
      barColor:    "#60a5fa",
    },
  };

  const c = config[type] || config.success;

  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px 18px",
          borderRadius: "16px",
          minWidth: "340px",
          maxWidth: "440px",
          background: "rgba(5, 5, 15, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${c.borderColor}`,
          boxShadow: `0 0 40px ${c.glowColor}, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
          position: "relative",
          overflow: "hidden",
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateX(0) scale(1)" : "translateX(40px) scale(0.93)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top glow bar */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${c.barColor}, transparent)`,
          opacity: 0.8,
        }} />

        {/* Outer glow ring */}
        <div style={{
          position: "absolute",
          top: "-2px", left: "-2px", right: "-2px", bottom: "-2px",
          borderRadius: "18px",
          background: `linear-gradient(135deg, ${c.iconColor}22, transparent 50%, ${c.iconColor}22)`,
          zIndex: -1,
        }} />

        {/* Icon */}
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          flexShrink: 0,
          color: c.iconColor,
          background: c.iconBg,
          border: `1px solid ${c.iconBorder}`,
          boxShadow: `0 0 20px ${c.glowColor}, inset 0 0 10px ${c.glowColor}`,
        }}>
          {icons[type] || icons.success}
        </span>

        {/* Message */}
        <span style={{
          flex: 1,
          fontSize: "14px",
          fontWeight: 600,
          color: "#e2e8f0",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
        }}>
          {message}
        </span>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            flexShrink: 0,
            color: "rgba(161,161,170,0.7)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(161,161,170,0.7)";
          }}
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    ),
    { duration, ...rest }
  );
};

export default showToast;

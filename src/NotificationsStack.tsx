import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const COUNT = 3;
const HEIGHT = 64;
const GAP = 8;
const PEEK = 8;

const stackVariants: Variants = {
  open: { y: 20, scale: 0.95, cursor: "pointer" },
  closed: { y: 0, scale: 1, cursor: "default" },
};

const headerVariants: Variants = {
  open: { y: 0, scale: 1, opacity: 1 },
  closed: { y: 60, scale: 0.8, opacity: 0 },
};

const notifications = [
  { app: "Messages", title: "Như", body: "Gặp em lúc 7 giờ nhé?", time: "9:41" },
  { app: "Mail", title: "Hộp thư", body: "2 tin nhắn mới", time: "9:38" },
  { app: "Calendar", title: "Cuộc họp", body: "Họp nhanh sau 10 phút", time: "9:30" },
];

export default function NotificationsStack() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  return (
    <AnimatePresence>
      {!hidden && (
        <>
          {isOpen && (
            <div
              className="fixed inset-0 z-[10000]"
              onClick={() => setIsOpen(false)}
            />
          )}
          <motion.div
            className="fixed top-20 left-0 right-0 px-4 z-[10001] font-sans pointer-events-none [&_*]:pointer-events-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <motion.div
              style={stackStyle}
              variants={stackVariants}
              initial={false}
              animate={isOpen ? "open" : "closed"}
              transition={{ type: "spring", mass: 0.7 }}
            >
              <Header
                isOpen={isOpen}
                onCollapse={() => setIsOpen(false)}
                onClear={() => {
                  setIsOpen(false);
                  setHidden(true);
                }}
              />
              {Array.from({ length: COUNT }).map((_, i) => (
                <Notification
                  key={i}
                  index={i}
                  data={notifications[i]}
                  onClick={() => setIsOpen((v) => !v)}
                />
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Header({
  isOpen,
  onCollapse,
  onClear,
}: {
  isOpen: boolean;
  onCollapse: () => void;
  onClear: () => void;
}) {
  return (
    <motion.div
      style={headerStyle}
      variants={headerVariants}
      transition={{ type: "spring", stiffness: 600, damping: 50, delay: isOpen ? 0.2 : 0 }}
    >
      <motion.h2 style={titleStyle}>Thông báo</motion.h2>
      <div style={btnRowStyle}>
        <motion.button
          style={collapseBtnStyle}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          onClick={onClear}
        >
          Xóa tất cả
        </motion.button>
        <motion.button
          style={collapseBtnStyle}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.25)" }}
          onClick={onCollapse}
        >
          Thu gọn
        </motion.button>
      </div>
    </motion.div>
  );
}

function Notification({
  index,
  data,
  onClick,
}: {
  index: number;
  data: { app: string; title: string; body: string; time: string };
  onClick: () => void;
}) {
  const widthScale = 1 - index * 0.06;

  const variants: Variants = {
    open: {
      y: 0,
      scaleX: 1,
      pointerEvents: "auto",
      cursor: "pointer",
    },
    closed: {
      y: -index * (HEIGHT + GAP - PEEK),
      scaleX: widthScale,
      pointerEvents: index === 0 ? "auto" : "none",
      cursor: index === 0 ? "pointer" : "default",
    },
  };

  const contentVariants: Variants = {
    open: { opacity: 1 },
    closed: { opacity: index === 0 ? 1 : 0 },
  };

  return (
    <motion.div
      style={notificationStyle(index)}
      variants={variants}
      transition={{ type: "spring", stiffness: 600, damping: 50, delay: index * 0.04 }}
      onClick={onClick}
    >
      <motion.div
        style={innerStyle}
        variants={contentVariants}
        transition={{ duration: 0.15 }}
      >
        <div style={iconStyle} />
        <div style={contentStyle}>
          <div style={titleRowStyle}>{data.title}</div>
          <div style={bodyStyle}>{data.body}</div>
        </div>
        <div style={timeStyle}>{data.time}</div>
      </motion.div>
    </motion.div>
  );
}

const stackStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: GAP,
};

const headerStyle: React.CSSProperties = {
  position: "absolute",
  top: -40,
  left: 0,
  height: 28,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transformOrigin: "bottom center",
  pointerEvents: "none",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
  marginLeft: 8,
  color: "#ffffff",
  fontWeight: 600,
};

const btnRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginRight: 8,
};

const collapseBtnStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1,
  backgroundColor: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  color: "#ffffff",
  padding: "4px 12px",
  height: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  cursor: "pointer",
  pointerEvents: "auto",
  userSelect: "none",
  border: "none",
};

function notificationStyle(index: number): React.CSSProperties {
  return {
    position: "relative",
    height: HEIGHT,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 24,
    zIndex: COUNT - index,
    userSelect: "none",
    boxShadow: "0 8px 40px rgba(0,0,0,0.20)",
    transformOrigin: "top center",
    color: "#ffffff",
  };
}

const innerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
};

const iconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 9,
  background: "linear-gradient(135deg, #6366f1, #ec4899)",
  flexShrink: 0,
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 0,
  overflow: "hidden",
  color: "#ffffff",
};

const titleRowStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  lineHeight: "17px",
  color: "#ffffff",
};

const bodyStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 400,
  lineHeight: "18px",
  color: "#ffffff",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const timeStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 400,
  color: "rgba(255,255,255,0.75)",
  alignSelf: "flex-start",
  flexShrink: 0,
};

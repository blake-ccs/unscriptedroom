import { motion, AnimatePresence } from "framer-motion";
import { PropsWithChildren } from "react";

type Props = {
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  width?: number;
};

export default function Dropdown({
  open,
  onMouseEnter,
  onMouseLeave,
  width = 280,
  children
}: PropsWithChildren<Props>) {
  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2"
          >
            <div
              className="card border-gray-200"
              style={{ width }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

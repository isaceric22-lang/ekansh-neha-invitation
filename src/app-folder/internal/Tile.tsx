import { motion } from "framer-motion";

export function Tile({
  iconSrc,
  label,
  layoutId,
}: {
  iconSrc: string;
  label: string;
  layoutId?: string;
}) {
  return (
    <motion.img
      className="w-full h-full"
      src={iconSrc}
      alt={label}
      aria-label={label}
      layoutId={layoutId}
      draggable={false}
    />
  );
}

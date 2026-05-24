// Thin wrapper around lucide-react so pages can do <Icon name="heart" size={18} />.
// Falls back to a square placeholder if the icon name doesn't exist.
import * as Lucide from "lucide-react";

function toPascal(name) {
  return name
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

export function Icon({ name, size = 18, strokeWidth = 1.5, color, style = {}, className = "" }) {
  const Comp = Lucide[toPascal(name)] || Lucide.Circle;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        color,
        ...style,
      }}
    >
      <Comp size={size} strokeWidth={strokeWidth} />
    </span>
  );
}

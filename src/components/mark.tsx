import logo from "@/assets/grbw-mark.png.asset.json";

export function Mark({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="GRBW community emblem"
      className={`mark-glow select-none object-contain ${className}`}
      draggable={false}
    />
  );
}

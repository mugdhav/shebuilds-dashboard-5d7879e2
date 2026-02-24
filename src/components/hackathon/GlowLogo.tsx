import shebuildsLogo from "@/assets/shebuilds-logo-white.png";

export function GlowLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} data-testid="glow-logo">
      <img src={shebuildsLogo} alt="SheBuilds" className="h-10" />
    </div>
  );
}

export function GlowLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`} data-testid="glow-logo">
      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        SheBuilds
      </span>
    </div>
  );
}

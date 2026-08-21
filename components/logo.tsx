import Image from "next/image";

export function Logo({
  className = "",
  size = "md",
  variant = "compact",
  showWordmark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "compact" | "full";
  showWordmark?: boolean;
}) {
  if (variant === "full") {
    return (
      <div className={`flex items-center ${className}`}>
        <Image
          src="/brand/logo.png"
          alt="StewardOS — FAITHFUL. WISE. PROSPEROUS."
          width={220}
          height={48}
          className="h-8 sm:h-9 md:h-10 w-auto object-contain"
          priority
        />
      </div>
    );
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${iconSizes[size]} shrink-0 overflow-hidden rounded-lg`}>
        <Image
          src="/brand/icon.png"
          alt="StewardOS Icon"
          width={36}
          height={36}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-zinc-900 leading-none ${textSizes[size]}`}>
            StewardOS
          </span>
        </div>
      )}
    </div>
  );
}

export function WordmarkLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/brand/logo.png"
        alt="StewardOS — FAITHFUL. WISE. PROSPEROUS."
        width={220}
        height={48}
        className="h-10 w-auto object-contain"
        priority
      />
    </div>
  );
}

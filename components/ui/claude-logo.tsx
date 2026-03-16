"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const CLAUDE_LOGO_SRC = "/claude-logo.png";

interface ClaudeLogoIconProps {
  className?: string;
  size?: number;
}

/** Claude logo (starburst) for UI branding — used site-wide for authenticity */
export function ClaudeSparkle({ className, size = 20 }: ClaudeLogoIconProps) {
  return (
    <Image
      src={CLAUDE_LOGO_SRC}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
      unoptimized
    />
  );
}

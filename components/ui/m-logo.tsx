import React from "react";

interface MLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  strokeColor?: string;
}

export default function MLogo({
  size = 44,
  className = "",
  strokeColor = "currentColor",
  ...props
}: MLogoProps) {
  return (
    <img
      src="/logo-m.png"
      alt="MPSS Logo"
      width={size}
      height={size}
      className={`object-contain mix-blend-multiply ${className}`}
      style={{ width: size, height: size }}
      {...(props as any)}
    />
  );
}

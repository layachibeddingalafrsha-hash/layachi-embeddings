import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export default function Logo({
  className = '',
  width = 64, // Default smaller width since it's a square logo
  height = 64,
}: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 shadow-md ${className}`} style={{ width, height }}>
      <Image
        src="/logo.jpg"
        alt="Layachi Bedding Logo"
        fill
        className="object-cover"
        sizes={`${width}px`}
        priority
      />
    </div>
  );
}


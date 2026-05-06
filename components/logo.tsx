import Image from "next/image"

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div 
      className={`relative ${className || 'h-12 w-48'}`}
    >
      <Image
        src="/Logo Novo Heritage.svg"
        alt="Novo Heritage Logo"
        fill
        className="object-contain brightness-0 invert"
        priority
      />
    </div>
  )
}

import Image from "next/image"

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        height: '3.5rem', 
        width: '12rem',
        minHeight: '40px',
        minWidth: '140px'
      }}
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

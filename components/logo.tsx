import Image from "next/image"

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`relative h-16 w-56 ${className}`}>
      <Image
        src="/Logo Novo Heritage.svg"
        alt="Novo Heritage Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

import { Logo } from "@/components/logo"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface MobileHeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  handleMobileNavClick: (elementId: string) => void
  isIntroFinished?: boolean
}

export function MobileHeader({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleMobileNavClick,
  isIntroFinished = true
}: MobileHeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] flex w-full flex-row items-center justify-between rounded-none bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-premium md:hidden px-6 py-4 transition-all duration-1000 ${!isIntroFinished ? "opacity-10 pointer-events-none blur-sm" : "opacity-100 blur-0"}`}>
      <Link
        className="flex items-center justify-center gap-2 active:scale-95 transition-transform"
        href="/"
      >
        <Logo className="h-12 w-44 scale-[1.15] origin-left brightness-0 invert" />
      </Link>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-none bg-white/5 border border-white/10 transition-all active:scale-90"
        aria-label="Toggle menu"
      >
        <div className="flex flex-col items-center justify-center w-8 h-8 space-y-2 p-1">
          <motion.span
            animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className={`block w-5 h-0.5 ${isMobileMenuOpen ? "bg-foreground" : "bg-foreground"} rounded-none transition-colors`}
          ></motion.span>
          <motion.span
            animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            className="block w-5 h-0.5 bg-foreground rounded-none transition-colors"
          ></motion.span>
          <motion.span
            animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className={`block w-5 h-0.5 ${isMobileMenuOpen ? "bg-foreground" : "bg-foreground"} rounded-none transition-colors`}
          ></motion.span>
        </div>
      </button>
    </header>
  )
}
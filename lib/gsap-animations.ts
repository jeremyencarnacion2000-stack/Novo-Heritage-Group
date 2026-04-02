import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)
}

// Enhanced animation utilities for sophisticated interactions
export class GSAPAnimations {
  static init() {
    // Set default properties for better performance
    gsap.set('.gsap-element', {
      opacity: 0,
      y: 30,
      scale: 0.98
    })

    gsap.set('.gsap-scroll-element', {
      opacity: 0,
      y: 40,
      scale: 0.95
    })
  }

  // Hero section animations with parallax
  static heroAnimations() {
    const tl = gsap.timeline()

    // Logo animation
    tl.fromTo('.hero-logo',
      { opacity: 0, y: -20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' }
    )

    // Title animation with stagger
    tl.fromTo('.hero-title .word',
      { opacity: 0, y: 40, rotateX: -15 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      },
      '-=0.4'
    )

    // Subtitle animation
    tl.fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )

    // CTA buttons with stagger
    tl.fromTo('.hero-cta',
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      },
      '-=0.2'
    )

    // Stats animation
    tl.fromTo('.hero-stats .stat-item',
      { opacity: 0, scale: 0.8, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      },
      '-=0.4'
    )

    return tl
  }

  // Scroll-triggered animations for sections
  static sectionAnimations() {
    if (typeof window === 'undefined') return

    // Category showcase animations
    gsap.utils.toArray('.category-card').forEach((card: any, index) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateY: index % 2 === 0 ? -10 : 10
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // Testimonial carousel animations
    gsap.fromTo('.testimonial-card',
      { opacity: 0, x: -50, scale: 0.95 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.testimonial-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }

  // Enhanced button hover animations
  static buttonAnimations() {
    if (typeof window === 'undefined') return

    document.querySelectorAll('.btn-hover-lift').forEach((btn) => {
      const handleMouseEnter = () => {
        gsap.to(btn, {
          y: -4,
          scale: 1.03,
          duration: 0.3,
          ease: 'power2.out'
        })
      }

      const handleMouseLeave = () => {
        gsap.to(btn, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      }

      btn.addEventListener('mouseenter', handleMouseEnter)
      btn.addEventListener('mouseleave', handleMouseLeave)
    })

    // Logo animations in navigation
    document.querySelectorAll('.nav-logo').forEach((logo) => {
      const handleMouseEnter = () => {
        gsap.to(logo, {
          scale: 1.2,
          rotation: 15,
          duration: 0.4,
          ease: 'back.out(1.7)'
        })
      }

      const handleMouseLeave = () => {
        gsap.to(logo, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: 'back.out(1.7)'
        })
      }

      logo.addEventListener('mouseenter', handleMouseEnter)
      logo.addEventListener('mouseleave', handleMouseLeave)
    })
  }

  // Advanced scroll animations with ScrollTrigger
  static advancedScrollAnimations() {
    if (typeof window === 'undefined') return

    // Hero section parallax
    gsap.to('.hero-bg', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })

    // Text reveal animations
    gsap.utils.toArray('.text-reveal').forEach((element: any) => {
      const split = new SplitText(element, { type: 'chars, words' })

      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      })
    })

    // Stagger animations for cards
    gsap.utils.toArray('.stagger-cards .card').forEach((card: any, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      })
    })

    // Pinning animations
    gsap.utils.toArray('.pin-section').forEach((section: any) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: true,
        pinSpacing: false
      })
    })

    // Morphing shapes
    gsap.utils.toArray('.morph-shape').forEach((shape: any) => {
      gsap.to(shape, {
        morphSVG: shape.dataset.morphTo || 'M0,0 L100,0 L100,100 L0,100 Z',
        duration: 2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: shape,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true
        }
      })
    })

    // 3D card rotations
    gsap.utils.toArray('.card-3d').forEach((card: any) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10

        gsap.to(card, {
          rotationY: rotateY,
          rotationX: rotateX,
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
      })
    })

    // Counter animations
    gsap.utils.toArray('.counter').forEach((counter: any) => {
      const target = parseInt(counter.dataset.target || '0')

      gsap.from(counter, {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        onUpdate: function() {
          counter.textContent = Math.ceil(this.targets()[0].textContent)
        }
      })
    })

    // Image reveal animations
    gsap.utils.toArray('.image-reveal').forEach((image: any) => {
      gsap.from(image, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: image,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      })
    })

    // Floating elements
    gsap.utils.toArray('.float-element').forEach((element: any, index) => {
      gsap.to(element, {
        y: 'random(-20, 20)',
        x: 'random(-10, 10)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 6)',
        ease: 'none',
        repeat: -1,
        yoyo: true,
        delay: index * 0.5
      })
    })
  }

  // Card hover effects with GSAP
  static cardAnimations() {
    if (typeof window === 'undefined') return

    document.querySelectorAll('.card-premium').forEach((card) => {
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          duration: 0.4,
          ease: 'power2.out',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        })
      }

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)
    })
  }

  // Parallax background effects
  static parallaxEffects() {
    if (typeof window === 'undefined') return

    gsap.utils.toArray('.parallax-bg').forEach((bg: any) => {
      gsap.to(bg, {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: bg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    })
  }

  // Initialize all animations
  static initialize() {
    if (typeof window === 'undefined') return

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.init()
        this.heroAnimations()
        this.sectionAnimations()
        this.buttonAnimations()
        this.cardAnimations()
        this.parallaxEffects()
        this.advancedScrollAnimations()
      })
    } else {
      this.init()
      this.heroAnimations()
      this.sectionAnimations()
      this.buttonAnimations()
      this.cardAnimations()
      this.parallaxEffects()
      this.advancedScrollAnimations()
    }
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  GSAPAnimations.initialize()
}

export default GSAPAnimations
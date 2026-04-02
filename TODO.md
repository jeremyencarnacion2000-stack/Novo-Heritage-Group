# TODO: System Improvements and Optimizations

## Completed Tasks ✅
- [x] Update app/globals.css: Refine brand colors (deeper blue primary, richer gold secondary) and improve dark mode contrast
- [x] Update components/chatbot.tsx: Add backdrop-blur-sm to chat window for better visibility
- [x] Re-enable GL particle background with @react-three/fiber (components/gl/index.tsx)
- [x] Connect chatbot to /api/chat using ai-sdk with streaming + error handling
- [x] Guard GSAP ScrollSmoother to avoid SSR issues and clean triggers (app/page.tsx)
- [x] Add /api/log endpoint + client logger hook for observability
- [x] Wrap landing sections with ClientErrorBoundary for graceful degradation
- [x] Update app/settings/page.tsx: Add sections for profile, notifications, language, and account management
- [x] Add animations: Scroll animations, smooth scrolling, button animations
- [x] Improve dark theme visibility: Fix section headers and text contrast
- [x] Make settings functional: Implement language change
- [x] Update home section: Make login optional, add alternative ways to start session
- [x] Add scroll animations to all sections: CategoryShowcase, Testimonials, MissionVision, ContactSection
- [x] Improve next.config.mjs: Enable proper linting and TypeScript checking
- [x] Enhance color scheme: Better contrast ratios for accessibility (WCAG AA compliance)
- [x] Update theme toggle: Add Spanish labels and visual feedback
- [x] Fix page.tsx: Improve button styling and consistency
- [x] Update .env.local: Correct NEXTAUTH_URL to localhost:3001

## Pending Tasks 📋
- [ ] Test all color combinations in light and dark modes
- [ ] Verify accessibility (WCAG AA/AAA compliance)
- [ ] Performance optimization: Image lazy loading
- [ ] Add error boundaries to critical components
- [ ] Implement proper error logging service
- [ ] Add loading states to all async operations
- [ ] Create comprehensive error handling documentation
- [ ] Set up monitoring and analytics
- [ ] Integrate 3D scene (Model3D + GL) into hero once asset pipeline is ready
- [ ] Document chatbot API usage limits and fallback behavior

## Known Issues 🐛
- GLTF assets still disabled—Model3D renders placeholder cube
- Accessibility verification outstanding (contrast, focus states)
- No centralized error logging/monitoring (Sentry/Mixpanel pending)

## Observability Notes 🛰️
- Use `useClientLogger` or `sendClientLog` to report client-side issues to `/api/log`.
- Wrap critical UI areas with `<ClientErrorBoundary name="SectionName">` to capture runtime errors without breaking the whole page.

## Performance Metrics 📊
- Server running on port 3001
- All components properly typed with TypeScript
- ESLint enabled for code quality
- Proper color contrast ratios implemented

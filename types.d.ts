// Global type declarations for modules without proper TypeScript definitions

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    strokeWidth?: string | number;
  }
  
  export type Icon = ComponentType<IconProps>;
  
  // Common icons used in the project
  export const Shield: Icon;
  export const Building2: Icon;
  export const Plane: Icon;
  export const ArrowRight: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Mail: Icon;
  export const Lock: Icon;
  export const User: Icon;
  export const Sparkles: Icon;
  export const Zap: Icon;
  export const MessageCircle: Icon;
  export const X: Icon;
  export const Send: Icon;
  export const Loader2: Icon;
  export const Volume2: Icon;
  export const Copy: Icon;
  export const ThumbsUp: Icon;
  
  // Additional icons needed for the project
  export const Users: Icon;
  export const Bell: Icon;
  export const BarChart3: Icon;
  export const Settings: Icon;
  export const TrendingUp: Icon;
  export const Target: Icon;
  export const Bed: Icon;
  export const Bath: Icon;
  export const Maximize: Icon;
  export const MapPin: Icon;
  export const Calendar: Icon;
  export const Heart: Icon;
  export const Star: Icon;
  export const CreditCard: Icon;
  export const Check: Icon;
  export const AlertCircle: Icon;
  export const Search: Icon;
  export const ShoppingCart: Icon;
  export const Trash2: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const Hash: Icon;
  export const Building: Icon;
  export const Car: Icon;
  export const Award: Icon;
  export const FileText: Icon;
  export const Home: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Quote: Icon;
  export const TriangleAlert: Icon;
  export const RefreshCw: Icon;
  export const CircleHelp: Icon;
  export const ArrowLeft: Icon;
  export const ThumbsDown: Icon;
  export const DollarSign: Icon;
  export const Activity: Icon;
  export const Download: Icon;
  export const Filter: Icon;
  export const Castle: Icon;
  export const Warehouse: Icon;
  export const SlidersHorizontal: Icon;
  export const Lightbulb: Icon;
  export const Phone: Icon;
  export const CheckCircle2: Icon;
  export const Calculator: Icon;
  export const Share2: Icon;
  export const Percent: Icon;
  export const Clock: Icon;
  export const Info: Icon;
  export const TrendingDown: Icon;
  export const ArrowUpRight: Icon;
  export const ArrowDownRight: Icon;
  export const Facebook: Icon;
  export const Instagram: Icon;
  export const Twitter: Icon;
  export const Linkedin: Icon;
}

declare module 'r3f-perf' {
  import { ComponentType } from 'react';
  
  export const Perf: ComponentType;
}

declare module '@react-three/drei' {
  import { ComponentType } from 'react';
  
  export const Effects: ComponentType;
}

// Model Viewer Web Component Types
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

interface ModelViewerJSX {
  src?: string;
  alt?: string;
  poster?: string;
  'ios-src'?: string;
  'camera-orbit'?: string;
  'camera-target'?: string;
  'field-of-view'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
  'camera-controls'?: boolean;
  'disable-zoom'?: boolean;
  'disable-pan'?: boolean;
  'disable-tap'?: boolean;
  'auto-rotate'?: boolean;
  'auto-rotate-delay'?: number;
  'rotation-per-second'?: string;
  'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
  'interaction-prompt-style'?: 'basic' | 'wiggle';
  'interaction-prompt-threshold'?: number;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  ar?: boolean;
  'ar-modes'?: string;
  'ar-scale'?: 'auto' | 'fixed';
  'ar-placement'?: 'floor' | 'wall';
  'ar-status'?: string;
  'xr-environment'?: boolean;
  'skybox-image'?: string;
  'environment-image'?: string;
  exposure?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  'animation-name'?: string;
  'animation-crossfade-duration'?: number;
  autoplay?: boolean;
  bounds?: 'tight' | 'legacy';
  'interpolation-decay'?: number;
  'min-field-of-view'?: string;
  'max-field-of-view'?: string;
  'tone-mapping'?: 'auto' | 'commerce' | 'neutral';
  ref?: React.Ref<HTMLElement & {
    cameraOrbit?: string;
    cameraTarget?: string;
    fieldOfView?: string;
    play?: () => void;
    pause?: () => void;
    getCameraOrbit?: () => { theta: number; phi: number; radius: number };
    getCameraTarget?: () => { x: number; y: number; z: number };
    jumpCameraToGoal?: () => void;
    resetTurntableRotation?: () => void;
    orientToPoint?: (x: number, y: number, z: number) => void;
  }>;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
import {
  Activity,
  Bike,
  Bot,
  Coins,
  GraduationCap,
  HeartPulse,
  Package,
  Pill,
  Salad,
  ScanEye,
  SolarPanel,
  BarChart3,
  BookOpen,
  Cloud,
  Compass,
  Flame,
  Flower2,
  Home,
  Layers,
  Leaf,
  Moon,
  Mountain,
  Route,
  Signal,
  Sofa,
  Sprout,
  Sun,
  Ticket,
  TreePine,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { LogoSpec, Startup } from '../domain/types';

/**
 * Original generated logos for demo companies.
 * Shapes, colours and marks vary per company so the marketplace does not look
 * uniform. No real brand marks are reproduced.
 */

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  leaf: Leaf,
  layers: Layers,
  route: Route,
  pulse: Activity,
  home: Home,
  compass: Compass,
  sprout: Sprout,
  mountain: Mountain,
  chili: Flame,
  sun: Sun,
  signal: Signal,
  waves: Waves,
  flower: Flower2,
  ticket: Ticket,
  cloud: Cloud,
  tree: TreePine,
  chart: BarChart3,
  moon: Moon,
  sofa: Sofa,
  bolt: Zap,
  heart: HeartPulse,
  pill: Pill,
  cap: GraduationCap,
  coins: Coins,
  bot: Bot,
  scan: ScanEye,
  salad: Salad,
  panel: SolarPanel,
  box: Package,
  bike: Bike,
};

const FONTS = {
  sans: "'Inter Variable', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
};

function radiusFor(shape: LogoSpec['shape'], size: number): string {
  switch (shape) {
    case 'circle':
      return '50%';
    case 'pill':
      return `${size * 0.3}px`;
    case 'tab':
      return `${size * 0.36}px ${size * 0.12}px ${size * 0.36}px ${size * 0.12}px`;
    default:
      return `${Math.round(size * 0.22)}px`;
  }
}

const CLIP: Partial<Record<LogoSpec['shape'], string>> = {
  hex: 'polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0 50%)',
  diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
};

export function CompanyLogo({ company, size = 44 }: { company: Pick<Startup, 'name' | 'logo'>; size?: number }) {
  const spec = company.logo;
  const Icon = spec.kind === 'icon' ? ICONS[spec.mark] : undefined;
  const letters = spec.kind === 'letters' ? spec.mark : company.name.slice(0, 1);
  const inner = CLIP[spec.shape] ? 0.82 : 1;
  const fontSize = (letters.length > 2 ? 0.3 : letters.length === 2 ? 0.36 : 0.46) * size * inner;
  return (
    <span
      className="clogo"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: spec.bg,
        color: spec.fg,
        borderRadius: CLIP[spec.shape] ? 0 : radiusFor(spec.shape, size),
        clipPath: CLIP[spec.shape],
      }}
    >
      {Icon ? (
        <Icon size={Math.round(size * 0.5 * inner)} strokeWidth={2.2} />
      ) : (
        <span
          style={{
            fontFamily: FONTS[spec.font ?? 'sans'],
            fontSize,
            fontWeight: spec.font === 'serif' ? 700 : 800,
            letterSpacing: spec.font === 'mono' ? 0 : '-0.02em',
            lineHeight: 1,
          }}
        >
          {letters}
        </span>
      )}
      {spec.accent && (
        <span
          className="clogo-accent"
          style={{
            background: spec.accent,
            width: size * 0.18,
            height: size * 0.18,
            right: CLIP[spec.shape] ? size * 0.2 : size * 0.12,
            top: CLIP[spec.shape] ? size * 0.22 : size * 0.12,
          }}
        />
      )}
    </span>
  );
}

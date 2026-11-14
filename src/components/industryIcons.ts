import {
  BrainCircuit,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Landmark,
  LayoutGrid,
  Leaf,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { IndustryId } from '../domain/types';

export const INDUSTRY_ICONS: Record<IndustryId, LucideIcon> = {
  fintech: Landmark,
  healthtech: HeartPulse,
  edtech: GraduationCap,
  ecommerce: ShoppingBag,
  ai: BrainCircuit,
  saas: LayoutGrid,
  foodtech: UtensilsCrossed,
  climate: Leaf,
  creative: Clapperboard,
  logistics: Truck,
};

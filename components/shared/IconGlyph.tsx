import { Package } from 'lucide-react';
import { ICON_REGISTRY, IconKey } from '@/lib/iconRegistry';
import { cn } from '@/lib/utils';

interface IconGlyphProps {
  icon?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function IconGlyph({ icon, size = 18, className, style }: IconGlyphProps) {
  const Icon = (icon && ICON_REGISTRY[icon as IconKey]) || Package;
  return <Icon size={size} className={cn(className)} style={style} />;
}

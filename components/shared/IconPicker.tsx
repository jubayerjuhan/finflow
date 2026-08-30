import { ICON_REGISTRY, IconKey } from '@/lib/iconRegistry';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  keys: IconKey[];
  value: string;
  onChange: (key: IconKey) => void;
}

export default function IconPicker({ keys, value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {keys.map((key) => {
        const Icon = ICON_REGISTRY[key];
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={key}
            className={cn(
              'w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-110',
              isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <Icon size={19} />
          </button>
        );
      })}
    </div>
  );
}

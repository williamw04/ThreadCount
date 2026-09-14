import { COMMON_COLORS } from '../types';
import { clsx } from 'clsx';

/**
 * Multi-select color filter for the wardrobe page.
 * Color values are matched against the AI-detected `colors` array on wardrobe items.
 * Selection is additive — multiple colors can be active simultaneously,
 * and the backend returns items matching any of the selected colors.
 * The hex map below is for UI swatch display only; the API uses color name strings.
 */

interface ColorFilterProps {
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  navy: '#000080',
  blue: '#0000FF',
  red: '#FF0000',
  green: '#008000',
  yellow: '#FFFF00',
  orange: '#FFA500',
  pink: '#FFC0CB',
  purple: '#800080',
  brown: '#A52A2A',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
  tan: '#D2B48C',
  burgundy: '#800020',
  teal: '#008080',
  coral: '#FF7F50',
  olive: '#808000',
  charcoal: '#36454F',
};

export function ColorFilter({ selectedColors, onColorChange }: ColorFilterProps) {
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  return (
    <div
      aria-label="Filter wardrobe by color"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      role="group"
    >
      {COMMON_COLORS.map((name) => (
        <button
          key={name}
          aria-label={`Filter by ${name}`}
          aria-pressed={selectedColors.includes(name)}
          className={clsx(
            'flex min-h-12 items-center gap-3 border px-3 py-2 text-left transition-colors',
            selectedColors.includes(name)
              ? 'border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]'
              : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
          )}
          onClick={() => toggleColor(name)}
          title={name}
          type="button"
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 border border-[var(--border-strong)]"
            style={{ backgroundColor: COLOR_MAP[name] }}
          />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{name}</span>
        </button>
      ))}
    </div>
  );
}

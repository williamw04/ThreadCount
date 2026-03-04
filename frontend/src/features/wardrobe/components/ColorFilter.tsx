import { clsx } from 'clsx';

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
      onColorChange(selectedColors.filter(c => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(COLOR_MAP).map(([name, hex]) => (
        <button
          key={name}
          onClick={() => toggleColor(name)}
          title={name}
          className={clsx(
            'w-6 h-6 rounded-full border-2 transition-all',
            selectedColors.includes(name) 
              ? 'border-[var(--text-primary)] scale-110' 
              : 'border-transparent hover:scale-105'
          )}
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  );
}

import { clsx } from 'clsx';
import { SEASONS, SEASON_LABELS, type Season } from '../types';

/**
 * Multi-select season filter for the wardrobe page.
 * Like the color filter, selections are additive and matched against
 * the AI-detected `seasons` array on wardrobe items.
 */

interface SeasonFilterProps {
  selectedSeasons: Season[];
  onSeasonChange: (seasons: Season[]) => void;
}

export function SeasonFilter({ selectedSeasons, onSeasonChange }: SeasonFilterProps) {
  const toggleSeason = (season: Season) => {
    if (selectedSeasons.includes(season)) {
      onSeasonChange(selectedSeasons.filter((s) => s !== season));
    } else {
      onSeasonChange([...selectedSeasons, season]);
    }
  };

  return (
    <div aria-label="Filter wardrobe by season" className="flex flex-wrap gap-2" role="group">
      {SEASONS.map((season) => (
        <button
          key={season}
          onClick={() => toggleSeason(season)}
          type="button"
          aria-pressed={selectedSeasons.includes(season)}
          className={clsx(
            'border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap transition-colors',
            selectedSeasons.includes(season)
              ? 'border-[var(--border-strong)] bg-[var(--surface-inverse)] text-[var(--text-inverse)]'
              : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
          )}
        >
          {SEASON_LABELS[season]}
        </button>
      ))}
    </div>
  );
}

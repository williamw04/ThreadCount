import { clsx } from 'clsx';
import { SEASONS, SEASON_LABELS, type Season } from '../types';

interface SeasonFilterProps {
  selectedSeasons: Season[];
  onSeasonChange: (seasons: Season[]) => void;
}

export function SeasonFilter({ selectedSeasons, onSeasonChange }: SeasonFilterProps) {
  const toggleSeason = (season: Season) => {
    if (selectedSeasons.includes(season)) {
      onSeasonChange(selectedSeasons.filter(s => s !== season));
    } else {
      onSeasonChange([...selectedSeasons, season]);
    }
  };

  return (
    <div className="flex gap-2">
      {SEASONS.map((season) => (
        <button
          key={season}
          onClick={() => toggleSeason(season)}
          className={clsx(
            'px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-colors',
            selectedSeasons.includes(season)
              ? 'bg-[var(--text-primary)] text-[var(--bg)] border-[var(--text-primary)]'
              : 'bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-secondary)]'
          )}
        >
          {SEASON_LABELS[season]}
        </button>
      ))}
    </div>
  );
}

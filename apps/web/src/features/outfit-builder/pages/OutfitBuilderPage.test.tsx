/**
 * Page-level tests for OutfitBuilderPage.
 *
 * Verifies the viewport-locked shell structure:
 * - `.builder-shell` is the outermost container
 * - `.builder-canvas-row` holds the canvas and panel
 * - `.canvas-area` constrains the outfit canvas
 * - `.builder-controls` is the fixed bottom action row
 *
 * Also verifies that data fetching (wardrobe items + saved outfits)
 * fires on mount.
 *
 * See docs/features/outfit-builder/design.md for the shell design decision.
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import { OutfitBuilderPage } from './OutfitBuilderPage';
import { useOutfitBuilderStore } from '../store';
import { useWardrobeStore } from '@/features/wardrobe/store';

vi.mock('@/shared/api/supabase');

vi.mock('../components/OutfitCanvas', () => ({
  OutfitCanvas: () => <div data-testid="outfit-canvas">Outfit canvas</div>,
}));

vi.mock('../components/WardrobePanel', () => ({
  WardrobePanel: () => <aside data-testid="wardrobe-panel">Wardrobe panel</aside>,
}));

let fetchOutfitsMock: MockedFunction<() => Promise<void>>;
let fetchItemsMock: MockedFunction<() => Promise<void>>;

describe('OutfitBuilderPage', () => {
  beforeEach(() => {
    fetchOutfitsMock = vi.fn(async () => undefined);
    fetchItemsMock = vi.fn(async () => undefined);

    useOutfitBuilderStore.setState({
      canvas: {
        top: [],
        bottom: null,
        shoes: null,
        accessoriesLeft: [],
        accessoriesRight: [],
      },
      currentOutfit: null,
      error: null,
      isLoading: false,
      outfits: [],
      clearCanvas: vi.fn(),
      clearError: vi.fn(),
      fetchOutfits: fetchOutfitsMock,
      loadOutfit: vi.fn().mockResolvedValue(undefined),
      saveOutfit: vi.fn().mockResolvedValue(undefined),
    });

    useWardrobeStore.setState({
      items: [],
      isLoading: false,
      fetchItems: fetchItemsMock,
    });
  });

  it('renders the viewport-locked shell, side panels, and controls row', () => {
    const { container } = render(<OutfitBuilderPage />);

    const builderShell = container.querySelector('.builder-shell');
    expect(builderShell).toHaveClass('builder-shell', 'page-enter', 'bg-[var(--bg)]');

    const canvasRow = container.querySelector('.builder-canvas-row');
    expect(canvasRow).toHaveClass('builder-canvas-row');

    const canvasArea = container.querySelector('.canvas-area');
    expect(canvasArea).toHaveClass('canvas-area', 'min-h-0', 'flex-1', 'overflow-hidden');

    const controlsRow = container.querySelector('.builder-controls');
    expect(controlsRow).toHaveClass('builder-controls', 'flex', 'items-center', 'justify-between');

    expect(screen.getByTestId('outfit-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('wardrobe-panel')).toBeInTheDocument();
    expect(screen.getByText(/outfit atelier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new look/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save look/i })).toBeDisabled();
    expect(screen.getByText(/^new look$/i, { selector: 'div' })).toBeInTheDocument();
  });

  it('loads wardrobe and outfit data when the page mounts', () => {
    render(<OutfitBuilderPage />);

    expect(fetchItemsMock).toHaveBeenCalledTimes(1);
    expect(fetchOutfitsMock).toHaveBeenCalledTimes(1);
  });
});

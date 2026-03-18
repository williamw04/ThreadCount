import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OutfitCanvas } from './OutfitCanvas';
import { useOutfitBuilderStore } from '../store';
import type { OutfitItem } from '../types';
import type { Category } from '@/features/wardrobe/types';

vi.mock('../api', () => ({
  getItemImageUrl: (path: string | null) => (path ? `https://cdn.test/${path}` : null),
}));

function createItem(id: string, name: string, category: Category): OutfitItem {
  return {
    id,
    name,
    category,
    image_path: `looks/${id}.png`,
  };
}

describe('OutfitCanvas', () => {
  beforeEach(() => {
    useOutfitBuilderStore.setState({
      canvas: {
        top: [],
        bottom: null,
        shoes: null,
        accessoriesLeft: [],
        accessoriesRight: [],
      },
      selectedSlot: null,
      topLayerIndex: 0,
      accessoryLeftLayerIndex: 0,
      accessoryRightLayerIndex: 0,
    });
  });

  it('renders the locked canvas frame with empty slot states', () => {
    const { container } = render(<OutfitCanvas />);

    const canvasSection = container.querySelector('section');
    expect(canvasSection).toHaveClass('flex', 'h-full', 'min-h-0', 'flex-col', 'overflow-hidden');

    const slotGrid = container.querySelector('section > .grid');
    expect(slotGrid).toHaveClass('grid', 'min-h-0', 'h-full', 'gap-3', 'p-3');

    expect(screen.getByText(/select tops, dresses, or outerwear/i)).toBeInTheDocument();
    expect(screen.getByText(/select trousers or bottoms/i)).toBeInTheDocument();
    expect(screen.getByText(/select shoes to finish the look/i)).toBeInTheDocument();
    expect(screen.getAllByText(/add jewelry, bags, watches, or small details/i)).toHaveLength(2);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('renders populated slots and updates the focused slot on click', async () => {
    const user = userEvent.setup();

    useOutfitBuilderStore.setState({
      canvas: {
        top: [createItem('top-1', 'Overshirt', 'tops'), createItem('top-2', 'Trench', 'outerwear')],
        bottom: createItem('bottom-1', 'Wide Trousers', 'bottoms'),
        shoes: createItem('shoes-1', 'Loafers', 'shoes'),
        accessoriesLeft: [createItem('accessory-1', 'Watch', 'accessories')],
        accessoriesRight: [createItem('accessory-2', 'Leather Bag', 'accessories')],
      },
    });

    render(<OutfitCanvas />);

    expect(screen.getByRole('button', { name: /remove overshirt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove wide trousers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove loafers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /swap top layer/i })).toBeInTheDocument();

    const topSlot = document.querySelectorAll('[role="button"]')[1];
    expect(topSlot).not.toBeNull();

    await user.click(topSlot!);

    expect(useOutfitBuilderStore.getState().selectedSlot).toBe('top');
  });

  it('maintains fixed slot proportions regardless of garment content', () => {
    const { container, rerender } = render(<OutfitCanvas />);

    const innerSlotGrid = container.querySelectorAll('.grid')[1] as HTMLElement;
    expect(innerSlotGrid).toBeTruthy();
    expect(innerSlotGrid.className).toContain('grid-rows-[30%_50%_20%]');

    act(() => {
      useOutfitBuilderStore.setState({
        canvas: {
          top: [
            createItem('top-1', 'Overshirt', 'tops'),
            createItem('top-2', 'Trench', 'outerwear'),
          ],
          bottom: createItem('bottom-1', 'Wide Trousers', 'bottoms'),
          shoes: createItem('shoes-1', 'Loafers', 'shoes'),
          accessoriesLeft: [createItem('accessory-1', 'Watch', 'accessories')],
          accessoriesRight: [createItem('accessory-2', 'Leather Bag', 'accessories')],
        },
      });
    });

    rerender(<OutfitCanvas />);

    const populatedSlotGrid = container.querySelectorAll('.grid')[1] as HTMLElement;
    expect(populatedSlotGrid.className).toContain('grid-rows-[30%_50%_20%]');

    act(() => {
      useOutfitBuilderStore.setState({
        canvas: {
          top: [],
          bottom: null,
          shoes: createItem('shoes-1', 'Loafers', 'shoes'),
          accessoriesLeft: [],
          accessoriesRight: [],
        },
      });
    });

    rerender(<OutfitCanvas />);

    const partialSlotGrid = container.querySelectorAll('.grid')[1] as HTMLElement;
    expect(partialSlotGrid.className).toContain('grid-rows-[30%_50%_20%]');
  });
});

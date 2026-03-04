import { useEffect, useState } from 'react';
import { useOutfitBuilderStore } from '../store';
import { useWardrobeStore } from '@/features/wardrobe/store';
import { OutfitCanvas } from '../components/OutfitCanvas';
import { WardrobePanel } from '../components/WardrobePanel';
import { Button } from '@/shared/ui/Button';

export function OutfitBuilderPage() {
  const { fetchOutfits, saveOutfit, clearCanvas, canvas } = useOutfitBuilderStore();
  const { fetchItems } = useWardrobeStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchOutfits();
  }, [fetchItems, fetchOutfits]);

  const hasItems = Object.values(canvas).some((item) => item !== null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveOutfit(outfitName || 'Untitled Outfit');
      setShowSaveModal(false);
      setOutfitName('');
    } catch {
      // Error handled in store
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewOutfit = () => {
    clearCanvas();
  };

  return (
    <div className="h-screen bg-[var(--bg-primary)] p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Outfit Builder</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleNewOutfit} size="sm">
              New
            </Button>
            <Button variant="primary" onClick={() => setShowSaveModal(true)} disabled={!hasItems} size="sm">
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <OutfitCanvas />
          </div>
          <div className="min-h-0 overflow-hidden">
            <WardrobePanel />
          </div>
        </div>

        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)] p-4">
              <h2 className="text-lg font-semibold mb-3">Save Outfit</h2>
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Outfit name"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] mb-3"
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

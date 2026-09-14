import { describe, expect, it } from 'vitest';
import {
  contract,
  CreateGeneratedImageRequest,
  CreateWardrobeItemRequest,
  PresignUploadRequest,
} from './contract';

const routes = Object.entries(contract);

describe('route table', () => {
  it('has unique method plus path pairs', () => {
    const keys = routes.map(([, r]) => `${r.method} ${r.path}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('declares params exactly when the path has a parameter', () => {
    for (const [name, r] of routes) {
      const hasParam = r.path.includes(':');
      expect(Boolean(r.params), `${name} params`).toBe(hasParam);
    }
  });

  it('never sends a body on GET or DELETE', () => {
    for (const [name, r] of routes) {
      if (r.method === 'GET' || r.method === 'DELETE') {
        expect(r.body, `${name} body`).toBeUndefined();
      }
    }
  });

  it('covers every resource in the spec', () => {
    const names = Object.keys(contract);
    for (const expected of [
      'me',
      'updateMe',
      'presignUpload',
      'listAvatars',
      'createAvatar',
      'getAvatar',
      'generateAvatar',
      'deleteAvatar',
      'listWardrobeItems',
      'createWardrobeItem',
      'getWardrobeItem',
      'updateWardrobeItem',
      'deleteWardrobeItem',
      'analyzeWardrobeImage',
      'listOutfits',
      'createOutfit',
      'getOutfit',
      'updateOutfit',
      'deleteOutfit',
      'listGeneratedImages',
      'createGeneratedImage',
      'getGeneratedImage',
      'deleteGeneratedImage',
    ]) {
      expect(names, expected).toContain(expected);
    }
  });
});

describe('request schemas', () => {
  it('rejects an upload kind or content type outside the allow list', () => {
    expect(
      PresignUploadRequest.safeParse({ kind: 'avatar', contentType: 'image/gif' }).success,
    ).toBe(false);
    expect(
      PresignUploadRequest.safeParse({ kind: 'video', contentType: 'image/png' }).success,
    ).toBe(false);
    expect(
      PresignUploadRequest.safeParse({ kind: 'wardrobe', contentType: 'image/png' }).success,
    ).toBe(true);
  });

  it('defaults the label arrays on create', () => {
    const item = CreateWardrobeItemRequest.parse({
      name: 'Coat',
      category: 'outerwear',
      imageKey: 'wardrobe/u/x.png',
    });
    expect(item.labels).toEqual([]);
    expect(item.seasons).toEqual([]);
  });

  it('requires either an outfit id or at least one item id for a try-on', () => {
    expect(CreateGeneratedImageRequest.safeParse({}).success).toBe(false);
    expect(CreateGeneratedImageRequest.safeParse({ itemIds: [] }).success).toBe(false);
    expect(
      CreateGeneratedImageRequest.safeParse({ outfitId: '0d5d3c2e-7c1b-4f4a-9c2e-8f2b9b1e6a11' })
        .success,
    ).toBe(true);
  });
});

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { RequestBodyOf, RouteDef } from './contract';
import {
  contract,
  CreateGeneratedImageRequest,
  CreateWardrobeItemRequest,
  PresignUploadRequest,
  UpdateOutfitRequest,
  UpdateWardrobeItemRequest,
} from './contract';

const routes = Object.entries(contract) as [string, RouteDef][];

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

  it('pins every route to its exact method and path', () => {
    const EXPECTED = {
      me: 'GET /api/me',
      updateMe: 'PATCH /api/me',
      presignUpload: 'POST /api/uploads/presign',
      listAvatars: 'GET /api/avatars',
      createAvatar: 'POST /api/avatars',
      getAvatar: 'GET /api/avatars/:id',
      generateAvatar: 'POST /api/avatars/:id/generate',
      deleteAvatar: 'DELETE /api/avatars/:id',
      listWardrobeItems: 'GET /api/wardrobe/items',
      createWardrobeItem: 'POST /api/wardrobe/items',
      getWardrobeItem: 'GET /api/wardrobe/items/:id',
      updateWardrobeItem: 'PATCH /api/wardrobe/items/:id',
      deleteWardrobeItem: 'DELETE /api/wardrobe/items/:id',
      analyzeWardrobeImage: 'POST /api/wardrobe/analyze',
      listOutfits: 'GET /api/outfits',
      createOutfit: 'POST /api/outfits',
      getOutfit: 'GET /api/outfits/:id',
      updateOutfit: 'PATCH /api/outfits/:id',
      deleteOutfit: 'DELETE /api/outfits/:id',
      listGeneratedImages: 'GET /api/generated-images',
      createGeneratedImage: 'POST /api/generated-images',
      getGeneratedImage: 'GET /api/generated-images/:id',
      deleteGeneratedImage: 'DELETE /api/generated-images/:id',
    } as const;
    expect(Object.fromEntries(routes.map(([n, r]) => [n, `${r.method} ${r.path}`]))).toEqual(
      EXPECTED,
    );
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
    // contradictory input must not validate via stripping: both fields present,
    // empty itemIds, would otherwise pass through the outfitId branch.
    expect(
      CreateGeneratedImageRequest.safeParse({
        outfitId: '0d5d3c2e-7c1b-4f4a-9c2e-8f2b9b1e6a11',
        itemIds: [],
      }).success,
    ).toBe(false);
  });

  it('does not resurrect defaulted array fields on a partial update', () => {
    expect(UpdateOutfitRequest.parse({ name: 'x' })).toEqual({ name: 'x' });
    expect(UpdateWardrobeItemRequest.parse({ name: 'Coat' })).toEqual({ name: 'Coat' });
  });

  it('types request bodies from input, not output', () => {
    // Defaulted fields are optional to the caller...
    expectTypeOf<{ name: string; category: 'outerwear'; imageKey: string }>().toMatchTypeOf<
      RequestBodyOf<'createWardrobeItem'>
    >();
    // ...and a bodyless route resolves to undefined, not never.
    expectTypeOf<RequestBodyOf<'me'>>().toEqualTypeOf<undefined>();
  });
});

import { describe, expect, it } from 'vitest';
import {
  ApiErrorSchema,
  AvatarSchema,
  GeneratedImageSchema,
  OutfitSchema,
  UserSchema,
  WardrobeItemSchema,
} from './schemas';

const now = '2026-09-13T12:00:00.000Z';
const id = '0d5d3c2e-7c1b-4f4a-9c2e-8f2b9b1e6a11';

describe('entity schemas', () => {
  it('parses a user', () => {
    const user = UserSchema.parse({
      id,
      email: 'a@b.co',
      name: null,
      image: null,
      emailVerified: true,
      onboardingCompleted: false,
      tutorialCompleted: false,
      createdAt: now,
      updatedAt: now,
    });
    expect(user.email).toBe('a@b.co');
  });

  it('parses an avatar with a presigned url next to each key', () => {
    const avatar = AvatarSchema.parse({
      id,
      userId: id,
      originalKey: `avatars/${id}/original.jpg`,
      originalUrl: 'https://r2.example/signed',
      modelKey: null,
      modelUrl: null,
      status: 'processing',
      error: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    expect(avatar.status).toBe('processing');
  });

  it('rejects a wardrobe item with an unknown category', () => {
    const result = WardrobeItemSchema.safeParse({
      id,
      userId: id,
      name: 'Coat',
      category: 'hats',
      imageKey: `wardrobe/${id}/x.png`,
      imageUrl: 'https://r2.example/signed',
      status: 'ready',
      error: null,
      labels: [],
      colors: [],
      seasons: [],
      isInspiration: false,
      createdAt: now,
      updatedAt: now,
    });
    expect(result.success).toBe(false);
  });

  it('parses an outfit and a generated image', () => {
    expect(
      OutfitSchema.parse({
        id,
        userId: id,
        name: null,
        itemIds: [id],
        thumbnailKey: null,
        thumbnailUrl: null,
        createdAt: now,
        updatedAt: now,
      }).itemIds,
    ).toEqual([id]);
    expect(
      GeneratedImageSchema.parse({
        id,
        userId: id,
        outfitId: null,
        imageKey: null,
        imageUrl: null,
        prompt: 'p',
        status: 'failed',
        error: 'fal.ai timeout',
        createdAt: now,
      }).error,
    ).toBe('fal.ai timeout');
  });

  it('parses the error envelope', () => {
    expect(
      ApiErrorSchema.parse({ error: { code: 'not_found', message: 'No such item' } }).error.code,
    ).toBe('not_found');
  });
});

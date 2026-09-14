import { z } from 'zod';
import { CATEGORIES, SEASONS } from './enums';
import {
  AvatarSchema,
  GeneratedImageSchema,
  OutfitSchema,
  UserSchema,
  WardrobeItemSchema,
} from './schemas';

/**
 * The API contract. Each route names its method, path, and the Zod schemas for
 * params, query, body, and response. The Worker validates requests against these
 * and the clients type their calls from them. The fal.ai webhook is not here: it
 * is called by fal.ai, not by a client. `auth/*` is not here either: Better Auth
 * serves those routes directly, and both clients call them through Better Auth's
 * own client packages, so no Zod route entry here would model anything a client
 * calls through this contract.
 */

const Id = z.uuid();
const IdParams = z.object({ id: Id });
const NoContent = z.undefined();

// --- request schemas ---

export const PatchMeRequest = z.object({
  onboardingCompleted: z.boolean().optional(),
  tutorialCompleted: z.boolean().optional(),
});

export const PresignUploadRequest = z.object({
  kind: z.enum(['avatar', 'wardrobe', 'generated']),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
export const PresignUploadResponse = z.object({
  key: z.string().min(1),
  url: z.url(),
  expiresAt: z.iso.datetime(),
});

export const CreateAvatarRequest = z.object({ originalKey: z.string().min(1) });

export const ListWardrobeItemsQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  search: z.string().optional(),
  colors: z.array(z.string()).optional(),
  seasons: z.array(z.enum(SEASONS)).optional(),
});
export const CreateWardrobeItemRequest = z.object({
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  imageKey: z.string().min(1),
  labels: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  seasons: z.array(z.enum(SEASONS)).default([]),
});
export const UpdateWardrobeItemRequest = CreateWardrobeItemRequest.omit({
  imageKey: true,
}).partial();

export const AnalyzeWardrobeImageRequest = z.object({ imageKey: z.string().min(1) });
export const AnalyzeWardrobeImageResponse = z.object({
  name: z.string(),
  category: z.enum(CATEGORIES),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASONS)),
  labels: z.array(z.string()),
});

export const CreateOutfitRequest = z.object({
  name: z.string().optional(),
  itemIds: z.array(Id).default([]),
  thumbnailKey: z.string().min(1).optional(),
});
export const UpdateOutfitRequest = CreateOutfitRequest.partial();

export const CreateGeneratedImageRequest = z.union([
  z.object({ outfitId: Id }),
  z.object({ itemIds: z.array(Id).min(1) }),
]);

// --- route table ---

export interface RouteDef {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: `/api/${string}`;
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
  response: z.ZodType;
}

// Generic inference from an object literal only picks up the keys actually
// written, so a route that omits `params`/`query`/`body` has no such key on
// its inferred type at all. WithDefaults backfills those to `undefined` at
// the type level (no runtime change) so `Object.entries(contract)` yields a
// union where every member has every key, as the tests rely on.
type WithDefaults<R extends RouteDef> = Omit<R, 'params' | 'query' | 'body'> & {
  params: R['params'] extends z.ZodType ? R['params'] : undefined;
  query: R['query'] extends z.ZodType ? R['query'] : undefined;
  body: R['body'] extends z.ZodType ? R['body'] : undefined;
};

const route = <R extends RouteDef>(r: R): WithDefaults<R> => r as WithDefaults<R>;

export const contract = {
  me: route({ method: 'GET', path: '/api/me', response: UserSchema }),
  updateMe: route({ method: 'PATCH', path: '/api/me', body: PatchMeRequest, response: UserSchema }),

  presignUpload: route({
    method: 'POST',
    path: '/api/uploads/presign',
    body: PresignUploadRequest,
    response: PresignUploadResponse,
  }),

  listAvatars: route({ method: 'GET', path: '/api/avatars', response: z.array(AvatarSchema) }),
  createAvatar: route({
    method: 'POST',
    path: '/api/avatars',
    body: CreateAvatarRequest,
    response: AvatarSchema,
  }),
  getAvatar: route({
    method: 'GET',
    path: '/api/avatars/:id',
    params: IdParams,
    response: AvatarSchema,
  }),
  generateAvatar: route({
    method: 'POST',
    path: '/api/avatars/:id/generate',
    params: IdParams,
    response: AvatarSchema,
  }),
  deleteAvatar: route({
    method: 'DELETE',
    path: '/api/avatars/:id',
    params: IdParams,
    response: NoContent,
  }),

  listWardrobeItems: route({
    method: 'GET',
    path: '/api/wardrobe/items',
    query: ListWardrobeItemsQuery,
    response: z.array(WardrobeItemSchema),
  }),
  createWardrobeItem: route({
    method: 'POST',
    path: '/api/wardrobe/items',
    body: CreateWardrobeItemRequest,
    response: WardrobeItemSchema,
  }),
  getWardrobeItem: route({
    method: 'GET',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: WardrobeItemSchema,
  }),
  updateWardrobeItem: route({
    method: 'PATCH',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    body: UpdateWardrobeItemRequest,
    response: WardrobeItemSchema,
  }),
  deleteWardrobeItem: route({
    method: 'DELETE',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: NoContent,
  }),
  analyzeWardrobeImage: route({
    method: 'POST',
    path: '/api/wardrobe/analyze',
    body: AnalyzeWardrobeImageRequest,
    response: AnalyzeWardrobeImageResponse,
  }),

  listOutfits: route({ method: 'GET', path: '/api/outfits', response: z.array(OutfitSchema) }),
  createOutfit: route({
    method: 'POST',
    path: '/api/outfits',
    body: CreateOutfitRequest,
    response: OutfitSchema,
  }),
  getOutfit: route({
    method: 'GET',
    path: '/api/outfits/:id',
    params: IdParams,
    response: OutfitSchema,
  }),
  updateOutfit: route({
    method: 'PATCH',
    path: '/api/outfits/:id',
    params: IdParams,
    body: UpdateOutfitRequest,
    response: OutfitSchema,
  }),
  deleteOutfit: route({
    method: 'DELETE',
    path: '/api/outfits/:id',
    params: IdParams,
    response: NoContent,
  }),

  listGeneratedImages: route({
    method: 'GET',
    path: '/api/generated-images',
    response: z.array(GeneratedImageSchema),
  }),
  createGeneratedImage: route({
    method: 'POST',
    path: '/api/generated-images',
    body: CreateGeneratedImageRequest,
    response: GeneratedImageSchema,
  }),
  getGeneratedImage: route({
    method: 'GET',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: GeneratedImageSchema,
  }),
  deleteGeneratedImage: route({
    method: 'DELETE',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: NoContent,
  }),
} as const satisfies Record<string, RouteDef>;

export type RouteName = keyof typeof contract;
type InferOrNever<T> = T extends z.ZodType ? z.infer<T> : never;
export type RequestBodyOf<N extends RouteName> = InferOrNever<(typeof contract)[N]['body']>;
export type ResponseOf<N extends RouteName> = z.infer<(typeof contract)[N]['response']>;

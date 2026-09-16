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
  // Wire form: repeated query params (?colors=a&colors=b), which the Worker
  // parses into arrays before validation.
  colors: z.array(z.string()).optional(),
  seasons: z.array(z.enum(SEASONS)).optional(),
});
const WardrobeItemFields = z.object({
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  imageKey: z.string().min(1),
  labels: z.array(z.string()),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASONS)),
});
export const CreateWardrobeItemRequest = WardrobeItemFields.extend({
  labels: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  seasons: z.array(z.enum(SEASONS)).default([]),
});
// .partial() does not remove .default(), so this is derived from the
// default-free WardrobeItemFields, not from CreateWardrobeItemRequest --
// otherwise a partial update would resurrect omitted array fields as [].
export const UpdateWardrobeItemRequest = WardrobeItemFields.omit({ imageKey: true }).partial();

export const AnalyzeWardrobeImageRequest = z.object({ imageKey: z.string().min(1) });
export const AnalyzeWardrobeImageResponse = z.object({
  name: z.string(),
  category: z.enum(CATEGORIES),
  colors: z.array(z.string()),
  seasons: z.array(z.enum(SEASONS)),
  labels: z.array(z.string()),
});

const OutfitFields = z.object({
  name: z.string().optional(),
  itemIds: z.array(Id),
  thumbnailKey: z.string().min(1).optional(),
});
export const CreateOutfitRequest = OutfitFields.extend({
  itemIds: z.array(Id).default([]),
});
// Same reasoning as UpdateWardrobeItemRequest: derived from the default-free
// OutfitFields so a partial update doesn't reset itemIds to [].
export const UpdateOutfitRequest = OutfitFields.partial();

export const CreateGeneratedImageRequest = z.union([
  z.object({ outfitId: Id }).strict(),
  z.object({ itemIds: z.array(Id).min(1) }).strict(),
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

export const contract = {
  me: { method: 'GET', path: '/api/me', response: UserSchema },
  updateMe: { method: 'PATCH', path: '/api/me', body: PatchMeRequest, response: UserSchema },

  presignUpload: {
    method: 'POST',
    path: '/api/uploads/presign',
    body: PresignUploadRequest,
    response: PresignUploadResponse,
  },

  listAvatars: { method: 'GET', path: '/api/avatars', response: z.array(AvatarSchema) },
  createAvatar: {
    method: 'POST',
    path: '/api/avatars',
    body: CreateAvatarRequest,
    response: AvatarSchema,
  },
  getAvatar: {
    method: 'GET',
    path: '/api/avatars/:id',
    params: IdParams,
    response: AvatarSchema,
  },
  generateAvatar: {
    method: 'POST',
    path: '/api/avatars/:id/generate',
    params: IdParams,
    response: AvatarSchema,
  },
  deleteAvatar: {
    method: 'DELETE',
    path: '/api/avatars/:id',
    params: IdParams,
    response: NoContent,
  },

  listWardrobeItems: {
    method: 'GET',
    path: '/api/wardrobe/items',
    query: ListWardrobeItemsQuery,
    response: z.array(WardrobeItemSchema),
  },
  createWardrobeItem: {
    method: 'POST',
    path: '/api/wardrobe/items',
    body: CreateWardrobeItemRequest,
    response: WardrobeItemSchema,
  },
  getWardrobeItem: {
    method: 'GET',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: WardrobeItemSchema,
  },
  updateWardrobeItem: {
    method: 'PATCH',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    body: UpdateWardrobeItemRequest,
    response: WardrobeItemSchema,
  },
  deleteWardrobeItem: {
    method: 'DELETE',
    path: '/api/wardrobe/items/:id',
    params: IdParams,
    response: NoContent,
  },
  analyzeWardrobeImage: {
    method: 'POST',
    path: '/api/wardrobe/analyze',
    body: AnalyzeWardrobeImageRequest,
    response: AnalyzeWardrobeImageResponse,
  },

  listOutfits: { method: 'GET', path: '/api/outfits', response: z.array(OutfitSchema) },
  createOutfit: {
    method: 'POST',
    path: '/api/outfits',
    body: CreateOutfitRequest,
    response: OutfitSchema,
  },
  getOutfit: {
    method: 'GET',
    path: '/api/outfits/:id',
    params: IdParams,
    response: OutfitSchema,
  },
  updateOutfit: {
    method: 'PATCH',
    path: '/api/outfits/:id',
    params: IdParams,
    body: UpdateOutfitRequest,
    response: OutfitSchema,
  },
  deleteOutfit: {
    method: 'DELETE',
    path: '/api/outfits/:id',
    params: IdParams,
    response: NoContent,
  },

  listGeneratedImages: {
    method: 'GET',
    path: '/api/generated-images',
    response: z.array(GeneratedImageSchema),
  },
  createGeneratedImage: {
    method: 'POST',
    path: '/api/generated-images',
    body: CreateGeneratedImageRequest,
    response: GeneratedImageSchema,
  },
  getGeneratedImage: {
    method: 'GET',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: GeneratedImageSchema,
  },
  deleteGeneratedImage: {
    method: 'DELETE',
    path: '/api/generated-images/:id',
    params: IdParams,
    response: NoContent,
  },
} as const satisfies Record<string, RouteDef>;

export type RouteName = keyof typeof contract;
// z.input (not z.infer/output): a request body schema's defaulted fields are
// optional to the caller, and a route with no body resolves to undefined
// rather than never, so a generic request helper can still be called.
type InputOrUndefined<T> = T extends z.ZodType ? z.input<T> : undefined;
export type RequestBodyOf<N extends RouteName> = InputOrUndefined<
  (typeof contract)[N] extends { body: infer B } ? B : undefined
>;
export type ResponseOf<N extends RouteName> = z.infer<(typeof contract)[N]['response']>;

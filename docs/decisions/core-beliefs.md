# Core Beliefs

**Version**: 1.0
**Last Updated**: 2026-02-12

These are the foundational principles that guide all decisions in the Seamless frontend.

## 1. Repository as System of Record

**Belief**: If knowledge isn't in the repository, it doesn't exist.

**Implications**:

- All design decisions documented in `docs/decisions/`
- All feature requirements in `docs/features/`
- No critical context lives in Slack, Google Docs, or anyone's head

## 2. Parse at Boundaries

**Belief**: Validate data shapes where data enters or leaves the system.

**Implications**:

- All API responses validated with zod schemas in the API layer
- All form inputs validated before submission
- Never trust the shape of external data

**Example**:

```typescript
// ✅ Parse at boundary
const WardrobeItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.enum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories']),
  imageUrl: z.string().url(),
});

const items = WardrobeItemSchema.array().parse(response.data);

// ❌ Trust and hope
const items = response.data as WardrobeItem[];
```

## 3. Frontend is Presentation

**Belief**: Business logic belongs in the backend. The frontend handles display and interaction.

**Implications**:

- No complex business rules in React components
- Stores manage UI state, not business state
- Backend is the source of truth for all data
- Frontend can cache but must defer to backend on conflicts

## 4. Domains Own Their Boundaries

**Belief**: Each feature domain is self-contained. Cross-domain communication goes through defined interfaces.

**Implications**:

- Domain components don't import from other domains' components
- Cross-domain data sharing happens via stores or type imports only
- Shared UI primitives live in `src/shared/ui/`, not in domains

## 5. Mechanical Enforcement Over Convention

**Belief**: If a rule matters, encode it in tooling.

**Implications**:

- Linters enforce file size limits and import rules
- Tests validate architectural boundaries
- CI catches violations before merge
- Don't rely on code review to catch structural issues

## 6. Test What Matters

**Belief**: Tests should validate behavior, not implementation.

**Implications**:

- Test user-visible behavior (what the user sees and does)
- Use React Testing Library (query by role, text, label—not by class or id)
- Don't test implementation details (internal state, private methods)
- Higher coverage for stores/API (80%+), reasonable for components (70%+)

## 7. Optimize for Readability

**Belief**: Code is read far more than it is written. Optimize for the reader.

**Implications**:

- Small files (300 lines max, 150-200 recommended)
- Descriptive names over comments
- Flat component hierarchies over deep nesting
- Explicit props over implicit context where practical

## 8. Incremental Delivery

**Belief**: Ship small, working increments. Don't build everything at once.

**Implications**:

- Features built end-to-end (types → API → store → component → page)
- Each PR should be independently shippable
- Stub or mock what doesn't exist yet
- Use feature flags for incomplete features in production

## Application

### When Building a Feature

1. Does a product spec exist? If not, write one first
2. What domain does this belong to?
3. What data does it need? Define types and API layer first
4. What state does it manage? Build the store
5. What does the user see? Build components and pages
6. Is it tested? Write tests alongside code

### When Reviewing Code

1. Are imports following layer rules? (Types → API → Stores → Components → Pages)
2. Is external data validated at boundaries?
3. Are files under 300 lines?
4. Are tests testing behavior, not implementation?
5. Is documentation updated?

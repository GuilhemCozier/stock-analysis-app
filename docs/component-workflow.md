# Component Documentation Workflow

## Purpose
Streamlined process for documenting UI components and generating implementation prompts for Cursor.

## Process Overview

1. **Developer** provides component description to Claude Code
2. **Claude Code** generates:
   - One-liner entry in `/docs/components.md`
   - Complete Cursor implementation prompt
3. **Developer** copies prompt into Cursor
4. **Cursor** builds the component with JSDoc comment included

## Component Description Format

When describing a component to Claude Code, the user includes:

```
Component: [Name]
Description:
- Purpose: [What it does, where it appears]
- States: [List all visual states, e.g., loading, error, empty]
- Interactions: [User actions, click handlers, form submissions]
- Data: [What data it receives/displays]
- Design: [Colors, typography, spacing from design system]
Screenshot (optional): [Description of screenshot] + [image]
```

## Output Format

### 1. One-liner for `/docs/components.md`

Format:
```markdown
- **ComponentName** - Brief description, key states/features
```

Example:
```markdown
- **SubSectorCard** - Displays sub-sector with approval workflow (5 states: pending → approved → analyzing → completed → error)
```

### 2. Cursor Implementation Prompt

**CRITICAL:** The prompt MUST include these exact instructions:
- Create component in `src/components/ui/[ComponentName].tsx`
- Reference `src/lib/design-system.md` for all design system tokens (colors, typography, spacing)

The prompt should follow this structure:

````markdown
Create the [ComponentName] component in `src/components/ui/[ComponentName].tsx`.

**Design System Reference:**
Read `src/lib/design-system.md` for all design tokens. Use the exact Tailwind classes defined there for:
- Colors (e.g., `bg-primary`, `text-neutral-900`)
- Typography (e.g., `font-serif text-3xl font-semibold`)
- Spacing (e.g., `p-5`, `gap-4`)
- Border radius, shadows, icons

**Component Description:**
[2-3 sentence overview]

**JSDoc Comment (add at top of file):**
```tsx
/**
 * [Brief description]
 * States: [list states if applicable]
 * Used in: [page/location]
 */
```

**Props Interface:**
```typescript
interface [ComponentName]Props {
  // Define all props with types
}
```

**States/Behavior:**
- State 1: [description]
- State 2: [description]
- User interaction → system response

**Styling Notes:**
[Highlight which specific sections of design-system.md to reference, e.g.:]
- Use primary button styling from Button Variants section
- Apply card component pattern from Card Components section
- Typography: [which specific pattern to use]

**shadcn/ui Components:**
- [List any shadcn components to use, e.g., Button, Card]

**Implementation Notes:**
- [Any specific technical requirements]
- [State management approach]
- [Data fetching if needed]
````

## Design System Reference

**IMPORTANT:** All Cursor prompts MUST instruct Cursor to:
1. Read `src/lib/design-system.md` before implementing
2. Use exact design tokens from that file (not generic Tailwind classes)
3. Create components in `src/components/ui/` directory

The design system file contains:
- Complete color palette with Tailwind config values
- Typography scales and usage patterns
- Spacing system
- Component patterns and examples
- Accessibility guidelines

## Quality Checklist

Before finalizing:
- ✓ One-liner added to `/docs/components.md`
- ✓ Cursor prompt is complete and self-contained
- ✓ JSDoc format included in prompt
- ✓ Design system values referenced (not hardcoded)
- ✓ All states/interactions documented
- ✓ TypeScript interfaces defined

## Example Usage

**Input to Claude Code:**
```
Component: SubSectorCard
Purpose: Displays a sub-sector with name, summary, and approval button
States: pending, approved, analyzing, completed, error
Interactions: Click "Approve" button to start analysis
Data: subSector object with id, name, summary, status
Design: Uses primary button, neutral-900 text, card styling with shadow-sm
```

**Output from Claude Code:**
1. Appends one-liner to `docs/components.md`
2. Outputs complete Cursor prompt ready to copy-paste
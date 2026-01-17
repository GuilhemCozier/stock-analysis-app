## Overview

This design system creates a clean, professional interface for delivering structured financial analyses. It balances readability for dense financial content with intuitive navigation for complex research workflows.

### **Core Principles:**

- **Clarity over decoration** - Remove visual noise to let financial data breathe
- **Hierarchy through typography** - Use type scale and weight to guide attention
- **Purposeful color** - Reserve vibrant colors for actions and key insights
- **Progressive disclosure** - Show complexity only when needed
- **Professional trust** - Design choices signal credibility and expertise

---

## Implementation Guide

This design system uses **Tailwind CSS** with **shadcn/ui** components. All design tokens below should be:
1. Added to `tailwind.config.ts` theme extension
2. Referenced when building shadcn components
3. Used via Tailwind utility classes (not custom CSS classes)

## Color Palette

### **Tailwind Config Implementation**

Add these to your `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#D97757',
        hover: '#C46644',
        pressed: '#B05533',
      },
      neutral: {
        50: '#FAFAF9',
        100: '#F5F5F4',
        200: '#E7E7E5',
        300: '#D4D4D2',
        400: '#A3A3A0',
        500: '#737371',
        600: '#525250',
        700: '#3F3F3D',
        800: '#262625',
        900: '#1A1A19',
      },
      success: {
        DEFAULT: '#16A34A',
        bg: '#F0FDF4',
      },
      warning: {
        DEFAULT: '#DC6803',
        bg: '#FFF7ED',
      },
      error: {
        DEFAULT: '#E00501',
        bg: '#FEF2F2',
      },
      info: {
        DEFAULT: '#2563EB',
        bg: '#EFF6FF',
      },
    },
  }
}
```

### **Usage Examples**

```tsx
// Buttons
<button className="bg-primary hover:bg-primary-hover text-white">
  Generate Analysis
</button>

// Success state
<div className="bg-success-bg text-success border border-success/20">
  Analysis complete
</div>

// Text colors
<h1 className="text-neutral-900">Main Heading</h1>
<p className="text-neutral-600">Secondary text</p>
```

## Typography

### **Tailwind Config Implementation**

```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      serif: ['Charter', 'Georgia', 'Times New Roman', 'serif'],
      mono: ['SF Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',      // 12px - Captions, metadata
      sm: '0.8125rem',    // 13px - Secondary labels
      base: '0.875rem',   // 14px - Body text, UI elements
      md: '1rem',         // 16px - Emphasized body text
      lg: '1.125rem',     // 18px - Section headings
      xl: '1.25rem',      // 20px - Card titles
      '2xl': '1.5rem',    // 24px - Page titles
      '3xl': '1.875rem',  // 30px - Hero headings
      '4xl': '2.25rem',   // 36px - Display
    },
  }
}
```

### **Typography Usage Guide**

| Element | Font | Class Example |
|---------|------|---------------|
| **Large Headings (H1)** | Serif | `font-serif text-3xl font-semibold leading-tight text-neutral-900` |
| **Page Titles (H2)** | Serif | `font-serif text-2xl font-semibold leading-tight text-neutral-900` |
| **Section Headings (H3)** | Sans | `font-sans text-xl font-semibold leading-snug text-neutral-900` |
| **Card Titles (H4)** | Sans | `font-sans text-lg font-medium text-neutral-900` |
| **Long-form Content** | Serif | `font-serif text-md leading-relaxed text-neutral-900` |
| **UI Body Text** | Sans | `font-sans text-base leading-normal text-neutral-900` |
| **Labels** | Sans | `font-sans text-sm font-medium text-neutral-600` |
| **Captions/Meta** | Sans | `font-sans text-xs text-neutral-500` |
| **Financial Data** | Mono | `font-mono text-base font-medium tracking-tight tabular-nums` |

### **Component Examples**

```tsx
// Page heading
<h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
  Technology Sector Analysis
</h1>

// Analysis content
<div className="font-serif text-md leading-relaxed text-neutral-900">
  <p>Based on comprehensive market research...</p>
</div>

// Financial metric
<div className="space-y-1">
  <label className="font-sans text-sm font-medium text-neutral-600">
    Market Cap
  </label>
  <span className="font-mono text-base font-medium tracking-tight tabular-nums">
    $2,847,392,105
  </span>
</div>

// Stock ticker
<span className="font-mono text-sm font-semibold tracking-tight">
  AAPL
</span>
```

## Spacing System

Use Tailwind's default spacing scale (4px base). Key spacing guidelines:

| Context | Mobile | Desktop | Tailwind Class |
|---------|--------|---------|----------------|
| **Page container padding** | 16px | 32px | `px-4 md:px-8` |
| **Section vertical gap** | 32px | 48px | `space-y-8 md:space-y-12` |
| **Card padding** | 20px | 24px | `p-5 md:p-6` |
| **Card gap (grid)** | 16px | 24px | `gap-4 md:gap-6` |
| **Between form fields** | 16px | 20px | `space-y-4 md:space-y-5` |
| **Button padding** | 12px 20px | - | `px-5 py-3` |

### **Common Patterns**

```tsx
// Page wrapper
<main className="container mx-auto px-4 py-8 md:px-8 md:py-12">

// Card component
<div className="rounded-lg border border-neutral-200 p-5 md:p-6">

// Form spacing
<form className="space-y-4">

// Grid of cards
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
```

## Border Radius & Shadows

Use Tailwind defaults. Common applications:

| Element | Radius | Shadow | Example Class |
|---------|--------|--------|---------------|
| **Buttons** | 8px | None | `rounded-md` |
| **Input fields** | 8px | None/Focus | `rounded-md focus:ring-2` |
| **Cards** | 12px | Subtle | `rounded-lg shadow-sm` |
| **Modals** | 12px | Strong | `rounded-lg shadow-xl` |
| **Badges** | 6px | None | `rounded-sm` |
| **Avatars** | Full | None | `rounded-full` |
| **Dropdowns** | 8px | Medium | `rounded-md shadow-lg` |

## Interactions & Animations

### **Transitions**

Use Tailwind's transition utilities with these durations:
- **Fast** (100ms): Immediate feedback - `transition-all duration-100`
- **Default** (150ms): Interactive elements - `transition-colors duration-150`
- **Slow** (300ms): Layout changes - `transition-all duration-300`

### **Interactive State Examples**

```tsx
// Button hover
<button className="bg-primary text-white transition-colors duration-150 hover:bg-primary-hover active:bg-primary-pressed">

// Card hover
<div className="rounded-lg border border-neutral-200 shadow-sm transition-all duration-150 hover:border-neutral-300 hover:shadow-md">

// Link
<a className="text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline">

// Input focus
<input className="rounded-md border border-neutral-200 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
```

### **Loading States**

```tsx
// Skeleton loader
<div className="animate-pulse space-y-3">
  <div className="h-4 rounded bg-neutral-200" />
  <div className="h-4 w-5/6 rounded bg-neutral-200" />
</div>

// Spinner
<div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary" />

// Fade in content
<div className="animate-in fade-in duration-300">
  Content here
</div>
```

## Icons

Use **[Lucide React](https://lucide.dev/)** for all icons.

```bash
npm install lucide-react
```

### **Size Guidelines**

| Context | Size | Tailwind Class |
|---------|------|----------------|
| Inline with text | 16px | `size-4` |
| Buttons, nav items | 20px | `size-5` |
| Section headers | 24px | `size-6` |

### **Common Icons for Financial App**

```tsx
import {
  TrendingUp, TrendingDown,      // Price movements
  BarChart3, LineChart,           // Data visualization
  Building, Building2,            // Companies
  DollarSign,                     // Financial
  Calendar,                       // Date ranges
  Search, Filter,                 // Filtering
  Download,                       // Export
  Star, StarOff,                  // Favorites
  Plus, X, Check,                 // Actions
  ChevronDown, ChevronRight,      // Expandable
  Loader2,                        // Loading
  AlertCircle, Info, CheckCircle, // Alerts
} from 'lucide-react';
```

### **Usage Examples**

```tsx
// Icon button
<button className="inline-flex items-center gap-2 px-5 py-3">
  <Download className="size-5" />
  Export Report
</button>

// Success state with icon
<div className="flex items-center gap-2 text-success">
  <CheckCircle className="size-5" />
  <span>Analysis complete</span>
</div>

// Loading state
<Loader2 className="size-5 animate-spin text-neutral-500" />
```

## Component Guidelines

### **Button Variants**

```tsx
// Primary CTA
<button className="bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-pressed rounded-md">
  Generate Analysis
</button>

// Secondary
<button className="border border-neutral-200 bg-white px-5 py-3 font-medium text-neutral-900 transition-all hover:bg-neutral-50 rounded-md">
  Cancel
</button>

// Destructive
<button className="bg-error px-5 py-3 font-medium text-white transition-colors hover:bg-error/90 rounded-md">
  Delete Analysis
</button>

// Ghost
<button className="px-5 py-3 font-medium text-neutral-700 transition-colors hover:bg-neutral-100 rounded-md">
  View Details
</button>
```

### **Card Components**

```tsx
// Basic card
<div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-neutral-900">Card Title</h3>
  <p className="mt-2 text-base text-neutral-600">Card content...</p>
</div>

// Interactive card
<div className="group cursor-pointer rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
  {/* Content */}
</div>

// Stock card example
<div className="rounded-lg border border-neutral-200 bg-white p-5">
  <div className="flex items-start justify-between">
    <div>
      <span className="font-mono text-sm font-semibold tracking-tight">AAPL</span>
      <h4 className="mt-1 text-base font-medium text-neutral-900">Apple Inc.</h4>
    </div>
    <div className="flex items-center gap-1 text-success">
      <TrendingUp className="size-4" />
      <span className="font-mono text-sm font-medium">+2.4%</span>
    </div>
  </div>
</div>
```

### **Form Inputs**

```tsx
// Text input with label
<div className="space-y-1">
  <label className="text-sm font-medium text-neutral-700">
    Company Name
  </label>
  <input
    type="text"
    className="w-full rounded-md border border-neutral-200 px-4 py-2.5 text-base transition-all placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
    placeholder="Enter company name"
  />
</div>

// Select
<select className="w-full rounded-md border border-neutral-200 px-4 py-2.5 text-base transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
  <option>Technology</option>
  <option>Healthcare</option>
</select>
```

### **Alert/Notice Components**

```tsx
// Success
<div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success-bg p-4">
  <CheckCircle className="size-5 flex-shrink-0 text-success" />
  <div>
    <p className="font-medium text-success">Analysis complete</p>
    <p className="mt-1 text-sm text-success/80">Your report is ready to view</p>
  </div>
</div>

// Error
<div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error-bg p-4">
  <AlertCircle className="size-5 flex-shrink-0 text-error" />
  <div>
    <p className="font-medium text-error">Analysis failed</p>
    <p className="mt-1 text-sm text-error/80">Please try again</p>
  </div>
</div>

// Info
<div className="flex items-start gap-3 rounded-lg border border-info/20 bg-info-bg p-4">
  <Info className="size-5 flex-shrink-0 text-info" />
  <div>
    <p className="text-sm text-info">This analysis may take 2-3 minutes</p>
  </div>
</div>
```

### **Best Practices**

✅ **Do:**
- Use `font-serif` for long-form analysis content
- Use `font-mono tabular-nums` for all financial data
- Always show loading states (`animate-pulse`, `Loader2`)
- Provide clear feedback for actions (success/error alerts)
- Use descriptive button labels ("Generate Analysis" not "Submit")
- Include icons with semantic colors (red=error, green=success)

❌ **Don't:**
- Use pure black `#000` (use `neutral-900` instead)
- Mix serif and sans-serif in UI elements (only serif for content)
- Disable buttons without explanation tooltip
- Use red/green alone for meaning (add icons/text)
- Use vague labels like "Click here"

## Accessibility

### **Focus States**

Tailwind handles focus states well by default. Always use `focus-visible:` for keyboard navigation:

```tsx
// Button focus
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">

// Input focus (already shown above)
<input className="focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />

// Card focus
<div className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
```

### **ARIA Labels & Roles**

```tsx
// Icon-only button
<button aria-label="Close modal">
  <X className="size-5" />
</button>

// Form field with description
<div>
  <label htmlFor="sector" className="text-sm font-medium">Sector</label>
  <input
    id="sector"
    aria-describedby="sector-hint"
  />
  <p id="sector-hint" className="text-xs text-neutral-500">
    Select the primary sector for analysis
  </p>
</div>

// Loading indicator
<div role="status" aria-live="polite">
  <Loader2 className="animate-spin" />
  <span className="sr-only">Loading analysis...</span>
</div>

// Alert
<div role="alert" className="bg-error-bg text-error">
  Error message here
</div>
```

### **Screen Reader Utilities**

```tsx
// Hide visually but keep for screen readers
<span className="sr-only">Loading...</span>

// Skip to main content
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>
```

### **Color Contrast**

All colors in this system meet WCAG AA standards:
- `neutral-900` on white: 16.5:1 ✓
- `neutral-600` on white: 7.2:1 ✓
- `primary` on white: 4.8:1 ✓
- Always pair color with icons/text for meaning

### **Keyboard Navigation Checklist**

- ✅ Tab order follows visual layout
- ✅ Focus visible on all interactive elements
- ✅ Escape closes modals/dropdowns
- ✅ Enter/Space activates buttons
- ✅ Arrow keys for navigating lists
- ✅ Skip-to-content link present

---

## shadcn/ui Integration

When installing shadcn components, customize them to match this design system:

```bash
npx shadcn@latest init
```

### **Update `components.json`**

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### **Customizing shadcn Components**

After installing a component, adjust colors to match our palette:

```tsx
// Button variant example
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        secondary: "border border-neutral-200 bg-white hover:bg-neutral-50",
        destructive: "bg-error text-white hover:bg-error/90",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        default: "px-5 py-3 text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-6 py-4 text-lg",
      },
    },
  }
);
```

---

## Quick Reference

### **File Structure**
```
src/
  components/
    ui/              # shadcn components (Button, Card, etc.)
    layout/          # Layout components (Header, Footer, etc.)
    features/        # Feature-specific components
  lib/
    design-system.md # This file
```

### **When Building a Component**

1. ✅ Reference typography table for text styles
2. ✅ Use semantic colors (`success`, `error`, `primary`)
3. ✅ Apply proper spacing from spacing system
4. ✅ Include focus states for keyboard navigation
5. ✅ Add ARIA labels for icon-only buttons
6. ✅ Use Lucide icons at correct sizes
7. ✅ Test with keyboard navigation
8. ✅ Ensure color contrast meets WCAG AA

### **Common Patterns Quick Copy**

```tsx
// Page layout
<main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
  <h1 className="font-serif text-3xl font-semibold text-neutral-900">Title</h1>
  <div className="mt-8 space-y-6">{/* Content */}</div>
</main>

// Loading state
{isLoading && (
  <div className="flex items-center gap-2 text-neutral-600">
    <Loader2 className="size-5 animate-spin" />
    <span>Loading...</span>
  </div>
)}

// Empty state
<div className="py-12 text-center">
  <p className="text-neutral-500">No results found</p>
</div>
```
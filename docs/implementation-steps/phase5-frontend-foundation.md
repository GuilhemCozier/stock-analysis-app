**5.1 Design in Figma**

- Color scheme
- Typography system
- Layout structure
- Key screens (mockups only, no interactive components yet)

**5.2 Generate components with v0**

Example prompts for v0:

- "A sector input form with a large text input, submit button, and recent searches dropdown"
- "A sub-sector card showing name, number of stocks, brief summary, and an 'Analyze' button with loading state"
- "A streaming progress indicator showing current AI task with animated dots"
- "A stock analysis report viewer with collapsible sections, confidence badge, and action buttons"

Copy generated code into your Next.js app.

**5.3 Refine in Cursor**

- Adjust Tailwind classes to match Figma design
- Add TypeScript types
- Connect to actual API endpoints
- Fix responsiveness

**Key pages to build:**

- `/` - Home (sector input)
- `/analysis/[id]` - Sector results + sub-sector selection
- `/subsector/[id]` - Individual sub-sector with stock analyses
- `/stock/[id]` - Deep stock analysis viewer
# Components Overview
Examples (to be replaced by actual component quick descriptions):
## Primitives
- **Button** - Flexible button with optional left/right icons and text, supports 5 variants (primary, subtle, outline, ghost, disabled) plus loading state with spinner
- **MenuItem** - Flexible button with optional left/right icons and text, supports hover, selected, and disabled states
- **Sidebar** - App navigation sidebar with collapsible state, main action menu items, and recent analyses list
- **DatabaseHeader** - Table header cell with icon, label, and optional right border
- **DatabaseCell** - Table data cell with text/number/tags variants, optional donut chart, and borders
- **Tag** - Colored pill-shaped label for categorization
- **DonutChart** - Small circular progress indicator for conviction scores
- **DatabaseTable** - Full-width table displaying analyzed companies with 13 columns (company info, holding status, returns, conviction score with donut, sectors, currency, price thresholds, targets, dates)
- **ChatInputField** - Vertical stack with textarea input and button row (analysis type selector dropdown + primary launch button)
- **ResearchStatus** - Bordered vertical stack showing research stage (e.g., "Initiating Research", "Research Complete", "Error") and progress metadata (sources count + duration)
- **SubSectorLauncher** - Horizontal container with sub-sector info (rank, name, stock count, description with "Read more" link) and action button with multiple states (Prepare Research, Research Initiated, Analysing with progress, Writing Report, Auditing Report, Research Completed)
# Design Guidelines: Glassmorphic Dashboard Application

## Design Approach
**Reference-Based Approach** inspired by modern fintech and analytics dashboards (Stripe Dashboard, Plaid, Linear) with heavy glassmorphic aesthetics and gradient overlays. The design emphasizes data visualization clarity while maintaining visual sophistication through layered transparency effects.

## Core Design Elements

### A. Color Palette

**Background System:**
- Primary Background: Deep gradient from 220 95% 8% to 250 90% 12% (dark blue-purple base)
- Card Backgrounds: Glassmorphic overlays with 10-15% white opacity and backdrop blur
- Gradient Overlays: Layered radial gradients in blue (210 100% 60%), mint (160 85% 65%), coral (15 90% 70%), and purple (280 85% 65%) at 20-30% opacity

**Interactive Elements:**
- Primary Actions: 210 100% 55% (vibrant blue)
- Success States: 160 85% 55% (mint green)
- Alert/Status: 15 90% 65% (coral)
- Secondary: 280 85% 60% (purple)
- Text Primary: 0 0% 98%
- Text Secondary: 220 15% 70%

### B. Typography

**Font Stack:**
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts CDN)
- Monospace: 'JetBrains Mono' for numerical data

**Type Scale:**
- Hero Numbers: text-5xl to text-6xl, font-bold (metrics)
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-sm to text-base
- Labels/Captions: text-xs, uppercase tracking-wide

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Card padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Grid gaps: gap-4 to gap-6
- Content margins: mx-4 to mx-8

**Responsive Grid:**
- Mobile (base): Single column, full-width cards
- Tablet (md:): 2-column grid for metrics
- Desktop (lg:): 3-4 column grid, sidebar navigation

**Container Strategy:**
- Dashboard container: max-w-7xl mx-auto px-4
- Mobile app preview: Centered, max-w-sm with iPhone frame mockup
- Chart containers: aspect-video or aspect-square

### D. Component Library

**Navigation:**
- Top bar with logo, search input (translucent background), filter pills, and action buttons
- Mobile: Hamburger menu with slide-out drawer
- Search: Glassmorphic input with icon prefix, rounded-full

**Data Cards:**
- Glassmorphic containers: bg-white/10, backdrop-blur-xl, rounded-2xl
- Border: border border-white/20
- Shadow: shadow-2xl with colored glow matching gradient
- Hover: Transform scale-[1.02], transition-all duration-300

**Metrics Display:**
- Large numerical values with trend indicators (↑↓ arrows)
- Circular progress rings (stroke-dasharray animations)
- Status badges: pill-shaped, gradient fills, text-xs uppercase
- Icon backgrounds: Rounded squares with gradient fills

**Charts & Visualizations:**
- Use Chart.js or Recharts via CDN
- Line charts: Gradient fills beneath curves
- Area charts: Stacked with semi-transparent fills
- Circular progress: SVG-based with animated strokes
- Color mapping: Match gradient palette (blue, mint, coral, purple)

**Interactive Elements:**
- Toggle switches: Gradient track when active, smooth transitions
- Buttons: Primary (gradient fill), Secondary (glassmorphic outline)
- Dropdowns: Glassmorphic backdrop with subtle borders
- Tooltips: Small glassmorphic cards on hover

**Mobile App Preview:**
- iPhone frame mockup (black rounded rectangle with notch)
- Inner content: Full dashboard view scaled to fit
- Glassmorphic overlay on frame edges
- Position: Centered or offset with floating effect

### E. Visual Effects

**Glassmorphism:**
- Card surfaces: backdrop-blur-xl with bg-white/10
- Borders: border-white/20
- Overlays: Multiple layered divs with radial gradients at low opacity

**Gradients:**
- Background: Multi-point radial gradients (top-left blue, bottom-right purple)
- Card accents: Subtle gradient borders using pseudo-elements
- Button fills: Linear gradients at 45deg
- Chart fills: Gradient stops matching data states

**Depth & Elevation:**
- Cards: shadow-2xl with colored blur
- Floating elements: Transform translateY with higher z-index
- Layering: Use z-10, z-20, z-30 for stacking context

**Micro-interactions:**
- Hover: Subtle lift (translateY(-2px)) with enhanced shadow
- Click: Brief scale-down (scale-95) then spring back
- Loading: Skeleton shimmer effect on data cards
- Charts: Animated path drawing on mount

## Images

**Mobile App Preview Frame:**
- iPhone 14 Pro mockup image (black frame with dynamic island)
- Place in hero section or featured card
- Overlay dashboard screenshot inside frame
- Add subtle reflection/shadow beneath

**Background Elements:**
- Abstract gradient orbs (blurred circles) as decorative elements
- Floating in background with low opacity
- Create depth without distraction

## Accessibility

- Maintain WCAG AA contrast ratios despite dark theme
- Glassmorphic elements must have sufficient text contrast (use darker overlays when needed)
- All interactive elements have focus states with visible rings
- Chart data includes aria-labels and screen reader announcements
- Keyboard navigation fully supported across dashboard

## Responsive Behavior

**Mobile (< 768px):**
- Stack all cards vertically
- Full-width chart containers
- Collapsible navigation drawer
- Reduced padding (p-4 instead of p-8)
- iPhone preview as hero at top

**Tablet (768px - 1024px):**
- 2-column metric grid
- Side-by-side app preview and stats
- Retained glassmorphic effects

**Desktop (> 1024px):**
- 3-4 column layout for metrics
- Sidebar navigation option
- Larger charts with more detail
- Enhanced glassmorphic layering effects
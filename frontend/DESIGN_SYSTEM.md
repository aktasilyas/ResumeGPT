# ResumeGPT Design System

> A production-grade design system built for consistency, scalability, and exceptional user experience.

## Philosophy

Our design system is inspired by **Linear**, **Vercel**, **Notion**, and **Apple** — products known for their calm, confident, and professional interfaces.

### Core Principles

1. **Semantic First** - Use design tokens, not hardcoded colors
2. **Consistent Spacing** - 4px grid system for predictable layouts
3. **Subtle Interactions** - Smooth animations that feel natural
4. **Surface Hierarchy** - Elevation through subtle shadows, not heavy borders
5. **Accessibility Built-in** - Proper contrast, focus states, and keyboard navigation

---

## Color System

### Semantic Tokens

**Never use arbitrary colors in components.** Always use semantic tokens that adapt to light/dark mode automatically.

#### Base

```tsx
background     // Main app background
surface        // Card/panel background
surface-hover  // Card hover state
overlay        // Modal/dialog background
```

#### Text

```tsx
foreground         // Primary text (near-black/near-white)
foreground-muted   // Secondary text (gray)
foreground-subtle  // Tertiary text (lighter gray)
```

#### Brand & Accents

```tsx
primary           // Emerald brand color
primary-hover     // Primary hover state
accent            // Blue accent
```

#### Semantic States

```tsx
success   // Green - success states
warning   // Amber - warning states
danger    // Red - errors/destructive actions
info      // Cyan - informational messages
```

#### Borders

```tsx
border        // Default border
border-hover  // Hover state
border-strong // Emphasized borders
```

### Usage Examples

```tsx
// ✅ CORRECT - Semantic tokens
<div className="bg-surface border border-border">

// ❌ WRONG - Hardcoded colors
<div className="bg-slate-100 border border-gray-200">
```

---

## Typography

### Font Families

- **Body**: Inter - Clean, readable, professional
- **Headings**: Poppins - Strong, confident, modern
- **Code**: JetBrains Mono - Monospace for code

### Scale

```tsx
text-xs    // 0.75rem - Captions, meta text
text-sm    // 0.875rem - UI text, labels
text-base  // 0.9375rem (15px) - Body text
text-lg    // 1.125rem - Emphasized text
text-xl    // 1.25rem - Small headings
text-2xl   // 1.5rem - Section headings
text-3xl   // 1.875rem - Page headings
text-4xl   // 2.25rem - Hero headings
```

### Hierarchy

```tsx
<h1 className="font-heading font-semibold text-4xl">Main Title</h1>
<h2 className="font-heading font-semibold text-3xl">Section</h2>
<p className="text-base text-foreground-muted">Body text</p>
<span className="text-sm text-foreground-subtle">Meta info</span>
```

---

## Spacing

We use a **consistent 4px grid system** for spacing:

```
0   = 0px
1   = 4px
2   = 8px
3   = 12px
4   = 16px
6   = 24px
8   = 32px
12  = 48px
16  = 64px
```

### Usage

```tsx
// Consistent spacing
<div className="p-6">       // 24px padding
<div className="gap-4">     // 16px gap
<div className="mb-8">      // 32px margin bottom
```

---

## Borders & Radius

### Border Radius

```tsx
rounded-sm   // 0.5rem - Subtle rounding
rounded      // 0.75rem - Default (cards, inputs)
rounded-lg   // 1rem - Large elements
rounded-xl   // 1.5rem - Hero elements
rounded-full // Pills, avatars
```

### Border Width

Use `border-2` for inputs and interactive elements for better visibility.

```tsx
// Input fields
<input className="border-2 border-border focus:border-primary" />

// Cards
<div className="border border-border" />
```

---

## Shadows

We use **custom shadow tokens** that adapt to light/dark mode:

```tsx
shadow-smooth     // Subtle elevation
shadow-smooth-md  // Card elevation
shadow-smooth-lg  // Modal/dialog elevation
```

### Usage

```tsx
// Card with subtle shadow
<div className="bg-surface shadow-smooth">

// Elevated modal
<div className="bg-overlay shadow-smooth-lg">
```

---

## Components

### Button Hierarchy

```tsx
// Primary - Main action
<Button>Save Changes</Button>

// Secondary - Less emphasis
<Button variant="secondary">Cancel</Button>

// Outline - Alternative action
<Button variant="outline">Learn More</Button>

// Ghost - Minimal action
<Button variant="ghost">Settings</Button>

// Destructive - Dangerous action
<Button variant="destructive">Delete</Button>
```

### Input Fields

All inputs use consistent styling:

```tsx
<Input
  type="text"
  placeholder="Enter text..."
  className="..." // Additional styling if needed
/>
```

**Key Features:**
- 2px border for visibility
- Smooth focus states with ring
- Hover state on border
- Disabled state styling

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Animations

### Principles

1. **Subtle** - Animations enhance, don't distract
2. **Fast** - 150-300ms duration for most interactions
3. **Natural easing** - Use `ease-out` for entrances, `ease-in` for exits

### Available Animations

```tsx
// Fade
animate-fade-in
animate-fade-out

// Slide
animate-slide-in-from-top
animate-slide-in-from-bottom
animate-slide-in-from-left
animate-slide-in-from-right

// Scale
animate-scale-in
animate-scale-out

// Utility
animate-pulse-subtle
animate-spin-slow
animate-shimmer // Loading state
```

### Interactive States

All interactive elements should have:

```tsx
// Button press effect
active:scale-[0.98]

// Smooth transitions
transition-all duration-200

// Focus ring
focus-visible:ring-2 focus-visible:ring-ring
```

---

## Layout Utilities

### Surfaces

```tsx
// Basic surface
<div className="surface">

// Interactive surface (hover effect)
<div className="surface-interactive">

// Glass effect
<div className="surface-glass">
```

### Navigation

```tsx
// Navbar with glass effect
<nav className="navbar">
  <div className="container-app">
    {/* Content */}
  </div>
</nav>
```

### Editor Layout

```tsx
<div className="editor-container">
  <aside className="sidebar">Sidebar</aside>
  <main className="content-area">Main content</main>
</div>
```

### Status Indicators

```tsx
<span className="status-success">Active</span>
<span className="status-warning">Pending</span>
<span className="status-danger">Error</span>
<span className="status-info">Info</span>
```

### Badges

```tsx
// AI feature badge
<span className="badge-ai">
  <Sparkles className="w-3 h-3" />
  AI Powered
</span>

// Pro badge
<span className="badge-pro">
  <Crown className="w-3 h-3" />
  PRO
</span>
```

---

## Dark Mode

### How It Works

Dark mode is implemented using CSS variables that change based on the `.dark` class on the `html` element.

```tsx
// ThemeProvider handles this automatically
<html className="dark">
```

### Testing

Always test components in both themes:

1. Toggle theme in app
2. Verify text contrast
3. Check shadow visibility
4. Ensure borders are visible

### Best Practices

```tsx
// ✅ DO - Use semantic tokens
<div className="bg-surface text-foreground">

// ❌ DON'T - Use dark: overrides
<div className="bg-white dark:bg-gray-900">
```

---

## Accessibility

### Focus States

All interactive elements have visible focus states:

```tsx
focus-visible:ring-2 focus-visible:ring-ring
```

### Color Contrast

Our semantic tokens ensure WCAG AA compliance:
- Light mode: Near-black text on white
- Dark mode: Near-white text on soft dark

### Keyboard Navigation

Test all flows with keyboard only:
- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals

---

## Examples

### Hero Section

```tsx
<section className="py-16 px-4">
  <div className="container-app">
    <h1 className="font-heading text-5xl font-semibold mb-4">
      Build Your Perfect Resume
    </h1>
    <p className="text-lg text-foreground-muted mb-8">
      AI-powered resume builder for modern professionals
    </p>
    <div className="flex gap-4">
      <Button size="lg">Get Started</Button>
      <Button size="lg" variant="outline">Learn More</Button>
    </div>
  </div>
</section>
```

### Dashboard Card

```tsx
<Card className="surface-interactive">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>My Resume</CardTitle>
      <Badge className="badge-ai">
        <Sparkles className="w-3 h-3" />
        AI Ready
      </Badge>
    </div>
    <CardDescription>
      Updated 2 days ago
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-foreground-muted">
      Software Engineer | 5 years experience
    </p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button size="sm">Edit</Button>
    <Button size="sm" variant="outline">Download</Button>
  </CardFooter>
</Card>
```

### Form

```tsx
<form className="space-y-4">
  <div>
    <label className="text-sm font-medium text-foreground mb-1.5 block">
      Email
    </label>
    <Input
      type="email"
      placeholder="you@example.com"
    />
  </div>
  <div>
    <label className="text-sm font-medium text-foreground mb-1.5 block">
      Message
    </label>
    <Textarea
      placeholder="Your message..."
      rows={4}
    />
  </div>
  <Button type="submit" className="w-full">
    Send Message
  </Button>
</form>
```

---

## Migration Guide

### Updating Existing Code

1. **Replace hardcoded colors** with semantic tokens
2. **Remove `dark:` overrides** - let CSS variables handle it
3. **Update shadows** to use `shadow-smooth-*` variants
4. **Standardize spacing** to the 4px grid

### Before

```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <h2 className="text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### After

```tsx
<div className="bg-surface border border-border">
  <h2 className="text-foreground">Title</h2>
  <p className="text-foreground-muted">Description</p>
</div>
```

---

## Resources

- **Tailwind Config**: `tailwind.config.js`
- **CSS Variables**: `src/index.css`
- **Components**: `src/components/ui/*`

---

Built with ❤️ for production-grade UX

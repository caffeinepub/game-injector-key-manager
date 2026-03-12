# Game Injector Key Manager

## Current State
The app has:
- Welcome/Role selector screen (red-black theme, moving particles)
- Admin login page (red-black theme, skull icon, pill inputs)
- Reseller login page (red-black theme)
- Admin dashboard (tabs layout, purple gradient background with particles)
- Reseller dashboard (purple gradient background with particles)
- Stats cards, keys table with popup, injectors, resellers, API docs, settings sections

## Requested Changes (Diff)

### Add
- Sidebar navigation layout for admin and reseller dashboards (replacing top tabs)
- Donut/ring chart for key statistics visualization in admin dashboard
- Sidebar with user avatar, username, role badge, credits
- Stats cards with colored top-border gradient line accents (green, red, cyan, purple)
- Recent activity section in admin dashboard
- Sign out button inside sidebar at bottom

### Modify
- All pages: Fully rounded corners everywhere (rounded-2xl/rounded-3xl) — no sharp edges on any card, button, input, badge, table, dialog, or modal
- Login pages (Admin + Reseller + RoleSelector): Redesign to match image-8.png — very dark bg with purple glow, centered card with rounded-3xl corners, purple shield icon with glow, white/light input fields with icon prefix, large yellow/amber "Sign In" CTA button, "Welcome Back" style heading
- Admin and Reseller dashboards: Redesign layout to match image-7.png — dark sidebar with user info, stats cards with accent border lines, donut chart, recent activity, no top gradient/particles background (clean dark bg like #0d1117)
- All buttons: rounded-full or rounded-2xl (no sharp corners)
- Stats cards: large bold monospace numbers, colored icon badges, accent color top borders
- Tables: rounded containers, rounded rows, no sharp edges
- Dialogs and modals: rounded-2xl corners

### Remove
- Purple gradient background and PurpleParticles from admin/reseller dashboards
- Moving particles and red gradient from login/welcome screens (replace with clean dark bg + purple glow per reference)
- Top navigation tabs layout in favor of sidebar

## Implementation Plan
1. Update global CSS and tailwind for rounded defaults and dark color tokens
2. Redesign RoleSelector (welcome/role screen) to match login card style from image-8.png
3. Redesign AdminLogin and ResellerLogin to match image-8.png — dark bg, purple glow, shield icon, white inputs, amber button
4. Redesign Admin Dashboard (App.tsx Dashboard component) with sidebar layout matching image-7.png
5. Redesign ResellerDashboard with sidebar layout
6. Update StatsCards to show colored accent top borders and large numbers
7. Add KeyStatsChart (donut chart) component for admin dashboard
8. Update all Button, Card, Input, Dialog, Badge components to use rounded-full/rounded-2xl
9. Remove particles from dashboards, simplify to clean dark background

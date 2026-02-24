# Game Injector Key Manager

## Current State

The application has three authentication screens:
1. **Welcome/Role Selector** - Has purple theme with live animated particles, gradient backgrounds, custom Orbitron font, and reactive glowing buttons
2. **Admin Login** - Basic card design with standard Tailwind theme, no animations
3. **Reseller Login** - Basic card design with standard Tailwind theme, no animations

The admin and reseller login pages currently use a simple card layout with standard background, lacking the visual polish and dynamic effects of the welcome screen.

## Requested Changes (Diff)

### Add
- Live animated particle/orb system to admin login background
- Live animated particle/orb system to reseller login background
- Moving diagonal gradient lines effect to both login pages
- Purple gradient animated background (from-purple-950 via-violet-900 to-purple-950) to both pages
- Orbitron custom gaming font for headings on both login pages
- Glowing icon effect with pulse animation on both pages
- Backdrop blur and purple-tinted glass morphism effect to login cards
- Purple color scheme matching welcome screen to both pages

### Modify
- AdminLogin component background from basic `bg-background` to purple-themed animated background
- ResellerLogin component background from basic `bg-background` to purple-themed animated background
- Login card styling to use purple-tinted glass morphism with border glow effects
- Heading fonts to use Orbitron font family
- Icon containers to have glowing pulse animations
- Color palette from neutral to purple/violet/fuchsia gradient theme

### Remove
- None (preserving all functionality, only enhancing visual design)

## Implementation Plan

1. **Update AdminLogin.tsx**
   - Replace plain background with layered purple gradient background
   - Add floating animated particles/orbs (5-6 elements with different sizes and animation timings)
   - Add moving diagonal gradient lines overlay
   - Convert login card to glass morphism style with purple tint and backdrop blur
   - Apply Orbitron font to "Admin Authentication" heading
   - Add glowing pulse effect to Shield icon container
   - Update color scheme to purple/fuchsia/violet palette

2. **Update ResellerLogin.tsx**
   - Apply same background treatment as AdminLogin (purple gradients, particles, diagonal lines)
   - Convert login card to matching glass morphism style
   - Apply Orbitron font to "Reseller Login" heading  
   - Add glowing pulse effect to Users icon container
   - Update color scheme to match purple theme

3. **Ensure consistency**
   - Both login pages should visually match the welcome screen's aesthetic
   - Maintain all existing functionality (authentication logic, error handling, back button)
   - Keep form inputs and buttons functional
   - Preserve responsive design

## UX Notes

- The purple animated theme creates visual continuity across all three authentication screens
- Live particle animations provide engaging visual feedback without distracting from login functionality
- Glass morphism effect makes login cards feel modern and premium
- Orbitron font reinforces gaming/tech aesthetic matching the injector dashboard theme
- All animations should be smooth and performant (CSS-based, no heavy JS)
- Maintain accessibility - ensure text contrast remains readable against animated backgrounds

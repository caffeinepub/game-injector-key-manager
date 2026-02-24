# Game Injector Key Manager

## Current State

The application has:
- **Admin Dashboard (App.tsx)**: Main dashboard with tabs for keys, injectors, resellers, API docs, and settings. Currently uses standard Tailwind background colors with theme toggle support.
- **Reseller Dashboard (ResellerDashboard.tsx)**: Credit-based key creation portal with credit information card and keys table. Currently uses standard Tailwind background colors with theme toggle.
- **Welcome/Login Pages**: Already styled with red-black theme and animated white particles background with skull icons and glowing effects.

Both dashboards use standard Tailwind CSS background styling without animated particle effects.

## Requested Changes (Diff)

### Add
- **Animated particle background** for Admin Dashboard with:
  - Purple and white color scheme
  - White particles continuously moving (pre-animated, instant motion)
  - Particles load in already-moving state (no delay or fade-in)
  - Similar particle system as welcome/login pages but with purple-white theme
- **Animated particle background** for Reseller Dashboard with same specifications
- Purple-white gradient theme styling for both dashboards

### Modify
- Admin Dashboard (App.tsx): Add particle canvas background, update theme colors to purple-white scheme
- Reseller Dashboard (ResellerDashboard.tsx): Add particle canvas background, update theme colors to purple-white scheme

### Remove
- No components removed

## Implementation Plan

1. **Create ParticleBackground component** (or reuse existing if available):
   - Canvas-based particle animation system
   - White particles on purple gradient background
   - Particles should be pre-animated (no initialization delay)
   - Random initial positions and velocities for seamless loading
   - Continuous smooth movement

2. **Update Admin Dashboard (App.tsx)**:
   - Import and integrate ParticleBackground component
   - Apply purple-white gradient color scheme
   - Ensure particles render behind dashboard content
   - Maintain existing functionality (tabs, theme toggle, logout)

3. **Update Reseller Dashboard (ResellerDashboard.tsx)**:
   - Import and integrate ParticleBackground component
   - Apply purple-white gradient color scheme
   - Ensure particles render behind dashboard content
   - Maintain existing functionality (credit display, key creation)

4. **Theme consistency**:
   - Keep welcome/login pages unchanged (red-black theme)
   - Apply purple-white theme ONLY to admin and reseller dashboards
   - Ensure theme toggle still functions properly

5. **Validation**:
   - Run typecheck to ensure no TypeScript errors
   - Run lint to ensure code quality
   - Run build to verify production readiness
   - Test that particles are immediately animated on page load

## UX Notes

- Particles should create a premium, gaming-focused atmosphere
- Purple-white theme provides visual distinction from the red-black login theme
- Pre-animated particles ensure smooth, professional loading experience
- Background should enhance but not distract from dashboard functionality
- Maintain readability of all text and UI elements against particle background

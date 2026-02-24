# Game Injector Key Manager

## Current State

The application currently has a login flow using Internet Identity:
- LoginScreen component with Internet Identity authentication
- Dashboard component showing key management interface
- App.tsx manages authentication state and shows LoginScreen or Dashboard based on `loginStatus`

## Requested Changes (Diff)

### Add
- Admin login page with username/password authentication
- Authentication state management for admin session
- Username: "Gaurav", Password: "Gaurav_20"
- Admin login appears before the Internet Identity login

### Modify
- App.tsx flow to show: AdminLogin → LoginScreen (Internet Identity) → Dashboard
- Authentication flow now has two stages: admin authentication, then Internet Identity

### Remove
- None

## Implementation Plan

1. Create AdminLogin component with username/password form
2. Add admin authentication state (localStorage-based session)
3. Update App.tsx to check admin authentication first
4. Only show Internet Identity login after admin authentication succeeds
5. Add logout from admin session capability

## UX Notes

- Admin credentials are hardcoded: username "Gaurav", password "Gaurav_20"
- Admin login uses a clean form with username and password inputs
- Error messages shown for invalid credentials
- Admin session persists across page refreshes via localStorage
- Users must pass admin authentication before reaching Internet Identity login

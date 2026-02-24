# Game Injector Key Management Dashboard

## Current State

This is a fresh Caffeine project with:
- React + TypeScript frontend scaffolding
- shadcn/ui component library installed
- Internet Identity authentication setup
- No backend APIs implemented
- No App.tsx component (needs to be created)

## Requested Changes (Diff)

### Add

- **Backend APIs**:
  - Create login key with customizable duration (hours, days, or permanent)
  - List all login keys with their status (active/blocked)
  - Block a specific key
  - Unblock a specific key
  - Get key details (creation date, expiration, status, usage stats)
  
- **Frontend Dashboard UI**:
  - Main dashboard layout with navigation
  - Key creation form with duration selector (hours, days, or permanent)
  - Keys table displaying: key ID, creation date, expiration date, status, actions
  - Block/Unblock toggle buttons for each key
  - Visual status indicators (active = green, blocked = red)
  - Key statistics overview (total keys, active keys, blocked keys)
  - Copy key functionality for easy sharing

### Modify

- Create `App.tsx` with dashboard layout

### Remove

- None

## Implementation Plan

1. **Backend (Motoko)**:
   - Define `LoginKey` data structure with fields: id, key, createdAt, expiresAt, isBlocked, usageCount
   - Implement key generation with unique IDs
   - Add CRUD operations for keys (create, read, list, block, unblock)
   - Add duration calculation logic (convert hours/days to timestamp)
   - Store keys in stable storage

2. **Frontend Components**:
   - `App.tsx`: Main dashboard container with authentication guard
   - `Dashboard.tsx`: Main dashboard view with stats and key list
   - `CreateKeyDialog.tsx`: Modal form for creating new keys with duration picker
   - `KeysTable.tsx`: Table component displaying all keys with action buttons
   - `KeyStatusBadge.tsx`: Visual status indicator component
   - Wire up backend API calls using React Query
   - Add toast notifications for user feedback

3. **Integration**:
   - Connect frontend to backend APIs
   - Handle loading and error states
   - Add real-time status updates after block/unblock actions

## UX Notes

- Dashboard should have a clean, modern admin panel aesthetic
- Use cards for statistics overview at the top
- Table should be sortable and filterable
- Duration selector should offer quick presets (1 hour, 24 hours, 7 days, 30 days, permanent)
- Block/Unblock actions should show confirmation dialogs
- Show visual feedback when copying keys
- Display relative time for expiration ("expires in 2 days" vs absolute dates)
- Blocked keys should be visually distinct in the table

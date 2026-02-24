# Game Injector Key Manager

## Current State

The application currently supports:
- **Admin authentication**: Username/password login (Gaurav/Gaurav_20)
- **Key management**: Create keys with customizable duration, device limits, and injector assignment
- **Injector management**: Add injectors via APK upload or manual entry, with auto-redirect configuration
- **Key controls**: Block/unblock keys, track device usage
- **Customization**: Panel name and theme presets (5 themes)

## Requested Changes (Diff)

### Add
- **Reseller user type**: New account type separate from admin
- **Reseller authentication**: Separate login flow with username/password
- **Reseller management interface (Admin)**: 
  - Create reseller accounts with username/password
  - Assign/modify credit balance for resellers
  - View all resellers and their credit balances
  - Delete reseller accounts
- **Credit system**: 
  - Each key creation costs credits (configurable by admin)
  - Resellers can only create keys if they have sufficient credits
  - Admin has unlimited keys (no credit cost)
- **Reseller dashboard**: 
  - View own credit balance
  - Create keys for any injector (consuming credits)
  - View keys created by the reseller
  - Cannot access injector management or settings

### Modify
- **Login flow**: Add option to choose between Admin and Reseller login
- **Key creation**: Deduct credits from reseller on key creation
- **Backend API**: Extend to support reseller accounts, credit management, and role-based permissions

### Remove
- None

## Implementation Plan

### Backend (Motoko)
1. Add Reseller data type with username, password, credits, created timestamp
2. Add reseller CRUD operations (create, authenticate, get all, update credits, delete)
3. Add credit cost configuration for key creation (default: 1 credit per key)
4. Modify createKey to accept optional reseller ID and deduct credits
5. Add role-based authorization checks for injector/settings operations
6. Add getResellerKeys(resellerId) to fetch keys created by specific reseller

### Frontend
1. **LoginSelector component**: Choose between Admin/Reseller login
2. **ResellerLogin component**: Login form for resellers
3. **Admin - Resellers tab**: 
   - Table showing all resellers (username, credits, created date)
   - "Add Reseller" dialog with username/password/initial credits
   - "Add Credits" action for each reseller
   - "Delete Reseller" action
4. **Reseller Dashboard**:
   - Header showing credit balance
   - CreateKeyDialog with credit cost display
   - KeysTable filtered to reseller's keys only
   - No access to Injectors or Settings tabs
5. Update AdminLogin to use new login selector
6. Add role context/state to manage Admin vs Reseller views

## UX Notes
- Login screen shows two clear options: "Admin Login" and "Reseller Login"
- Resellers see prominent credit balance in dashboard header
- Key creation dialog shows "Cost: X credits" for resellers
- Insufficient credits show error toast before key creation
- Admin can set credit cost per key in Settings (default: 1)
- Resellers only see keys they created, not all keys
- Clean separation between admin and reseller capabilities

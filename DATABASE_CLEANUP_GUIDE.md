# Database Cleanup Guide - Client State Standardization

## Overview
This guide explains how to clean up old/legacy client states in the database and migrate them to the new standardized state system.

## Standardized States

### Lead States
- **`applied`** - Lead is in the application phase
- **`scheduled`** - Meeting is scheduled
- **`meeting-completed`** - Meeting has been completed
- **`sold`** - Client has been converted and paid
- **`disqualified`** - Lead doesn't meet requirements

### Booking States
- **`pending`** - Booking created but not confirmed
- **`confirmed`** - Meeting confirmed
- **`meeting-completed`** - Meeting has occurred
- **`sold`** - Booking converted to sale
- **`cancelled`** - Booking was cancelled
- **`No Confirmado`** - Booking not confirmed (legacy)

## Running the Cleanup Script

### Prerequisites
1. Ensure MongoDB is running and accessible at `mongodb://localhost:27017/stivenads`
2. You have Node.js installed in your backend directory
3. All necessary npm packages are installed

### Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the cleanup script:**
   ```bash
   node cleanup-states.js
   ```

3. **Review the output:**
   - The script will display all records that are being updated
   - You'll see a summary of changes made
   - State distribution report after cleanup

### What the Script Does

1. **Connects to MongoDB** at the configured URL
2. **Analyzes all Leads** and checks for invalid states
3. **Maps old states** to new standardized states according to:
   - `'lead-applied'` → `'applied'`
   - `'lead-scheduled'` → `'scheduled'`
   - `'lead-completed'` → `'meeting-completed'`
   - `'completed'` → `'meeting-completed'`
   - `'converted'` → `'sold'`
   - And other common legacy states

4. **Handles edge cases:**
   - Empty strings default to `'applied'` for leads, `'pending'` for bookings
   - Null/undefined values are converted to defaults
   - Unrecognized states default to `'applied'`

5. **Analyzes all Bookings** using similar logic
6. **Generates a summary** showing:
   - Total records processed
   - Records updated
   - Final state distribution

### Example Output

```
🔧 Starting database cleanup...

✅ Connected to MongoDB

📋 Cleaning up Lead states...
  ❌ Invalid state for lead "Juan García": "completed"
    → Mapping to: "meeting-completed"
  ✅ Leads cleaned: 3 updated, 3 had invalid states

📋 Cleaning up Booking states...
  ✅ Bookings cleaned: 1 updated, 1 had invalid states

📊 Summary:
  • Total Leads: 25
  • Leads Updated: 3
  • Total Bookings: 20
  • Bookings Updated: 1
  • Total Records Updated: 4

📈 State Distribution After Cleanup:
  Lead States:
    - applied: 15
    - scheduled: 5
    - meeting-completed: 3
    - sold: 2
  Booking States:
    - confirmed: 15
    - pending: 3
    - meeting-completed: 2

✅ Database cleanup completed successfully!

🔌 Disconnected from MongoDB
```

## Important Notes

⚠️ **Backup your database before running this script!**

This script:
- ✅ Is safe to run multiple times (idempotent)
- ✅ Will not delete any records
- ✅ Will only update invalid states to valid ones
- ✅ Preserves all other data in the documents
- ❌ Should be backed up beforehand just in case

## Reverting Changes

If you need to revert changes, you can restore from your MongoDB backup. The script doesn't delete anything, so a backup restore is the recommended approach.

## Custom Mapping

If you have custom old states not covered by the script, you can edit the `stateMapping` or `bookingStateMapping` objects in `cleanup-states.js`:

```javascript
const stateMapping = {
  'your-old-state': 'new-standard-state',
  // ... more mappings
};
```

Then run the script again.

## API Endpoints for Manual Cleanup (if needed)

If you prefer to clean up specific records manually through the API:

**Update a Lead status:**
```bash
PUT /api/leads/update-status/:id
Body: { "status": "applied" }
```

**Update a Booking status:**
```bash
PUT /api/booking/:id
Body: { "status": "confirmed" }
```

## Verification

After running the cleanup, verify the changes in your admin panel:

1. Go to **Admin Panel** → **Estadísticas**
2. Check that all clients are showing with valid states
3. Use the state filter dropdown to verify all states are standardized
4. No "undefined" or "unknown" states should appear

## Support

If you encounter any issues:
1. Ensure MongoDB is running
2. Check the error message in the console
3. Verify database credentials in `backend/server.js`
4. Check MongoDB logs for connection issues

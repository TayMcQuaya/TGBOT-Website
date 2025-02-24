# Waitlist Management Guide

Quick reference guide for managing your waitlist system.

## Quick Commands

### View Entries
```bash
# See all signups in development
node manage-waitlist.js dev view

# See all signups in production
node manage-waitlist.js prod view
```
Use this to:
- Check new signups
- Verify email submissions
- Monitor signup dates and IP addresses

### Export Data
```bash
# Export development data to Excel
node manage-waitlist.js dev export

# Export production data to Excel
node manage-waitlist.js prod export
```
Use this when you need to:
- Share signup data with team
- Analyze signups in Excel
- Create backup of current entries

### Remove Entries
```bash
# Remove email from development
node manage-waitlist.js dev delete-email user@example.com

# Remove email from production
node manage-waitlist.js prod delete-email user@example.com
```
Use this to:
- Remove spam entries
- Delete duplicate signups
- Honor removal requests

## Common Tasks

### 1. Daily Check
```bash
# Check new signups
node manage-waitlist.js prod view

# Export current list
node manage-waitlist.js prod export
```

### 2. Cleanup Spam
```bash
# View entries to identify spam
node manage-waitlist.js prod view

# Remove spam entries
node manage-waitlist.js prod delete-email spam@example.com
```

### 3. Data Analysis
```bash
# Export to Excel
node manage-waitlist.js prod export
# Find file in server/exports/waitlist-[timestamp].xlsx
```

## Tips

1. **Always verify environment:**
   - Use `dev` for testing
   - Use `prod` for real data

2. **Before deleting:**
   - Always export data first
   - Double-check email addresses
   - Keep record of deletions

3. **Regular Maintenance:**
   - Export data weekly
   - Check for spam daily
   - Verify backups monthly

## Backup Location

- Development: `server/dev_data/waitlist_dev.db`
- Production: `server/prod_data/waitlist.db`
- Exports: `server/exports/`
- Backups: `server/backups/`

## Need Help?

1. Check the logs in `server/error.log`
2. Use health check endpoint: `/health`
3. View stats: `/api/stats` (requires API key) 
# Waitlist Management Tool

A command-line tool to manage your waitlist entries, including viewing, exporting, and deleting records.

## Prerequisites

Make sure you have the following installed:
- Node.js
- Required npm packages (run `npm install` in the server directory)

## Commands

### View All Entries
View all waitlist entries in the terminal:
```bash
node manage-waitlist.js view
```

### Export Options

#### Export to Excel (Recommended)
Export the waitlist to a formatted Excel file:
```bash
node manage-waitlist.js export
```
This creates a nicely formatted Excel file with:
- Blue header row with white text
- Auto-sized columns
- Proper date formatting
- Professional layout

The Excel export will:
- Always save to `exports/waitlist-current.xlsx`
- Automatically backup the previous version before overwriting
- Keep the last 5 backups with timestamps
- Show a preview of the exported data in the terminal

#### Export to CSV
If you need a CSV format:
```bash
node manage-waitlist.js export-csv
```

### Delete Entries

#### Delete by Email
Remove an entry using their email address:
```bash
node manage-waitlist.js delete-email user@example.com
```

#### Delete by ID
Remove an entry using their ID number:
```bash
node manage-waitlist.js delete-id 1
```

## File Locations

- **Current Export**: Always at `exports/waitlist-current.xlsx`
- **Export Backups**: Named `waitlist-backup-[timestamp].xlsx` in the `exports` directory
- **Database**: The SQLite database file is `waitlist.db`
- **Backups**: Daily database backups are stored in the `backups` directory

## Time Zones

All dates are stored and displayed in UTC to ensure consistency across different time zones.

## Tips

1. **Regular Backups**: 
   - Database is backed up daily
   - Previous Excel exports are automatically backed up
   - System keeps last 5 export backups
2. **Excel vs CSV**: Use Excel export for better formatting and readability
3. **After Deletion**: The system automatically shows remaining entries after any deletion
4. **Finding Exports**: 
   - Latest export is always at `waitlist-current.xlsx`
   - Previous versions are in timestamped backup files

## Example Usage

1. View current entries:
   ```bash
   node manage-waitlist.js view
   ```

2. Export to Excel and check the exports folder:
   ```bash
   node manage-waitlist.js export
   ```

3. Remove a specific email:
   ```bash
   node manage-waitlist.js delete-email example@email.com
   ```

## Support

If you need to modify the export format or add new features, the code is well-documented and modular. 
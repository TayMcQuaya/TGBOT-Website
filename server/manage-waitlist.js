const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const db = new sqlite3.Database('waitlist.db');

// Function to export to Excel
function exportToExcel() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM waitlist", [], (err, rows) => {
            if (err) {
                console.error('Error fetching entries:', err.message);
                reject(err);
                return;
            }
            
            // Create exports directory if it doesn't exist
            const exportDir = path.join(__dirname, 'exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir);
            }

            // Format data for Excel
            const data = rows.map(row => ({
                'ID': row.id,
                'Email Address': row.email,
                'Signup Date (UTC)': new Date(row.signup_date).toLocaleString('en-US', {
                    timeZone: 'UTC',
                    timeZoneName: 'short'
                })
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data, {
                header: ['ID', 'Email Address', 'Signup Date (UTC)']
            });

            // Set column widths
            const colWidths = [
                { wch: 5 },  // ID
                { wch: 35 }, // Email
                { wch: 25 }  // Date
            ];
            ws['!cols'] = colWidths;

            // Style the header row
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[address]) continue;
                ws[address].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4A90E2" } },
                    alignment: { horizontal: "center" }
                };
            }

            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Waitlist');

            // Define the main export file and backup paths
            const mainFile = path.join(exportDir, 'waitlist-current.xlsx');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(exportDir, `waitlist-backup-${timestamp}.xlsx`);

            // If current file exists, create a backup
            if (fs.existsSync(mainFile)) {
                fs.copyFileSync(mainFile, backupFile);
                console.log(`\nPrevious export backed up to: ${backupFile}`);

                // Keep only the last 5 backups
                fs.readdir(exportDir, (err, files) => {
                    if (err) {
                        console.error('Error reading export directory:', err);
                        return;
                    }
                    
                    // Get backup files and sort by date (newest first)
                    const backups = files.filter(f => f.startsWith('waitlist-backup-'))
                                      .sort()
                                      .reverse();
                    
                    // Remove old backups
                    backups.slice(5).forEach(file => {
                        fs.unlink(path.join(exportDir, file), err => {
                            if (err) console.error(`Error deleting old backup ${file}:`, err);
                        });
                    });
                });
            }

            // Write the new current file
            XLSX.writeFile(wb, mainFile);
            console.log(`\nExported to: ${mainFile}`);
            
            // Also show a preview of the data
            console.log('\nExport Preview:');
            console.log('----------------');
            data.forEach(row => {
                console.log(`ID: ${row.ID}`);
                console.log(`Email: ${row['Email Address']}`);
                console.log(`Signed up: ${row['Signup Date (UTC)']}`);
                console.log('----------------');
            });

            resolve(mainFile);
        });
    });
}

// Function to export to CSV (keeping for compatibility)
function exportToCSV() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM waitlist", [], (err, rows) => {
            if (err) {
                console.error('Error fetching entries:', err.message);
                reject(err);
                return;
            }
            
            // Create exports directory if it doesn't exist
            const exportDir = path.join(__dirname, 'exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir);
            }
            
            // Create CSV content
            const headers = ['ID', 'Email', 'Signup Date (UTC)'];
            const csvContent = [
                headers.join(','), // Headers row
                ...rows.map(row => {
                    const date = new Date(row.signup_date).toLocaleString('en-US', {
                        timeZone: 'UTC',
                        timeZoneName: 'short'
                    });
                    return `${row.id},"${row.email}","${date}"`;
                })
            ].join('\n');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = path.join(exportDir, `waitlist-${timestamp}.csv`);
            
            // Write to file
            fs.writeFile(filename, csvContent, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing CSV:', err.message);
                    reject(err);
                    return;
                }
                console.log(`\nExported to: ${filename}`);
                resolve(filename);
            });
        });
    });
}

// Function to view all entries
function viewEntries() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM waitlist", [], (err, rows) => {
            if (err) {
                console.error('Error viewing entries:', err.message);
                reject(err);
                return;
            }
            
            console.log('\nWaitlist Entries:');
            console.log('----------------');
            
            rows.forEach((row) => {
                // Convert UTC timestamp to local time
                const localTime = new Date(row.signup_date).toLocaleString('en-US', {
                    timeZone: 'UTC',
                    timeZoneName: 'short'
                });
                console.log(`ID: ${row.id}`);
                console.log(`Email: ${row.email}`);
                console.log(`Signed up: ${localTime}`);
                console.log('----------------');
            });
            resolve(rows);
        });
    });
}

// Function to delete an entry by email
function deleteByEmail(email) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM waitlist WHERE email = ?", [email], function(err) {
            if (err) {
                console.error('Error deleting entry:', err.message);
                reject(err);
                return;
            }
            console.log(`Deleted ${this.changes} entry(s) with email: ${email}`);
            resolve(this.changes);
        });
    });
}

// Function to delete an entry by ID
function deleteById(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM waitlist WHERE id = ?", [id], function(err) {
            if (err) {
                console.error('Error deleting entry:', err.message);
                reject(err);
                return;
            }
            console.log(`Deleted ${this.changes} entry(s) with ID: ${id}`);
            resolve(this.changes);
        });
    });
}

// Handle command line arguments
const command = process.argv[2];
const value = process.argv[3];

async function main() {
    try {
        switch (command) {
            case 'view':
                await viewEntries();
                break;
            
            case 'export':
                await exportToExcel(); // Now using Excel export by default
                break;
            
            case 'export-csv': // Keeping CSV as an option
                await exportToCSV();
                break;
            
            case 'delete-email':
                if (!value) {
                    console.error('Please provide an email address to delete');
                    break;
                }
                await deleteByEmail(value);
                await viewEntries(); // Show remaining entries
                break;
            
            case 'delete-id':
                if (!value) {
                    console.error('Please provide an ID to delete');
                    break;
                }
                await deleteById(parseInt(value));
                await viewEntries(); // Show remaining entries
                break;
            
            default:
                console.log(`
Usage:
  node manage-waitlist.js view          # View all entries
  node manage-waitlist.js export        # Export to Excel (recommended)
  node manage-waitlist.js export-csv    # Export to CSV
  node manage-waitlist.js delete-email <email>
  node manage-waitlist.js delete-id <id>
                `);
        }
    } catch (error) {
        console.error('Operation failed:', error.message);
    } finally {
        db.close();
    }
}

main(); 
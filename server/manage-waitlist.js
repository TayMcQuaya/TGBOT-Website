const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Get environment from command line or default to development
const env = process.argv[2] === 'prod' ? 'production' : 'development';
const dbDir = path.join(__dirname, env === 'production' ? 'prod_data' : 'dev_data');
const DB_NAME = env === 'production' ? 'waitlist.db' : 'waitlist_dev.db';
const dbPath = path.join(dbDir, DB_NAME);

console.log(`Using ${env} database at: ${dbPath}`);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

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
                }),
                'IP Address': row.ip_address,
                'User Agent': row.user_agent
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            // Set column widths
            const colWidths = [
                { wch: 5 },  // ID
                { wch: 35 }, // Email
                { wch: 25 }, // Date
                { wch: 15 }, // IP
                { wch: 50 }  // User Agent
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Waitlist');
            
            // Generate filename with environment and timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `waitlist-${env}-${timestamp}.xlsx`;
            const filePath = path.join(exportDir, filename);
            
            XLSX.writeFile(wb, filePath);
            console.log(`\nExported to: ${filePath}`);
            
            // Show preview
            console.log('\nExport Preview:');
            console.log('----------------');
            data.forEach(row => {
                console.log(`ID: ${row.ID}`);
                console.log(`Email: ${row['Email Address']}`);
                console.log(`Signed up: ${row['Signup Date (UTC)']}`);
                console.log('----------------');
            });

            resolve(filePath);
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
            
            console.log(`\nWaitlist Entries (${env} database):`);
            console.log('----------------');
            
            if (rows.length === 0) {
                console.log('No entries found.');
                console.log('----------------');
                resolve([]);
                return;
            }
            
            rows.forEach((row) => {
                const localTime = new Date(row.signup_date).toLocaleString('en-US', {
                    timeZone: 'UTC',
                    timeZoneName: 'short'
                });
                console.log(`ID: ${row.id}`);
                console.log(`Email: ${row.email}`);
                console.log(`Signed up: ${localTime}`);
                console.log(`IP: ${row.ip_address || 'N/A'}`);
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

// Handle command line arguments
const command = process.argv[3];
const value = process.argv[4];

async function main() {
    try {
        switch (command) {
            case 'view':
                await viewEntries();
                break;
            
            case 'export':
                await exportToExcel();
                break;
            
            case 'delete-email':
                if (!value) {
                    console.error('Please provide an email address to delete');
                    break;
                }
                await deleteByEmail(value);
                await viewEntries();
                break;
            
            default:
                console.log(`
Usage:
  node manage-waitlist.js [env] command [value]

Environments:
  dev     - Use development database (default)
  prod    - Use production database

Commands:
  view              - View all entries
  export            - Export to Excel
  delete-email <email>  - Delete entry by email

Examples:
  node manage-waitlist.js dev view
  node manage-waitlist.js prod export
  node manage-waitlist.js dev delete-email user@example.com
                `);
        }
    } catch (error) {
        console.error('Operation failed:', error.message);
    } finally {
        db.close();
    }
}

main(); 
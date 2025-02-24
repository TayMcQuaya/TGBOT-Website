const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('waitlist.db');

// Query to select all emails from the waitlist
db.all("SELECT * FROM waitlist", [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
        return;
    }
    
    console.log('\nWaitlist Entries:');
    console.log('----------------');
    
    if (rows.length === 0) {
        console.log('No entries found in the waitlist.');
    } else {
        rows.forEach((row) => {
            console.log(`Email: ${row.email}`);
            console.log(`Signed up: ${new Date(row.signup_date).toLocaleString()}`);
            console.log('----------------');
        });
    }
    
    // Close the database connection
    db.close();
}); 
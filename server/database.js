const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./app.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create the Users and Tasks tables
db.serialize(() => {
    // Create Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            pers_id TEXT PRIMARY KEY,
            user_name TEXT,
            user_programs TEXT -- Will store JSON string
        )
    `);

    // Create Tasks table based on your provided Task interface
    db.run(`
        CREATE TABLE IF NOT EXISTS Tasks (
            toDolistId INTEGER PRIMARY KEY AUTOINCREMENT,
            todolistProgramId INTEGER,
            todolistAciklama TEXT,
            todolistLink TEXT,
            todolistSicil TEXT,
            todolistAtanan TEXT,
            todolistYaratmaTarih TEXT,
            todolistGuncellemeTarih TEXT,
            todolistIscompleted BOOLEAN,
            todolistIsactive BOOLEAN,
            todolistIliskiId INTEGER,
            todolistYaratan TEXT,
            todolistYaratanIsim TEXT,
            todolistBildirimtipi TEXT,
            todolistIseditable BOOLEAN,
            todolistTerminTarih TEXT,
            todolistPriority TEXT,
            user_id TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(pers_id)
        )
    `);

    // Insert dummy data for user with pers_id = '1722'
    const userPrograms = JSON.stringify([
        { programId: 1, programName: 'Program A' },
        { programId: 2, programName: 'Program B' },
    ]);

    db.run(`
        INSERT OR REPLACE INTO Users (pers_id, user_name, user_programs) 
        VALUES ('1722', 'John Doe', ?)
    `, [userPrograms]);

    console.log('Dummy user data with pers_id 1722 added.');

    // Insert dummy tasks for user 1722
    db.run(`
        INSERT INTO Tasks (
            todolistProgramId, todolistAciklama, todolistLink, todolistSicil, todolistAtanan, 
            todolistYaratmaTarih, todolistGuncellemeTarih, todolistIscompleted, todolistIsactive, 
            todolistIliskiId, todolistYaratan, todolistYaratanIsim, todolistBildirimtipi, 
            todolistIseditable, todolistTerminTarih, todolistPriority, user_id
        ) 
        VALUES 
        (1, 'Task 1 Description', 'http://link.com', '1722', 'Assigned User', 
        '2024-09-10', '2024-09-11', 0, 1, NULL, 'Creator', 'John Doe', 'Notification', 
        1, '2024-09-15', 'High', '1722'),
        
        (2, 'Task 2 Description', 'http://link2.com', '1722', 'Assigned User 2', 
        '2024-09-12', '2024-09-13', 1, 1, NULL, 'Creator 2', 'Jane Doe', 'Notification', 
        1, '2024-09-16', 'Low', '1722')
    `);

    console.log('Dummy tasks for user 1722 added.');
});

module.exports = db;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Initialize the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize the database connection (SQLite in this case)
const db = new sqlite3.Database(':memory:');

// Create the Tasks table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS Tasks (
    toDolistId INTEGER PRIMARY KEY AUTOINCREMENT,
    todolistProgramId INTEGER,
    todolistAciklama TEXT,
    todolistLink TEXT,
    todolistSicil TEXT,
    todolistAtanan TEXT,
    todolistYaratmaTarih DATE,
    todolistGuncellemeTarih DATE,
    todolistIscompleted BOOLEAN,
    todolistIsactive BOOLEAN,
    todolistIliskiId INTEGER,
    todolistYaratan TEXT,
    todolistYaratanIsim TEXT,
    todolistBildirimtipi TEXT,
    todolistIseditable BOOLEAN,
    todolistTerminTarih DATE,
    todolistPriority TEXT
  )
`);

// Create the Users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS Users (
    pers_id INTEGER PRIMARY KEY,
    user_programs TEXT
  )
`);

// Fetch incomplete tasks for the current user, optionally filtered by programId
app.get('/tasks/incompleted', (req, res) => {
	const { persNo, programId } = req.query;

	let query = `SELECT * FROM Tasks WHERE todolistIscompleted = 0 AND todolistSicil = ?`;
	const queryParams = [persNo];

	if (programId && programId !== '-5') {
		query += ' AND todolistProgramId = ?';
		queryParams.push(programId);
	}

	db.all(query, queryParams, (err, rows) => {
		if (err) {
			res.status(500).json({ error: 'Failed to fetch incomplete tasks' });
		} else {
			res.json({ tasks: rows });
		}
	});
});

// Fetch completed tasks for the current user, optionally filtered by programId and count
app.get('/tasks/completed', (req, res) => {
	const { persNo, programId, count } = req.query;

	let query = `SELECT * FROM Tasks WHERE todolistIscompleted = 1 AND todolistSicil = ?`;
	const queryParams = [persNo];

	if (programId) {
		query += ' AND todolistProgramId = ?';
		queryParams.push(programId);
	}

	if (count) {
		query += ' LIMIT ?';
		queryParams.push(count);
	}

	db.all(query, queryParams, (err, rows) => {
		if (err) {
			res.status(500).json({ error: 'Failed to fetch completed tasks' });
		} else {
			res.json({ tasks: rows });
		}
	});
});

// Create a new task
app.post('/tasks', (req, res) => {
	const {
		todolistProgramId,
		todolistAciklama,
		todolistLink,
		todolistSicil,
		todolistAtanan,
		todolistYaratmaTarih,
		todolistGuncellemeTarih,
		todolistIscompleted,
		todolistIsactive,
		todolistIliskiId,
		todolistYaratan,
		todolistYaratanIsim,
		todolistBildirimtipi,
		todolistIseditable,
		todolistTerminTarih,
		todolistPriority,
	} = req.body;

	const query = `
    INSERT INTO Tasks (
      todolistProgramId, todolistAciklama, todolistLink, todolistSicil, todolistAtanan,
      todolistYaratmaTarih, todolistGuncellemeTarih, todolistIscompleted, todolistIsactive,
      todolistIliskiId, todolistYaratan, todolistYaratanIsim, todolistBildirimtipi,
      todolistIseditable, todolistTerminTarih, todolistPriority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
	const params = [
		todolistProgramId,
		todolistAciklama,
		todolistLink,
		todolistSicil,
		todolistAtanan,
		todolistYaratmaTarih,
		todolistGuncellemeTarih,
		todolistIscompleted,
		todolistIsactive,
		todolistIliskiId,
		todolistYaratan,
		todolistYaratanIsim,
		todolistBildirimtipi,
		todolistIseditable,
		todolistTerminTarih,
		todolistPriority,
	];

	db.run(query, params, function (err) {
		if (err) {
			res.status(500).json({ error: 'Failed to create task' });
		} else {
			res.status(201).json({ id: this.lastID });
		}
	});
});

// Update a task
app.put('/tasks/:id', (req, res) => {
	const {
		todolistProgramId,
		todolistAciklama,
		todolistLink,
		todolistSicil,
		todolistAtanan,
		todolistYaratmaTarih,
		todolistGuncellemeTarih,
		todolistIscompleted,
		todolistIsactive,
		todolistIliskiId,
		todolistYaratan,
		todolistYaratanIsim,
		todolistBildirimtipi,
		todolistIseditable,
		todolistTerminTarih,
		todolistPriority,
	} = req.body;
	const { id } = req.params;

	const query = `
    UPDATE Tasks SET
      todolistProgramId = ?, todolistAciklama = ?, todolistLink = ?, todolistSicil = ?, 
      todolistAtanan = ?, todolistYaratmaTarih = ?, todolistGuncellemeTarih = ?, 
      todolistIscompleted = ?, todolistIsactive = ?, todolistIliskiId = ?, todolistYaratan = ?, 
      todolistYaratanIsim = ?, todolistBildirimtipi = ?, todolistIseditable = ?, 
      todolistTerminTarih = ?, todolistPriority = ?
    WHERE toDolistId = ?
  `;
	const params = [
		todolistProgramId,
		todolistAciklama,
		todolistLink,
		todolistSicil,
		todolistAtanan,
		todolistYaratmaTarih,
		todolistGuncellemeTarih,
		todolistIscompleted,
		todolistIsactive,
		todolistIliskiId,
		todolistYaratan,
		todolistYaratanIsim,
		todolistBildirimtipi,
		todolistIseditable,
		todolistTerminTarih,
		todolistPriority,
		id,
	];

	db.run(query, params, function (err) {
		if (err) {
			res.status(500).json({ error: 'Failed to update task' });
		} else {
			res.json({ message: 'Task updated successfully' });
		}
	});
});

// Deactivate a task
app.post('/tasks/:id/deactivate', (req, res) => {
	const { id } = req.params;

	const query = `UPDATE Tasks SET todolistIsactive = 0 WHERE toDolistId = ?`;

	db.run(query, [id], function (err) {
		if (err) {
			res.status(500).json({ error: 'Failed to deactivate task' });
		} else {
			res.json({ message: 'Task deactivated successfully' });
		}
	});
});

// Get user programs by pers_id
app.get('/user/:pers_id', (req, res) => {
	const { pers_id } = req.params;

	db.get(
		'SELECT user_programs FROM Users WHERE pers_id = ?',
		[pers_id],
		(err, row) => {
			if (err) {
				res.status(500).json({ error: 'Database error' });
			} else if (!row) {
				res.status(404).json({ error: 'User not found' });
			} else {
				try {
					const userPrograms = JSON.parse(row.user_programs); // Parse JSON string
					res.json({ userPrograms });
				} catch (error) {
					res.status(500).json({
						error: 'Failed to parse user programs',
					});
				}
			}
		}
	);
});

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});

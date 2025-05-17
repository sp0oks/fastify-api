// src/database.js
const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbFile = ':memory:') {
        this.db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error('Erro ao conectar ao banco de dados:', err.message);
                throw err; // Or handle it as needed
            }
            console.log(`Conectado ao banco de dados em: ${dbFile === ':memory:' ? 'in-memory' : dbFile}`);
            this._createTables();
        });
    }

    _createTables() {
        this.db.run(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        pictureUrl TEXT
      )
    `);
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Erro ao rodar query SQL:', sql, err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.error('Erro ao rodar query SQL:', sql, err.message);
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                    return;
                }
                console.log('Conexão ao banco de dados terminada.');
                resolve();
            });
        });
    }
}

module.exports = Database;
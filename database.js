const knex = require('knex');
const knexfile = require('./knexfile.js');

class Database {
    constructor() {
        this.db = knex(knexfile.development);
    }

    async all() {
        return await this.db.select('*').from('produtos')
            .catch((err) => {
                console.error('Erro ao buscar todos os produtos:', err.message);
                throw err;
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

    async close() {
        await this.db.destroy()
            .then(() => {
                console.log('Conexão com o banco de dados fechada.');
            })
            .catch((err) => {
                console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
            });
    }
}

module.exports = Database;
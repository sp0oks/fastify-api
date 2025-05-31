const knex = require('knex');
const knexfile = require('./knexfile.js'); // Adjust the path as necessary

class Database {
    constructor() {
        this.db = knex(knexfile.development);
    }

    async createTables() {
        console.log('Criando tabelas no banco de dados...');
        if (!(await this.db.schema.hasTable('produtos'))) {
            console.log('Tabela produtos não existe, criando...');
            await this.db.schema.createTableIfNotExists('produtos', (table) => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('description');
                table.decimal('price', 10, 2).notNullable();
                table.string('category');
                table.string('pictureUrl');
            }).catch((err) => {
                console.error('Erro ao criar tabela produtos:', err.message);
            });
            console.log('Tabela produtos criada com sucesso.');
        }
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
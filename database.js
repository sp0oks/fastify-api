const knex = require('knex');
const knexfile = require('./knexfile.js');

async function createDB() {
    const db = knex({
        client: knexfile.development.client,
        connection: {
            ...knexfile.development.connection, 
            password: knexfile.development.connection.password, 
            database: null
        }
    });

    try {
        console.log('Iniciando banco de dados...')
        dbExists = await db('pg_database').select('datname').where('datname', knexfile.development.connection.database);
        if (!dbExists) {
            await db.raw(`CREATE DATABASE "${knexfile.development.connection.database}"`);
        }
        console.log('Banco de dados iniciado.');
    } catch(error) {
        console.error('Erro ao iniciar banco de dados:', error);
    } finally {
        await db.destroy();
    }
}

class Database {
    constructor() {
        this.db = knex(knexfile.development);
    }

    async all(table) {
        let result = [];
        try {
            result = await this.db.select("*").from(table);
        } catch(error) {
            console.error('Erro na query:', error);
            throw error;
        } finally {
            console.log('Query executada com sucesso.');
        }
        return result;
    }

    async get_one(table, id) {
        let result = undefined;
        try {
            result = await this.db.select('*').from(table).where('id', id).first();
        } catch(error) {
            console.error('Erro na query:', error);
            throw error;
        } finally {
            console.log('Query executada com sucesso.');
        }
        return result
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

module.exports = {
    createDB, 
    Database,
};
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
        console.log('Verificando se o banco de dados existe...' + JSON.stringify(dbExists));
        if (dbExists.length == 0) {
            console.log('Banco de dados não existe, criando...');
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
            console.log('Query executada com sucesso.');
        } catch(error) {
            console.error('Erro na query:', error);
            throw error;
        }
        return result;
    }

    async get_one(table, id) {
        let result = undefined;
        try {
            result = await this.db.select('*').from(table).where('id', id).first();
            console.log('Query executada com sucesso.');
        } catch(error) {
            console.error('Erro ao selecionar item:', error);
            throw error;
        }
        return result;
    }

    async add_one(table, params) {
        await this.db.transaction(async (trx) => {
            try {
                let result = await trx(table).insert(params, ['id']);
                if (result.length > 0) {
                    params.id = result[0].id;
                }
                await trx.commit();
                console.log('Item adicionado com sucesso.')
            } catch(error) {
                await trx.rollback();
                console.error('Erro ao adicionar item no banco', error)
                throw error;
            }
        })
        return params
    }

    async update_one(table, params) {
        let result;
        await this.db.transaction(async (trx) => {
            try {
                // não remove campos que não foram passados
                let toChange = params
                Object.keys(toChange).forEach(key => {
                    if (toChange[key] === undefined) {
                        delete toChange[key];
                    }
                });

                await trx(table).where('id', params.id).update({...toChange})
                await trx.commit();
                console.log('Item adicionado com sucesso.')
            } catch(error) {
                await trx.rollback();
                console.error('Erro ao adicionar item no banco', error)
                throw error;
            }
        })
        result = await this.get_one(table, params.id)
        return result;
    }

    async delete_one(table, id) {
        await this.db.transaction(async (trx) => {
            try {
                await trx(table).where('id', id).del();
                await trx.commit();
                console.log('Item deletado com sucesso.')
            } catch(error) {
                await trx.rollback();
                console.error('Erro ao adicionar item no banco', error)
                throw error;
            }
        })
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
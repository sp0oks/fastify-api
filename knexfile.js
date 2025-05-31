const { table } = require("console");

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'admin',
            database: 'postgres'
        },
        migrations: {
            directory: './migrations',
            table_name: 'knex_migrations',
            extension: 'js'
        },
        seeds: {
            directory: './seeds'
        }
    }
};
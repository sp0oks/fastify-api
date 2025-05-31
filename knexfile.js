module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'admin',
            database: 'api_produtos'
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
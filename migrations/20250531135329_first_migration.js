/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export async function up(knex) {
    console.log('Criando tabelas no banco de dados...');
    if (!(await knex.schema.hasTable('produtos'))) {
        console.log('Tabela produtos não existe, criando...');
        await knex.schema.createTable('produtos', (table) => {
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
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTable('produtos');
};

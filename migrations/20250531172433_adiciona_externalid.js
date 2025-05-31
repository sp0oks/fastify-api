/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  console.log('Adicionando campo externalId');
  knex.schema.alterTable('produtos', function(t) {
    t.string('externalId').notNullable().unique();
  }).catch((err) => {
    console.error('Erro ao adicionar campo externalId:', err.message);
  });
  console.log('Campo externalId adicionado a produtos.');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  console.log('Removendo campo external_id');
  knex.schema.table('produtos', function(t) {
    t.dropColumn('externalId');
  }).catch((err) => {
    console.error('Erro ao remover campo external_id:', err.message);
  })
  console.log('Campo externalId removido de produtos.');
};

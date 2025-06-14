/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

exports.seed = async function (knex) {
  await knex.transaction(async (trx) => {
    try {
      console.log('Limpando tabela produtos...');
      await trx('produtos').del();
      console.log('Tabela produtos limpa com sucesso.');
      console.log('Inserindo dados iniciais na tabela produtos...');
      const filePath = path.join(__dirname, 'products.json');
      const data = await fsPromises.readFile(filePath, 'utf-8');
      const produtos = JSON.parse(data);
      await trx('produtos').insert(produtos.map(produto => ({
        id: produto.id,
        name: produto.name,
        description: produto.description,
        price: produto.price,
        category: produto.category,
        pictureUrl: ''
      })));
      await trx.commit();
      console.log('Produtos iniciais carregados com sucesso.');
    } catch (error) {
      console.error('Erro ao inserir dados iniciais:', error.message);
      await trx.rollback();
      throw err;
    }
  });
  console.log('Seed de produtos concluído.');
};

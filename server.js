const fastify = require('fastify')();
const Database = require('./database');
const Produto = require('./produto');

const db = new Database();

// JSON Schema
const produtoSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'string' },
        pictureUrl: { type: 'string' },
    },
};

const getProdutosOpts = {
    schema: {
        response: {
            200: {
                type: 'array',
                items: produtoSchema,
            },
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                }
            },
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                },
            },
        },
    },
};

const postProdutoOpts = {
    schema: {
        body: produtoSchema,
        response: {
            201: produtoSchema,
            500: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                },
            },
        },
    },
};


fastify.get('/produtos', getProdutosOpts, async (request, reply) => {
    try {
       // const produtosData = await db.getProducts();
        const produtosData = await db.all('SELECT id, name, description, price, category, pictureUrl FROM produtos');
        const produtos = produtosData.map((data) => new Produto(data.id, data.name, data.description, data.price, data.category, data.pictureUrl));
        return produtos;
    } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro ao requisitar produtos' });
    }
});

fastify.post('/produtos', postProdutoOpts, async (request, reply) => {
    const { name, description, price, category, pictureUrl } = request.body;
    try {
        const result = await db.run('INSERT INTO produtos(name, description, price, category, pictureUrl) VALUES(?, ?, ?, ?, ?)',
                [name, description, price, category, pictureUrl]
            );
        const newProduto = new Produto(result.id, name, description, price, category, pictureUrl);
        reply.code(201).send(newProduto);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao adicionar produto' });
    }
});

fastify.put('/produtos/:id/picture', async (request,reply) => {
    const id = request.params.id;
    const {pictureUrl} = request.body;
    try {
        const result = await db.run('UPDATE produtos SET pictureUrl = ? WHERE id = ?', [pictureUrl, id]);
        const produtoAtualizado = new Produto(result.id, result.name, result.description, result.price, result.category, pictureUrl)
        reply.code(200).send(produtoAtualizado);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao atualizar produto' })
    }
});

fastify.delete('/produtos/:id' , async (request,reply) => {
    const id = request.params.id;
    try {
        await db.run('DELETE FROM produtos WHERE id = ?', [id]);
        const produtoDel = new Produto(id)
        reply.code(200).send(produtoDel);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao deletar produto' })
    }
});

const start = async () => {
    try {
        const port = 3000;
        await fastify.listen({ port: port });
        console.log('Escutando na porta:', port);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();

process.on('SIGINT', async () => {
    console.log('Terminando conexão do servidor...');
    try {
        await db.close();
        process.exit(0);
    } catch (err) {
        console.error('Erro ao terminar o banco:', err.message);
        process.exit(1);
    }
});
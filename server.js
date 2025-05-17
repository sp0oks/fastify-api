const fastify = require('fastify')({ logger: true });
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


fastify.get('/produtos', {
    ...getProdutosOpts,
    onRequest: (request, reply, done) => {
        request.log.info(`${request.method} ${request.url} route accessed.`);
        done();
    }
}, async (request, reply) => {
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

// Fastify route to get specific product by id
fastify.get('/produtos/:id', async (request, reply) => {
    const id = request.params.id;
    try {
        const data = await db.all('SELECT id, name, description, price, category, pictureUrl FROM produtos WHERE id = ?', [id]);
        const produto = new Produto(data[0].id, data[0].name, data[0].description, data[0].price, data[0].category, data[0].pictureUrl);
        reply.code(200).send(produto);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao deletar produto' })
    }
});

fastify.post('/produtos', {
    ...postProdutoOpts,
    onRequest: (request, reply, done) => {
        request.log.info(`${request.method} ${request.url} route accessed.`);
        done();
    }
}, async (request, reply) => {
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

fastify.put('/produtos/:id', {
    onRequest: (request, reply, done) => {
        request.log.info(`${request.method} ${request.url} route accessed.`);
        done();
    }
}, async (request, reply) => {
    const id = request.params.id;
    const { name, description, price, category, pictureUrl } = request.body;
    try {
        const result = await db.run('UPDATE produtos SET name = ?, description = ?, price = ?, category = ?, pictureUrl = ? WHERE id = ?', [name, description, price, category, pictureUrl, id]);
        const produtoAtualizado = new Produto(result.id, result.name, result.description, result.price, result.category, pictureUrl)
        reply.code(204).send(produtoAtualizado);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao atualizar produto' })
    }
});

fastify.put('/produtos/:id/picture', {
    onRequest: (request, reply, done) => {
        request.log.info(`${request.method} ${request.url} route accessed.`);
        done();
    }
}, async (request, reply) => {
    const id = request.params.id;
    const { pictureUrl } = request.body;
    try {
        const result = await db.run('UPDATE produtos SET pictureUrl = ? WHERE id = ?', [pictureUrl, id]);
        const produtoAtualizado = new Produto(result.id, result.name, result.description, result.price, result.category, pictureUrl)
        reply.code(200).send(produtoAtualizado);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao atualizar produto' })
    }
});

fastify.delete('/produtos/:id', {
    onRequest: (request, reply, done) => {
        request.log.info(`${request.method} ${request.url} route accessed.`);
        done();
    }
}, async (request, reply) => {
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
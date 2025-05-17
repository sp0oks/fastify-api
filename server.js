// server.js
const fastify = require('fastify')();
const Database = require('./src/database');
const Produto = require('./src/produto');

// Initialize the database
const db = new Database();

// JSON Schema for Produto
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

const produtoInputSchema = {
    type: 'object',
    required: ['name', 'price', 'category'],
    properties: {
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
        body: produtoInputSchema,
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

// Fastify route to get all produtos
fastify.get('/produtos', getProdutosOpts, async (request, reply) => {
    try {
        const produtosData = await db.all('SELECT id, name, description, price, category, pictureUrl FROM produtos');
        const produtos = produtosData.map((data) => new Produto(data.id, data.name, data.description, data.price, data.category, data.pictureUrl));
        return produtos;
    } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Failed to fetch produtos' });
    }
});

// Fastify route to add a new produto
fastify.post('/produtos', postProdutoOpts, async (request, reply) => {
    const { name, description, price, category, pictureUrl } = request.body;
    try {
        const result = await db.run(
            'INSERT INTO produtos(name, description, price, category, pictureUrl) VALUES(?, ?, ?, ?, ?)',
            [name, description, price, category, pictureUrl]
        );
        const newProduto = new Produto(result.id, name, description, price, category, pictureUrl);
        reply.status(201).send(newProduto);
    } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Failed to add produto' });
    }
});

// Start the Fastify server
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server listening on port 3000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();

// Handle server shutdown
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    try {
        await db.close();
        process.exit(0);
    } catch (err) {
        console.error('Error closing database:', err.message);
        process.exit(1);
    }
});
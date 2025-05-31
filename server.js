const fastify = require('fastify')({ logger: true });
const database = require('./database');
const Produto = require('./produto');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const multipart = require('@fastify/multipart');

const db = new database.Database();

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

// Registre o plugin de multipart (caso ainda não tenha feito)
fastify.register(multipart);

fastify.addHook('onRequest', (request, reply, done) => {
    request.log.info(`${request.method} ${request.url} rota acessada.`);
    done();
});

fastify.get('/produtos', getProdutosOpts, async (request, reply) => {
    try {
        const produtosData = await db.all('produtos');
        if (length(produtosData) > 0) {
            const produtos = produtosData.map((data) => new Produto(data.id, data.name, data.description, data.price, data.category, data.pictureUrl));
            reply.code(200).send(produtos);
        } else {
            reply.code(204);
        }
    } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Erro ao requisitar produtos' });
    }
});

fastify.get('/produtos/:id', async (request, reply) => {
    const id = request.params.id;
    try {
        const data = await db.get_one('produtos', id);
        if (data) {
            const produto = new Produto(data[0].id, data[0].name, data[0].description, data[0].price, data[0].category, data[0].pictureUrl);
            reply.code(200).send(produto);
        } else {
            reply.code(404).send({ result: 'Produto não encontrado' })
        }
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao requisitar produto' })
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

fastify.put('/produtos/:id', async (request, reply) => {
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

fastify.put('/produtos/:id/picture', async (request, reply) => {
    const id = request.params.id;

    try {
        const data = await request.file(); // recebe o arquivo da request
        const extension = path.extname(data.filename); // .jpg, .png, etc.
        const fileName = `${id}${extension}`; // usa o id como nome
        const uploadDir = path.join(__dirname, 'img');
        const filePath = path.join(uploadDir, fileName);

        // Salva o arquivo
        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filePath);
            data.file.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        reply.code(200).send({ message: 'Imagem salva com sucesso' });
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Erro ao salvar imagem' });
    }
});

fastify.delete('/produtos/:id', async (request, reply) => {
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

const carregarProdutosIniciais = async () => {
    try {
        const filePath = path.join(__dirname, 'processed.json');
        const data = await fsPromises.readFile(filePath, 'utf-8');
        const produtos = JSON.parse(data);

        for (const produto of produtos) {
            const id = produto.id;
            const name = produto.name;
            const description = '';
            const price = 0;
            const category = produto.category;
            const pictureUrl = '';

            await db.run(
                'INSERT OR IGNORE INTO produtos(id, name, description, price, category, pictureUrl) VALUES(?, ?, ?, ?, ?, ?)',
                [id, name, description, price, category, pictureUrl]
            );
        }

        console.log('Produtos iniciais carregados com sucesso.');
    } catch (err) {
        console.error('Erro ao carregar produtos iniciais:', err.message);
    }
};

const start = async () => {
    try {
        const port = 3000;
        await database.createDB();
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
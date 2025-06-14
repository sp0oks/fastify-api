
const fp = require('fastify-plugin')
const fs = require('fs');
const path = require('path');

const Produto = require('./produto');

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

module.exports = fp(async function (fastify, opts) {
    const db = opts.dbInstance;
    
    fastify.get('/produtos', getProdutosOpts, async (request, reply) => {
        try {
            const produtosData = await db.all('produtos');
            if (produtosData.length > 0) {
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
                const produto = new Produto(data.id, data.name, data.description, data.price, data.category, data.pictureUrl);
                reply.code(200).send(produto);
            } else {
                reply.code(404).send({ result: 'Produto não encontrado' })
            }
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Erro ao requisitar produto' })
        }
    });

    fastify.post('/produtos', { preHandler: [fastify.authenticate, fastify.requirePermission('products:create')], postProdutoOpts }, async (request, reply) => {
        const { name, description, price, category, pictureUrl } = request.body;
        try {
            const result = await db.add_one('produtos', {
                "name": name, 
                "description": description, 
                "price": price, 
                "category": category, 
                "pictureUrl": pictureUrl,
            });
            const newProduto = new Produto(result.id, name, description, price, category, pictureUrl);
            reply.code(201).send(newProduto);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Erro ao adicionar produto' });
        }
    });

    fastify.put('/produtos/:id', { preHandler: [fastify.authenticate, fastify.requirePermission('products:update')] }, async (request, reply) => {
        const id = request.params.id;
        const { name, description, price, category, pictureUrl } = request.body;
        try {
            const result = await db.update_one('produtos', {
                "id": id,
                "name": name, 
                "description": description, 
                "price": price, 
                "category": category, 
                "pictureUrl": pictureUrl,
            });        
            const produtoAtualizado = new Produto(result.id, result.name, result.description, result.price, result.category, result.pictureUrl)
            reply.code(200).send(produtoAtualizado);
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Erro ao atualizar produto' })
        }
    });

    fastify.put('/produtos/:id/picture', { preHandler: [fastify.authenticate, fastify.requirePermission('products:update')] }, async (request, reply) => {
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

            await db.update_one('produtos', {"id": id, "pictureUrl": filePath});
            
            reply.code(200).send({ message: 'Imagem salva com sucesso' });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Erro ao salvar imagem' });
        }
    });

    fastify.delete('/produtos/:id', { preHandler: [fastify.authenticate, fastify.requirePermission('products:delete')] }, async (request, reply) => {
        const id = request.params.id;
        try {
            await db.delete_one('produtos', id)
            reply.code(200).send({ "id": id });
        } catch (error) {
            console.error(error);
            reply.code(500).send({ error: 'Erro ao deletar produto' })
        }
    });

    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;
        // validação de usuario
        if (username === process.env.LOGIN && password === process.env.PASSWORD) {
            const token = fastify.jwt.sign(
                {
                    id: 1,
                    username: username,
                    permissions: []
                },
                { expiresIn: '15min' }
            );
            reply.code(200).send({ token: token });
            return;
        } else if (username === "admin" && password === "admin") {
            const token = fastify.jwt.sign(
                {
                    id: 99,
                    username: username,
                    permissions: ['products:create', 'products:delete', 'products:update']
                },
                { expiresIn: '15min' }
            );
            reply.code(200).send({ token: token });
            return;
        }

        // não autorizado
        reply.code(401).send({ error: 'Credenciais inválidas' })
    });

    fastify.get('/user', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        reply.code(200).send( {
            message: `Olá, ${request.user.username}.`,
            user: request.user
        });
    });
});
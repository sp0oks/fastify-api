const fastify = require('fastify')({ logger: true });
const path = require('path');
const multipart = require('@fastify/multipart');
const jwt = require("@fastify/jwt")

const database = require('./database');
const auth = require('./auth');
const routes = require('./routes')

require('dotenv').config();

const db = new database.Database();

fastify.register(multipart);
fastify.register(jwt, { 
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '15min' }
});
fastify.register(auth);
fastify.register(routes, { dbInstance: db});

fastify.addHook('onRequest', (request, reply, done) => {
    request.log.info(`${request.method} ${request.url} rota acessada.`);
    done();
});

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
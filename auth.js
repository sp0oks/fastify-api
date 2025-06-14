const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
    fastify.decorate('authenticate', async function (request, reply) {
        try {
        await request.jwtVerify();
        } catch (err) {
        reply.code(403).send({ error: 'Usuário não está autorizado a acessar esta rota' });
        }
    });

    fastify.decorate('requirePermission', (required) => (request, reply, done) => {
        if (!(request.user && request.user.permissions)) {
            reply.code(401).send({ error: 'Usuário não tem permissões definidas' });
            return;
        }

        if (!request.user.permissions.includes(required)) {
            reply.code(403).send({ error: 'Usuário não tem permissão necessária para acessar esta rota'});
            return;
        }

        done();
    });
});
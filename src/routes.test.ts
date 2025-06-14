import Fastify from 'fastify';
import routes from '../routes';
import auth from '../auth';

describe('Routes', () => {
  let fastify;

  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(auth);
    fastify.register(routes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return 403 on GET /produtos', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos',
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 on GET /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos/1',
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 on POST /produtos', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/produtos',
      payload: {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'Test Category',
        pictureUrl: 'http://example.com/image.jpg',
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 on PUT /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/produtos/1',
      payload: {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: 'Updated Category',
        pictureUrl: 'http://example.com/updated-image.jpg',
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 on PUT /produtos/1/picture', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/produtos/1/picture',
      payload: {
        pictureUrl: 'http://example.com/new-image.jpg',
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 on DELETE /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/produtos/1',
    });
    expect(response.statusCode).toBe(403);
  });

});
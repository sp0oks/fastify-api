import Fastify from 'fastify';
import routes from '../routes';
import auth from '../auth';
import jwt from '@fastify/jwt';
import 'dotenv/config';

describe('Routes', () => {
  let fastify;
  let token: string;
  const mockDb = {
    all: jest.fn().mockResolvedValue([
      { id: '1', name: 'Produto 1', description: '', price: 10, category: 'A', pictureUrl: '' },
      { id: '2', name: 'Produto 2', description: '', price: 20, category: 'B', pictureUrl: '' },
      { id: '3', name: 'Produto 3', description: '', price: 30, category: 'C', pictureUrl: '' }
    ]),
    get_one: jest.fn().mockResolvedValue(
      { id: '1', name: 'Produto 1', description: '', price: 10, category: 'A', pictureUrl: '' }
    ),
    add_one: jest.fn().mockResolvedValue({ id: '2' }),
    update_one: jest.fn().mockResolvedValue({ id: '1' }),
    delete_one: jest.fn().mockResolvedValue({ id: '1' })
  };

  beforeAll(async () => {
    fastify = Fastify();
    fastify.register(jwt, { secret: process.env.JWT_SECRET });
    fastify.register(auth);
    fastify.register(routes, { dbInstance: mockDb });
    await fastify.ready();

    const loginResponse = await fastify.inject({
      method: 'POST',
      url: '/login',
      payload: {
        "username": "admin",
        "password": "admin"
      }
    });
    const body = JSON.parse(loginResponse.body);
    token = body.token;
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return 403 when token is not provided on GET /produtos', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos',
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 when token is not provided on GET /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos/1',
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 when token is not provided on POST /produtos', async () => {
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

  it('should return 403 when token is not provided on PUT /produtos/1', async () => {
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

  it('should return 403 when token is not provided on PUT /produtos/1/picture', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/produtos/1/picture',
      payload: {
        pictureUrl: 'http://example.com/new-image.jpg',
      },
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 403 when token is not provided on DELETE /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/produtos/1',
    });
    expect(response.statusCode).toBe(403);
  });

  it('should return 200 when token is valid on GET /produtos', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
  });

  it('should return 200 when token is valid on GET /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/produtos/1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
  });

  it('should return 201 when token is valid on POST /produtos', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/produtos',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        id: '2',
        name: 'Novo Produto',
        description: 'Descrição',
        price: 100,
        category: 'Categoria',
        pictureUrl: 'http://example.com/image.jpg',
      },
    });
    expect(response.statusCode).toBe(201);
  });

  it('should return 200 when token is valid on PUT /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/produtos/1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        id: '1',
        name: 'Produto Atualizado',
        description: 'Descrição Atualizada',
        price: 150,
        category: 'Categoria Atualizada',
        pictureUrl: 'http://example.com/updated-image.jpg',
      },
    });
    expect(response.statusCode).toBe(200);
  });

  it('should return 200 when token is valid on DELETE /produtos/1', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/produtos/1',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
  });

});
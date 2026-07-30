import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../prisma.js';

describe('Expense Tracker API Endpoints', () => {
  let authToken = '';

  beforeAll(async () => {
    // Ensure clean test user or login demo user
    const res = await request(app).post('/api/auth/login').send({
      email: 'demo@expensetracker.com',
      password: 'password123',
    });

    if (res.status === 200 && res.body?.data?.token) {
      authToken = res.body.data.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/login should authenticate demo user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'demo@expensetracker.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('demo@expensetracker.com');
  });

  it('GET /api/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('demo@expensetracker.com');
  });

  it('GET /api/accounts should return list of user accounts', async () => {
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.accounts)).toBe(true);
    expect(res.body.data.accounts.length).toBeGreaterThan(0);
  });

  it('GET /api/reports/dashboard should return summary metrics', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalBalance).toBeDefined();
    expect(res.body.data.recentTransactions).toBeDefined();
  });
});

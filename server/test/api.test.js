import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase } from '../config/db.js';

let mongo;
before(async () => { process.env.JWT_SECRET = 'test-secret'; mongo = await MongoMemoryServer.create(); await connectDatabase(mongo.getUri()); });
after(async () => { await mongoose.disconnect(); await mongo.stop(); });

test('registration, protected profile, and listing workflow', async () => {
  const registration = await request(app).post('/api/auth/register').send({ name: 'Asha Patel', email: 'asha@example.com', password: 'securepass1', location: 'Pune' }).expect(201);
  assert.ok(registration.body.token);
  const token = registration.body.token;
  await request(app).get('/api/users/me').expect(401);
  await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200);
  await request(app).post('/api/auth/register').send({ name: 'Asha Patel', email: 'asha@example.com', password: 'securepass1', location: 'Pune' }).expect(409);
  await request(app).post('/api/clothing').set('Authorization', `Bearer ${token}`).send({ title: 'Indigo denim jacket', type: 'Jacket', brand: 'Levi’s', size: 'M', condition: 'good', estimatedSwapValue: 1600 }).expect(201);
  const listings = await request(app).get('/api/clothing').expect(200);
  assert.equal(listings.body.length, 1);
  assert.equal(listings.body[0].brand, 'Levi’s');
});

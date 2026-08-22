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

test('listing ownership, filters, and swap lifecycle are enforced', async () => {
  const first = await request(app).post('/api/auth/register').send({ name: 'Mira Shah', email: 'mira@example.com', password: 'securepass2', location: 'Mumbai' }).expect(201);
  const second = await request(app).post('/api/auth/register').send({ name: 'Dev Rao', email: 'dev@example.com', password: 'securepass3', location: 'Mumbai' }).expect(201);
  const create = (token, body) => request(app).post('/api/clothing').set('Authorization', `Bearer ${token}`).send(body);
  const offered = await create(first.body.token, { title: 'Rust linen overshirt', type: 'Shirt', brand: 'Fabindia', size: 'M', condition: 'like new', estimatedSwapValue: 1200 }).expect(201);
  const requested = await create(second.body.token, { title: 'Black tapered trousers', type: 'Trousers', brand: 'Uniqlo', size: '32', condition: 'good', estimatedSwapValue: 1400 }).expect(201);
  await request(app).get('/api/clothing?brand=Fabindia&size=M').expect(200).expect((response) => assert.equal(response.body.length, 1));
  await request(app).get(`/api/clothing/${requested.body._id}`).expect(200).expect((response) => assert.equal(response.body.title, 'Black tapered trousers'));
  await request(app).patch(`/api/clothing/${requested.body._id}`).set('Authorization', `Bearer ${first.body.token}`).send({ title: 'Not allowed' }).expect(403);
  await request(app).patch(`/api/clothing/${offered.body._id}`).set('Authorization', `Bearer ${first.body.token}`).send({ title: 'Rust linen shirt' }).expect(200);
  const created = await request(app).post('/api/swaps').set('Authorization', `Bearer ${first.body.token}`).send({ offeredItem: offered.body._id, requestedItem: requested.body._id, initialMessage: 'Would love to trade.' }).expect(201);
  await request(app).get('/api/swaps?direction=incoming').set('Authorization', `Bearer ${second.body.token}`).expect(200).expect((response) => assert.equal(response.body.some((swap) => swap._id === created.body._id), true));
  await request(app).patch(`/api/swaps/${created.body._id}`).set('Authorization', `Bearer ${first.body.token}`).send({ action: 'accept' }).expect(400);
  await request(app).patch(`/api/swaps/${created.body._id}`).set('Authorization', `Bearer ${second.body.token}`).send({ action: 'accept' }).expect(200).expect((response) => assert.equal(response.body.status, 'accepted'));
  await request(app).patch(`/api/swaps/${created.body._id}`).set('Authorization', `Bearer ${first.body.token}`).send({ action: 'complete' }).expect(200).expect((response) => assert.equal(response.body.status, 'completed'));
  await request(app).delete(`/api/clothing/${requested.body._id}`).set('Authorization', `Bearer ${second.body.token}`).expect(204);
  await request(app).get(`/api/clothing/${requested.body._id}`).expect(404);
});

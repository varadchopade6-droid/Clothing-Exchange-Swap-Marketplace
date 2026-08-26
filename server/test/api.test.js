import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';

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
  await request(app).post('/api/swaps').set('Authorization', `Bearer ${first.body.token}`).send({ offeredItem: offered.body._id, requestedItem: requested.body._id }).expect(400);
  await request(app).patch(`/api/swaps/${created.body._id}`).set('Authorization', `Bearer ${first.body.token}`).send({ action: 'complete' }).expect(200).expect((response) => assert.equal(response.body.status, 'completed'));
  await request(app).delete(`/api/clothing/${requested.body._id}`).set('Authorization', `Bearer ${second.body.token}`).expect(204);
  await request(app).get(`/api/clothing/${requested.body._id}`).expect(404);
});

test('messaging, valuation, agreements, disputes, and admin access are controlled', async () => {
  const a = await request(app).post('/api/auth/register').send({ name: 'Neha Kapoor', email: 'neha@example.com', password: 'securepass4', location: 'Delhi' }).expect(201);
  const b = await request(app).post('/api/auth/register').send({ name: 'Ira Sen', email: 'ira@example.com', password: 'securepass5', location: 'Delhi' }).expect(201);
  const outsider = await request(app).post('/api/auth/register').send({ name: 'Ravi Bose', email: 'ravi@example.com', password: 'securepass6', location: 'Kolkata' }).expect(201);
  const create = (token, data) => request(app).post('/api/clothing').set('Authorization', `Bearer ${token}`).send(data);
  const aItem = await create(a.body.token, { title: 'Cream wool sweater', type: 'Sweater', brand: 'Mango', size: 'S', condition: 'like new', estimatedSwapValue: 1500 }).expect(201);
  const bItem = await create(b.body.token, { title: 'Dark blue jeans', type: 'Jeans', brand: 'Levi', size: '30', condition: 'good', estimatedSwapValue: 1300 }).expect(201);
  await request(app).post('/api/clothing/value').send({ type: 'Jacket', brand: 'Nike', condition: 'new with tags' }).expect(200).expect((response) => assert.equal(response.body.estimatedValue, 2549));
  await request(app).post('/api/clothing/value').send({ type: 'Jacket', brand: 'Nike', condition: 'broken' }).expect(400);
  const swap = await request(app).post('/api/swaps').set('Authorization', `Bearer ${a.body.token}`).send({ offeredItem: aItem.body._id, requestedItem: bItem.body._id }).expect(201);
  await request(app).post(`/api/messages/${swap.body._id}`).set('Authorization', `Bearer ${outsider.body.token}`).send({ text: 'Let me in' }).expect(403);
  await request(app).post(`/api/messages/${swap.body._id}`).set('Authorization', `Bearer ${a.body.token}`).send({ text: '' }).expect(400);
  await request(app).post(`/api/messages/${swap.body._id}`).set('Authorization', `Bearer ${a.body.token}`).send({ text: 'Would Saturday work?' }).expect(201);
  await request(app).get(`/api/messages/${swap.body._id}`).set('Authorization', `Bearer ${b.body.token}`).expect(200).expect((response) => assert.equal(response.body[0].text, 'Would Saturday work?'));
  await request(app).patch(`/api/swaps/${swap.body._id}`).set('Authorization', `Bearer ${b.body.token}`).send({ action: 'accept' }).expect(200);
  await request(app).patch(`/api/swaps/${swap.body._id}`).set('Authorization', `Bearer ${a.body.token}`).send({ action: 'agree' }).expect(200).expect((response) => assert.equal(response.body.status, 'accepted'));
  await request(app).patch(`/api/swaps/${swap.body._id}`).set('Authorization', `Bearer ${b.body.token}`).send({ action: 'agree' }).expect(200).expect((response) => assert.equal(response.body.status, 'agreed'));
  await request(app).patch(`/api/swaps/${swap.body._id}`).set('Authorization', `Bearer ${a.body.token}`).send({ action: 'start' }).expect(200).expect((response) => assert.equal(response.body.status, 'in_progress'));
  const dispute = await request(app).post('/api/disputes').set('Authorization', `Bearer ${a.body.token}`).send({ swap: swap.body._id, reason: 'Meeting point needs review.' }).expect(201);
  await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${a.body.token}`).expect(403);
  await User.findOneAndUpdate({ email: 'neha@example.com' }, { role: 'admin' });
  const adminLogin = await request(app).post('/api/auth/login').send({ email: 'neha@example.com', password: 'securepass4' }).expect(200);
  await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminLogin.body.token}`).expect(200).expect((response) => assert.ok(response.body.length >= 3));
  await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${adminLogin.body.token}`).expect(200).expect((response) => assert.ok(response.body.totalListings >= 2));
  await request(app).patch(`/api/admin/disputes/${dispute.body._id}`).set('Authorization', `Bearer ${adminLogin.body.token}`).send({ status: 'resolved', resolution: 'Members contacted.' }).expect(200).expect((response) => assert.equal(response.body.status, 'resolved'));
});

test('commerce orders, requests, reviews, complaints, and administration are protected', async () => {
  const customer = await request(app).post('/api/auth/register').send({ name: 'Commerce Customer', email: 'commerce-customer@example.com', password: 'securepass7', location: 'Pune', role: 'customer' }).expect(201);
  const maker = await request(app).post('/api/auth/register').send({ name: 'Commerce Maker', email: 'commerce-maker@example.com', password: 'securepass8', location: 'Pune', role: 'entrepreneur', skills: ['Pottery'] }).expect(201);
  const admin = await request(app).post('/api/auth/register').send({ name: 'Commerce Admin', email: 'commerce-admin@example.com', password: 'securepass9', location: 'Pune' }).expect(201);
  await User.findOneAndUpdate({ email: 'commerce-admin@example.com' }, { role: 'admin' });
  const adminToken = (await request(app).post('/api/auth/login').send({ email: 'commerce-admin@example.com', password: 'securepass9' }).expect(200)).body.token;
  await request(app).post('/api/products').set('Authorization', `Bearer ${maker.body.token}`).send({ title: 'Pot', category: 'Ceramics', price: 500, stock: 2 }).expect(403);
  await request(app).patch(`/api/admin/entrepreneurs/${maker.body.user.id}/approval`).set('Authorization', `Bearer ${adminToken}`).send({ approved: true }).expect(200);
  const product = await request(app).post('/api/products').set('Authorization', `Bearer ${maker.body.token}`).send({ title: 'Pot', category: 'Ceramics', price: 500, stock: 2 }).expect(201);
  await request(app).post('/api/orders').set('Authorization', `Bearer ${customer.body.token}`).send({ productId: product.body._id, quantity: 3, orderInfo: { name: 'Customer', contact: '123', address: 'Pune' } }).expect(409);
  const order = await request(app).post('/api/orders').set('Authorization', `Bearer ${customer.body.token}`).send({ productId: product.body._id, quantity: 1, orderInfo: { name: 'Customer', contact: '123', address: 'Pune' } }).expect(201);
  await request(app).patch(`/api/orders/${order.body._id}`).set('Authorization', `Bearer ${customer.body.token}`).send({ action: 'complete' }).expect(400);
  await request(app).patch(`/api/orders/${order.body._id}`).set('Authorization', `Bearer ${maker.body.token}`).send({ action: 'confirm' }).expect(200);
  await request(app).patch(`/api/orders/${order.body._id}`).set('Authorization', `Bearer ${maker.body.token}`).send({ action: 'complete' }).expect(200);
  await request(app).post('/api/reviews').set('Authorization', `Bearer ${customer.body.token}`).send({ orderId: order.body._id, rating: 5, feedback: 'Excellent.' }).expect(201);
  await request(app).post('/api/reviews').set('Authorization', `Bearer ${maker.body.token}`).send({ orderId: order.body._id, rating: 5 }).expect(403);
  const service = await request(app).post('/api/services').set('Authorization', `Bearer ${maker.body.token}`).send({ title: 'Custom pot', description: 'Hand-thrown pot', category: 'Ceramics', price: 800 }).expect(201);
  const serviceRequest = await request(app).post('/api/service-requests').set('Authorization', `Bearer ${customer.body.token}`).send({ serviceId: service.body._id, details: 'Blue glaze please.' }).expect(201);
  await request(app).patch(`/api/service-requests/${serviceRequest.body._id}`).set('Authorization', `Bearer ${customer.body.token}`).send({ action: 'accept' }).expect(400);
  await request(app).patch(`/api/service-requests/${serviceRequest.body._id}`).set('Authorization', `Bearer ${maker.body.token}`).send({ action: 'accept' }).expect(200);
  await request(app).post('/api/complaints').set('Authorization', `Bearer ${customer.body.token}`).send({ serviceRequestId: serviceRequest.body._id, reason: 'Need a schedule update.' }).expect(201);
  await request(app).get('/api/admin/commerce').set('Authorization', `Bearer ${customer.body.token}`).expect(403);
  await request(app).get('/api/admin/commerce/analytics').set('Authorization', `Bearer ${adminToken}`).expect(200).expect((response) => assert.ok(response.body.salesVolume >= 500));
});

test('edge cases return controlled errors without leaking private resources', async () => {
  const member = await request(app).post('/api/auth/register').send({ name: 'Edge Case User', email: 'edge@example.com', password: 'securepass10', location: 'Chennai' }).expect(201);
  await request(app).get('/api/clothing').expect(200).expect((response) => assert.ok(Array.isArray(response.body)));
  await request(app).get('/api/clothing/not-an-id').expect(400).expect((response) => assert.equal(response.body.message, 'Invalid resource identifier.'));
  await request(app).get('/api/swaps').set('Authorization', 'Bearer malformed.token').expect(401);
  await request(app).post('/api/auth/login').send({ email: 'edge@example.com', password: 'incorrect-password' }).expect(401);
  await request(app).post('/api/clothing').set('Authorization', `Bearer ${member.body.token}`).send({ title: '', type: 'Shirt' }).expect(400);
  await request(app).post('/api/messages/000000000000000000000000').set('Authorization', `Bearer ${member.body.token}`).send({ text: 'Hello' }).expect(404);
  await request(app).post('/api/messages/000000000000000000000000').set('Authorization', `Bearer ${member.body.token}`).send({ text: '' }).expect(404);
});

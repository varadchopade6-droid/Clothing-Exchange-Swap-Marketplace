import { Router } from 'express';
import { createComplaint, createOrder, createProduct, createReview, createService, createServiceRequest, myComplaints, myProducts, myServices, orders, product, products, reviewsForEntrepreneur, serviceRequests, services, transitionOrder, transitionServiceRequest, updateProduct, updateService } from '../controllers/commerceController.js';
import { requireAuth } from '../middleware/auth.js';

export const productRouter = Router();
productRouter.get('/mine', requireAuth, myProducts);
productRouter.route('/').get(products).post(requireAuth, createProduct);
productRouter.route('/:id').get(product).patch(requireAuth, updateProduct);
export const serviceRouter = Router();
serviceRouter.get('/mine', requireAuth, myServices);
serviceRouter.route('/').get(services).post(requireAuth, createService);
serviceRouter.patch('/:id', requireAuth, updateService);
export const orderRouter = Router(); orderRouter.use(requireAuth); orderRouter.route('/').get(orders).post(createOrder); orderRouter.patch('/:id', transitionOrder);
export const serviceRequestRouter = Router(); serviceRequestRouter.use(requireAuth); serviceRequestRouter.route('/').get(serviceRequests).post(createServiceRequest); serviceRequestRouter.patch('/:id', transitionServiceRequest);
export const reviewRouter = Router(); reviewRouter.get('/entrepreneur/:entrepreneurId', reviewsForEntrepreneur); reviewRouter.post('/', requireAuth, createReview);
export const complaintRouter = Router(); complaintRouter.use(requireAuth); complaintRouter.route('/').get(myComplaints).post(createComplaint);

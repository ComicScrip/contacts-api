const request = require('supertest');
const app = require('../server.js');
const Customer = require('../models/customer.model.js');

const validCustomer = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@gmail.com',
};

describe('customers endpoints', () => {
  describe('GET /customers', () => {
    describe('when there are two customers in DB', () => {
      let res;
      beforeEach(async () => {
        await Promise.all([
          Customer.create(validCustomer),
          Customer.create({
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@gmail.com',
          }),
        ]);
        res = await request(app).get('/customers');
      });

      it('status is 200', async () => {
        expect(res.status).toBe(200);
      });

      it('the returned data is an array containing two elements', async () => {
        expect(Array.isArray(res.body));
        expect(res.body.length).toBe(2);
      });
    });
  });

  describe('GET /customers/:id', () => {
    describe('with existing customer id', () => {
      let res;
      let customer;
      beforeAll(async () => {
        customer = await Customer.create(validCustomer);
        res = await request(app).get(`/customers/${customer.id}`);
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returned object in body has correct properties', () => {
        expect(res.body).toEqual(customer);
      });
    });
  });

  describe('POST /customers', () => {
    describe('whithout apiKey', () => {
      let res;
      beforeAll(async () => {
        res = await request(app).post('/customers').send(validCustomer);
      });

      it('returns 401 status', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('when a valid payload is sent', () => {
      let res;
      beforeAll(async () => {
        res = await request(app)
          .post(`/customers?apiKey=${process.env.API_KEY}`)
          .send(validCustomer);
      });

      it('returns 201 status', async () => {
        expect(res.statusCode).toEqual(201);
      });

      it('returns the id of the created customer', async () => {
        expect(res.body).toHaveProperty('id');
      });
    });

    describe('when a customer with the same email already exists in DB', () => {
      let res;
      beforeAll(async () => {
        Customer.create(validCustomer);
        res = await request(app)
          .post(`/customers?apiKey=${process.env.API_KEY}`)
          .send({
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'john.doe@gmail.com',
          });
      });

      it('returns a 400 status', async () => {
        expect(res.status).toBe(400);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
      });
    });
  });

  describe('PUT /customers/:id', () => {
    describe('without api key', () => {
      let res;
      beforeAll(async () => {
        const customer = await Customer.create(validCustomer);
        res = await request(app).put(`/customers/${customer.id}`).send({
          first_name: 'Jane',
          last_name: 'Doe',
        });
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });

    describe('with a valid cutomer', () => {
      let res;
      let customer;
      beforeAll(async () => {
        customer = await Customer.create(validCustomer);
        res = await request(app)
          .put(`/customers/${customer.id}?apiKey=${process.env.API_KEY}`)
          .send({
            first_name: 'Jane',
            last_name: 'Do',
          });
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returns the entity with correct properties', () => {
        expect(res.body.id).toBe(customer.id);
        expect(res.body.first_name).toBe('Jane');
        expect(res.body.last_name).toBe('Do');
      });
    });

    describe('with an non-existing customer id', () => {
      let res;
      beforeAll(async () => {
        res = await request(app)
          .put(`/customers/99999999?apiKey=${process.env.API_KEY}`)
          .send({
            first_name: 'Jane',
            last_name: 'Do',
          });
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });

  describe('DELETE /customers/:id', () => {
    describe('without api key', () => {
      let res;
      beforeAll(async () => {
        const customer = await Customer.create(validCustomer);
        res = await request(app).delete(`/customers/${customer.id}`);
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });

    describe('with a valid cutomer', () => {
      let res;
      beforeAll(async () => {
        const customer = await Customer.create(validCustomer);
        res = await request(app).delete(
          `/customers/${customer.id}?apiKey=${process.env.API_KEY}`
        );
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });
    });

    describe('with an non-existing customer id', () => {
      let res;
      beforeAll(async () => {
        res = await request(app).delete(
          `/customers/99999999?apiKey=${process.env.API_KEY}`
        );
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
});

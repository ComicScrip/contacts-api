const request = require('supertest');
const app = require('../app.js');
const Contact = require('../models/contact.model.js');

const validEntity = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@gmail.com',
};
const validEntity2 = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@gmail.com',
};
const createRecord = (entity) => Contact.create(entity);
let res;
let testedEntity;

describe(`contacts endpoints`, () => {
  describe(`GET /contacts`, () => {
    describe('when there are two items in DB', () => {
      beforeEach(async () => {
        await Promise.all([
          createRecord(validEntity),
          createRecord(validEntity2),
        ]);
        res = await request(app).get('/contacts');
      });

      it('status is 200', async () => {
        expect(res.status).toBe(200);
      });

      it('the returned body is an array containing two elements', async () => {
        expect(Array.isArray(res.body));
        expect(res.body.length).toBe(2);
      });

      it('the returned elements have expected properties', async () => {
        const expectedProps = ['id', 'name', 'email'];
        res.body.forEach((element) => {
          expectedProps.forEach((prop) => {
            expect(element[prop]).not.toBe(undefined);
          });
        });
      });
    });
  });
  describe(`GET /contacts/:id`, () => {
    describe('with existing entity id', () => {
      beforeAll(async () => {
        testedEntity = await Contact.create(validEntity);
        res = await request(app).get(`/contacts/${testedEntity.id}`);
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returned object in body has correct properties', () => {
        expect(res.body).toEqual(testedEntity);
      });
    });

    describe('with existing entity id', () => {
      beforeAll(async () => {
        res = await request(app).get(`/contacts/9999999999`);
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
  describe(`POST /contacts`, () => {
    describe('whithout api key', () => {
      beforeAll(async () => {
        res = await request(app).post('/contacts').send(validEntity);
      });

      it('returns 401 status', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('when a valid payload is sent', () => {
      beforeAll(async () => {
        res = await request(app)
          .post(`/contacts?apiKey=${process.env.API_KEY}`)
          .send(validEntity);
      });

      it('returns 201 status', async () => {
        expect(res.statusCode).toEqual(201);
      });

      it('returns the id of the created contact', async () => {
        expect(res.body).toHaveProperty('id');
      });
    });
    describe('when a contact with the same email already exists in DB', () => {
      beforeAll(async () => {
        await createRecord(validEntity);
        res = await request(app)
          .post(`/contacts?apiKey=${process.env.API_KEY}`)
          .send(validEntity);
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
      });
    });

    describe('when email is not provided', () => {
      beforeAll(async () => {
        await createRecord(validEntity);
        res = await request(app)
          .post(`/contacts?apiKey=${process.env.API_KEY}`)
          .send({
            first_name: 'Jane',
            last_name: 'Doe',
          });
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
      });
    });
  });
  describe(`PUT /contacts/:id`, () => {
    describe('without api key', () => {
      beforeAll(async () => {
        const contact = await Contact.create(validEntity);
        res = await request(app).put(`/contacts/${contact.id}`).send({
          first_name: 'Jane',
          last_name: 'Doe',
        });
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });
    describe('with a valid entity', () => {
      beforeAll(async () => {
        testedEntity = await Contact.create(validEntity);
        res = await request(app)
          .put(`/contacts/${testedEntity.id}?apiKey=${process.env.API_KEY}`)
          .send({ first_name: 'Jane', last_name: 'Do' });
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returns the entity with correct properties', () => {
        expect(res.body.id).toBe(testedEntity.id);
        expect(res.body.first_name).toBe('Jane');
        expect(res.body.last_name).toBe('Do');
      });
    });
    describe('with an non-existing entity id', () => {
      beforeAll(async () => {
        res = await request(app)
          .put(`/contacts/99999999?apiKey=${process.env.API_KEY}`)
          .send({ first_name: 'jane' });
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
  describe(`DELETE /contacts/:id`, () => {
    describe('without api key', () => {
      beforeAll(async () => {
        const entity = await Contact.create(validEntity);
        res = await request(app).delete(`/contacts/${entity.id}`);
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });
    describe('with a valid entityt', () => {
      beforeAll(async () => {
        const contact = await Contact.create(validEntity);
        res = await request(app).delete(
          `/contacts/${contact.id}?apiKey=${process.env.API_KEY}`
        );
      });

      it('returns 204', () => {
        expect(res.status).toBe(204);
      });
    });
    describe('with an non-existing entity id', () => {
      beforeAll(async () => {
        res = await request(app).delete(
          `/contacts/99999999?apiKey=${process.env.API_KEY}`
        );
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
});

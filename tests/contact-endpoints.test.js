const request = require('supertest');
const faker = require('faker');
const app = require('../app.js');
const Contact = require('../models/contact.js');
const { API_KEY } = require('../env.js');

const getValidAttributes = () => ({
  first_name: faker.name.firstName().substr(0, 20),
  last_name: faker.name.lastName().substr(0, 20),
  email: faker.unique(faker.internet.email),
});

const createRecord = (attributes = {}) =>
  Contact.create({ ...getValidAttributes(), ...attributes });

let res;
let testedEntity;
let payload;

describe(`contacts endpoints`, () => {
  describe(`GET /contacts`, () => {
    describe('basic listing', () => {
      beforeEach(async () => {
        await Promise.all([createRecord(), createRecord()]);
        res = await request(app).get('/contacts');
      });

      it('status is 200', async () => {
        expect(res.status).toBe(200);
      });

      it('should return items array containing elements', async () => {
        expect(Array.isArray(res.body)).toBe(true);
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
        testedEntity = await createRecord();
        res = await request(app).get(`/contacts/${testedEntity.id}`);
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returned object in body has correct properties', () => {
        expect(res.body).toEqual(testedEntity);
      });
    });

    describe('with non-existing entity id', () => {
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
        res = await request(app).post('/contacts').send(getValidAttributes());
      });

      it('returns 401 status', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('whithout request body', () => {
      beforeAll(async () => {
        res = await request(app).post(`/contacts?apiKey=${API_KEY}`);
      });

      it('returns 400 status', async () => {
        expect(res.statusCode).toEqual(400);
      });
    });
    describe('when a valid payload is sent', () => {
      beforeAll(async () => {
        payload = getValidAttributes();
        res = await request(app)
          .post(`/contacts?apiKey=${API_KEY}`)
          .send(payload);
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
        const validEntity = await createRecord();
        res = await request(app)
          .post(`/contacts?apiKey=${API_KEY}`)
          .send(validEntity);
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
        expect(Array.isArray(res.body.errorsByField)).toBe(true);
        expect(
          !!res.body.errorsByField.find(
            (e) => e.path.includes('email') && e.type === 'unique'
          )
        ).toBe(true);
      });
    });

    describe('when email is not provided', () => {
      beforeAll(async () => {
        res = await request(app).post(`/contacts?apiKey=${API_KEY}`).send({
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

    describe('when first or last name exceed 30 caracters', () => {
      beforeAll(async () => {
        res = await request(app).post(`/contacts?apiKey=${API_KEY}`).send({
          first_name:
            'Janeiuzyegfuyezgfuyzfgzuyegfzeuyfguzyegfuyzgfuyzegfuzgefugyzeufygzeuyguygf',
          last_name:
            'Janeiuzyegfuyezgfuyzfgzuyegfzeuyfguzyegfuyzgfuyzegfuzgefugyzeufygzeuyguygf',
        });
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
        expect(Array.isArray(res.body.errorsByField)).toBe(true);
        expect(
          !!res.body.errorsByField.find((e) => e.path.includes('first_name'))
        ).toBe(true);
        expect(
          !!res.body.errorsByField.find((e) => e.path.includes('last_name'))
        ).toBe(true);
      });
    });
  });
  describe(`PUT /contacts/:id`, () => {
    describe('without api key', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        res = await request(app).put(`/contacts/${testedEntity.id}`).send({
          first_name: 'Jane',
          last_name: 'Doe',
        });
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });
    describe('whithout request body', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        res = await request(app).put(
          `/contacts/${testedEntity.id}?apiKey=${API_KEY}`
        );
      });

      it('returns 400 status', async () => {
        expect(res.statusCode).toEqual(400);
      });
    });
    describe('when a contact with the same email already exists in DB', () => {
      beforeAll(async () => {
        const other = await createRecord();
        testedEntity = await createRecord();
        payload = { ...getValidAttributes(), email: other.email };
        res = await request(app)
          .put(`/contacts/${testedEntity.id}?apiKey=${API_KEY}`)
          .send(payload);
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
        expect(Array.isArray(res.body.errorsByField)).toBe(true);
        expect(
          !!res.body.errorsByField.find(
            (e) => e.path.includes('email') && e.type === 'unique'
          )
        ).toBe(true);
      });
    });
    describe('with a valid entity', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        payload = getValidAttributes();
        res = await request(app)
          .put(`/contacts/${testedEntity.id}?apiKey=${API_KEY}`)
          .send(payload);
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returns the entity with correct properties', () => {
        expect(res.body.id).toBe(testedEntity.id);
        Object.keys(payload).forEach((k) => {
          expect(res.body[k]).toBe(payload[k]);
        });
      });
    });
    describe('with an non-existing entity id', () => {
      beforeAll(async () => {
        res = await request(app)
          .put(`/contacts/99999999?apiKey=${API_KEY}`)
          .send({ first_name: 'jane' });
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });

    describe('when first or last name exceed 30 caracters', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        res = await request(app)
          .put(`/contacts/${testedEntity.id}?apiKey=${API_KEY}`)
          .send({
            first_name:
              'Janeiuzyegfuyezgfuyzfgzuyegfzeuyfguzyegfuyzgfuyzegfuzgefugyzeufygzeuyguygf',
            last_name:
              'Janeiuzyegfuyezgfuyzfgzuyegfzeuyfguzyegfuyzgfuyzegfuzgefugyzeufygzeuyguygf',
          });
      });

      it('returns a 422 status', async () => {
        expect(res.status).toBe(422);
      });

      it('retuns an error message', async () => {
        expect(res.body).toHaveProperty('errorMessage');
        expect(Array.isArray(res.body.errorsByField)).toBe(true);
        expect(
          !!res.body.errorsByField.find((e) => e.path.includes('first_name'))
        ).toBe(true);
        expect(
          !!res.body.errorsByField.find((e) => e.path.includes('last_name'))
        ).toBe(true);
      });
    });
  });
  describe(`DELETE /contacts/:id`, () => {
    describe('without api key', () => {
      beforeAll(async () => {
        const entity = await createRecord();
        res = await request(app).delete(`/contacts/${entity.id}`);
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });
    describe('with a valid entity', () => {
      beforeAll(async () => {
        const contact = await createRecord();
        res = await request(app).delete(
          `/contacts/${contact.id}?apiKey=${API_KEY}`
        );
      });

      it('returns 204', () => {
        expect(res.status).toBe(204);
      });
    });
    describe('with an non-existing entity id', () => {
      beforeAll(async () => {
        res = await request(app).delete(`/contacts/99999999?apiKey=${API_KEY}`);
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
});

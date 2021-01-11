const request = require('supertest');
const faker = require('faker');
const app = require('../app.js');
const Contact = require('../models/contact.js');

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

      it('should return the total number of items', async () => {
        expect(res.body.total).toBe(2);
      });
      it('should return items array containing elements', async () => {
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(2);
      });

      it('the returned elements have expected properties', async () => {
        const expectedProps = ['id', 'name', 'email'];
        res.body.items.forEach((element) => {
          expectedProps.forEach((prop) => {
            expect(element[prop]).not.toBe(undefined);
          });
        });
      });
    });

    describe('sorting', () => {
      describe('firstName asc then lastName desc', () => {
        let c1;
        let c2;
        let c3;
        beforeEach(async () => {
          c1 = await createRecord({
            last_name: 'Doe',
            first_name: 'John',
          });

          c2 = await createRecord({
            last_name: 'Doe',
            first_name: 'Jane',
          });

          c3 = await createRecord({
            last_name: 'Doz',
            first_name: 'Jane',
          });

          res = await request(app).get(
            '/contacts?sort_by=first_name.asc,last_name.desc'
          );
        });

        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(3);
          expect(res.body.items[0].id).toBe(c3.id);
          expect(res.body.items[1].id).toBe(c2.id);
          expect(res.body.items[2].id).toBe(c1.id);
        });
      });

      describe('lastName asc then firstName desc', () => {
        let c1;
        let c2;
        let c3;
        beforeEach(async () => {
          c1 = await createRecord({
            last_name: 'Doe',
            first_name: 'John',
          });

          c2 = await createRecord({
            last_name: 'Doe',
            first_name: 'Jane',
          });

          c3 = await createRecord({
            last_name: 'Doz',
            first_name: 'Jane',
          });

          res = await request(app).get(
            '/contacts?sort_by=last_name.asc,first_name.desc'
          );
        });

        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(3);
          expect(res.body.items[0].id).toBe(c1.id);
          expect(res.body.items[1].id).toBe(c2.id);
          expect(res.body.items[2].id).toBe(c3.id);
        });
      });
    });

    describe('filtering', () => {
      let c1;
      let c2;
      let c3;
      beforeEach(async () => {
        c1 = await createRecord({
          last_name: 'Doe',
          first_name: 'John',
        });

        c2 = await createRecord({
          last_name: 'Doe',
          first_name: 'Jane',
        });

        c3 = await createRecord({
          last_name: 'Doz',
          first_name: 'Jane',
        });
      });
      describe('by first name equals', () => {
        beforeEach(async () => {
          res = await request(app).get('/contacts?first_name[equals]=Jane');
        });
        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(2);
          expect(res.body.items.map((i) => i.id).sort()).toEqual(
            [c2.id, c3.id].sort()
          );
        });
      });

      describe('by last name equals', () => {
        beforeEach(async () => {
          res = await request(app).get('/contacts?last_name[equals]=Doe');
        });
        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(2);
          expect(res.body.items.map((i) => i.id).sort()).toEqual(
            [c2.id, c1.id].sort()
          );
        });
      });

      describe('by first name contains', () => {
        beforeEach(async () => {
          res = await request(app).get('/contacts?first_name[contains]=an');
        });
        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(2);
          expect(res.body.items.map((i) => i.id).sort()).toEqual(
            [c2.id, c3.id].sort()
          );
        });
      });
    });

    describe('pagination', () => {
      describe('with limit param', () => {
        beforeEach(async () => {
          await Promise.all([createRecord(), createRecord(), createRecord()]);
          res = await request(app).get('/contacts?limit=2');
        });

        it('should return correct items', async () => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBe(2);
        });
      });

      describe('with offset param', () => {
        beforeEach(async () => {
          await Promise.all([createRecord(), createRecord(), createRecord()]);
          res = await request(app).get('/contacts?offset=2');
        });

        it('should return correct items', async () => {
          expect(Array.isArray(res.body));
          expect(res.body.items.length).toBe(1);
        });
      });

      describe('with filters and sorting', () => {
        let c2;
        beforeEach(async () => {
          await createRecord({
            last_name: 'Doe',
            first_name: 'John',
          });
          c2 = await createRecord({
            last_name: 'Doe',
            first_name: 'Jane',
          });
          await createRecord({
            last_name: 'Doz',
            first_name: 'Jane',
          });

          res = await request(app).get(
            '/contacts?last_name[equals]=Doe&sort_by=first_name.asc&limit=1'
          );
        });

        it('should return correct items', async () => {
          expect(Array.isArray(res.body));
          expect(res.body.items.length).toBe(1);
          expect(res.body.items[0].id).toBe(c2.id);
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
    describe('whithout request body', () => {
      beforeAll(async () => {
        res = await request(app).post(`/contacts`);
      });

      it('returns 400 status', async () => {
        expect(res.statusCode).toEqual(400);
      });
    });
    describe('when a valid payload is sent', () => {
      beforeAll(async () => {
        payload = getValidAttributes();
        res = await request(app).post(`/contacts`).send(payload);
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
        res = await request(app).post(`/contacts`).send(validEntity);
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
        res = await request(app).post(`/contacts`).send({
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
        res = await request(app).post(`/contacts`).send({
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
    describe('whithout request body', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        res = await request(app).put(`/contacts/${testedEntity.id}`);
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
          .put(`/contacts/${testedEntity.id}`)
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
          .put(`/contacts/${testedEntity.id}`)
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
          .put(`/contacts/99999999`)
          .send({ first_name: 'jane' });
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });

    describe('when first or last name exceed 30 caracters', () => {
      beforeAll(async () => {
        testedEntity = await createRecord();
        res = await request(app).put(`/contacts/${testedEntity.id}`).send({
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
    describe('with a valid entity', () => {
      beforeAll(async () => {
        const contact = await createRecord();
        res = await request(app).delete(`/contacts/${contact.id}`);
      });

      it('returns 204', () => {
        expect(res.status).toBe(204);
      });
    });
    describe('with an non-existing entity id', () => {
      beforeAll(async () => {
        res = await request(app).delete(`/contacts/99999999`);
      });

      it('returns 404', () => {
        expect(res.status).toBe(404);
      });
    });
  });
});

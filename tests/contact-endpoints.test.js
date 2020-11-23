const request = require('supertest');
const app = require('../server.js');
const Contact = require('../models/contact.model.js');

const validContact = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@gmail.com',
};

describe('contacts endpoints', () => {
  describe('GET /contacts', () => {
    describe('when there are two contacts in DB', () => {
      let res;
      beforeEach(async () => {
        await Promise.all([
          Contact.create(validContact),
          Contact.create({
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@gmail.com',
          }),
        ]);
        res = await request(app).get('/contacts');
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

  describe('GET /contacts/:id', () => {
    describe('with existing contact id', () => {
      let res;
      let contact;
      beforeAll(async () => {
        contact = await Contact.create(validContact);
        res = await request(app).get(`/contacts/${contact.id}`);
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returned object in body has correct properties', () => {
        expect(res.body).toEqual(contact);
      });
    });
  });

  describe('POST /contacts', () => {
    describe('whithout apiKey', () => {
      let res;
      beforeAll(async () => {
        res = await request(app).post('/contacts').send(validContact);
      });

      it('returns 401 status', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('when a valid payload is sent', () => {
      let res;
      beforeAll(async () => {
        res = await request(app)
          .post(`/contacts?apiKey=${process.env.API_KEY}`)
          .send(validContact);
      });

      it('returns 201 status', async () => {
        expect(res.statusCode).toEqual(201);
      });

      it('returns the id of the created contact', async () => {
        expect(res.body).toHaveProperty('id');
      });
    });

    describe('when a contact with the same email already exists in DB', () => {
      let res;
      beforeAll(async () => {
        Contact.create(validContact);
        res = await request(app)
          .post(`/contacts?apiKey=${process.env.API_KEY}`)
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

  describe('PUT /contacts/:id', () => {
    describe('without api key', () => {
      let res;
      beforeAll(async () => {
        const contact = await Contact.create(validContact);
        res = await request(app).put(`/contacts/${contact.id}`).send({
          first_name: 'Jane',
          last_name: 'Doe',
        });
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });

    describe('with a valid contact', () => {
      let res;
      let contact;
      beforeAll(async () => {
        contact = await Contact.create(validContact);
        res = await request(app)
          .put(`/contacts/${contact.id}?apiKey=${process.env.API_KEY}`)
          .send({
            first_name: 'Jane',
            last_name: 'Do',
          });
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });

      it('returns the entity with correct properties', () => {
        expect(res.body.id).toBe(contact.id);
        expect(res.body.first_name).toBe('Jane');
        expect(res.body.last_name).toBe('Do');
      });
    });

    describe('with an non-existing contact id', () => {
      let res;
      beforeAll(async () => {
        res = await request(app)
          .put(`/contacts/99999999?apiKey=${process.env.API_KEY}`)
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

  describe('DELETE /contacts/:id', () => {
    describe('without api key', () => {
      let res;
      beforeAll(async () => {
        const contact = await Contact.create(validContact);
        res = await request(app).delete(`/contacts/${contact.id}`);
      });

      it('returns 401', () => {
        expect(res.status).toBe(401);
      });
    });

    describe('with a valid contact', () => {
      let res;
      beforeAll(async () => {
        const contact = await Contact.create(validContact);
        res = await request(app).delete(
          `/contacts/${contact.id}?apiKey=${process.env.API_KEY}`
        );
      });

      it('returns 200', () => {
        expect(res.status).toBe(200);
      });
    });

    describe('with an non-existing contact id', () => {
      let res;
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

const request = require('supertest');
const app = require('../app.js');
const Contact = require('../models/contact.model.js');

const collectionName = 'contacts';
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

const testPostValidPayload = () => {
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
};

const testPostDuplicateEmail = () => {
  beforeAll(async () => {
    createRecord(validEntity);
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
};

const testPutWithoutApiKey = () => {
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
};

const testGetCollectionWithTwoItems = () => {
  beforeEach(async () => {
    await Promise.all([
      Contact.create(validEntity),
      Contact.create(validEntity2),
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
};

const testGetItem = () => {
  beforeAll(async () => {
    testedEntity = await Contact.create(validEntity);
    res = await request(app).get(`/${collectionName}/${testedEntity.id}`);
  });

  it('returns 200', () => {
    expect(res.status).toBe(200);
  });

  it('returned object in body has correct properties', () => {
    expect(res.body).toEqual(testedEntity);
  });
};

const testPostWithoutApiKey = () => {
  beforeAll(async () => {
    res = await request(app).post('/contacts').send(validEntity);
  });

  it('returns 401 status', async () => {
    expect(res.statusCode).toEqual(401);
  });
};

const testPutWithValidEntity = () => {
  beforeAll(async () => {
    testedEntity = await Contact.create(validEntity);
    res = await request(app)
      .put(
        `/${collectionName}/${testedEntity.id}?apiKey=${process.env.API_KEY}`
      )
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
};

const testDeleteWithoutApiKey = () => {
  beforeAll(async () => {
    const entity = await Contact.create(validEntity);
    res = await request(app).delete(`/${collectionName}/${entity.id}`);
  });

  it('returns 401', () => {
    expect(res.status).toBe(401);
  });
};

const testPutWithNonExistingId = () => {
  beforeAll(async () => {
    res = await request(app)
      .put(`/contacts/99999999?apiKey=${process.env.API_KEY}`)
      .send({ first_name: 'jane' });
  });

  it('returns 404', () => {
    expect(res.status).toBe(404);
  });
};

const testDeleteValidContact = () => {
  beforeAll(async () => {
    const contact = await Contact.create(validEntity);
    res = await request(app).delete(
      `/contacts/${contact.id}?apiKey=${process.env.API_KEY}`
    );
  });

  it('returns 200', () => {
    expect(res.status).toBe(200);
  });
};

const testDeleteWithUnexistingEntity = () => {
  beforeAll(async () => {
    res = await request(app).delete(
      `/${collectionName}/99999999?apiKey=${process.env.API_KEY}`
    );
  });

  it('returns 404', () => {
    expect(res.status).toBe(404);
  });
};

describe(`${collectionName} endpoints`, () => {
  describe(`GET /${collectionName}`, () => {
    describe('when there are two items in DB', testGetCollectionWithTwoItems);
  });
  describe(`GET /${collectionName}/:id`, () => {
    describe('with existing entity id', testGetItem);
  });
  describe(`POST /${collectionName}`, () => {
    describe('whithout api key', testPostWithoutApiKey);
    describe('when a valid payload is sent', testPostValidPayload);
    describe(
      'when a contact with the same email already exists in DB',
      testPostDuplicateEmail
    );
  });
  describe(`PUT /${collectionName}/:id`, () => {
    describe('without api key', testPutWithoutApiKey);
    describe('with a valid entity', testPutWithValidEntity);
    describe('with an non-existing entity id', testPutWithNonExistingId);
  });
  describe(`DELETE /${collectionName}/:id`, () => {
    describe('without api key', testDeleteWithoutApiKey);
    describe('with a valid entityt', testDeleteValidContact);
    describe('with an non-existing entity id', testDeleteWithUnexistingEntity);
  });
});

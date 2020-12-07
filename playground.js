const { contacts, phone_numbers } = require('./db').prisma;
const db = require('./db');

const prettyPrint = (value) => console.log(JSON.stringify(value, null, 2));

(async function main() {
  await phone_numbers.deleteMany();
  await contacts.deleteMany();

  await contacts.create({
    data: {
      email: 'john.doe@gmail.com',
      last_name: 'Doe',
      first_name: 'John',
      address: {
        create: {
          city: 'lyon',
          zip: '69002',
          street: 'rue delandine',
        },
      },
    },
  });

  const jane = await contacts.create({
    data: {
      email: 'janedoe@gmail.com',
      last_name: 'Doe',
      first_name: 'Jane',
      phone_numbers: {
        create: {
          name: 'mobile',
          number: '0677885544',
        },
      },
    },
  });

  await phone_numbers.create({
    data: {
      number: '0388776644',
      name: 'landline',
      contact: { connect: { id: jane.id } },
    },
  });

  prettyPrint(
    await contacts.findMany({
      select: {
        first_name: true,
        address: {
          select: {
            city: true,
          },
        },
        phone_numbers: {
          select: {
            number: true,
            name: true,
          },
        },
      },
      where: {
        first_name: undefined,
      },
    })
  );

  await db.closeConnection();
})();

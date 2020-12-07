const { contacts, phone_numbers } = require('./db').prisma;
const db = require('./db');

const prettyPrint = (value) => console.log(JSON.stringify(value, null, 2));

(async function main() {
  await phone_numbers.deleteMany();
  await contacts.deleteMany();
  await contacts.create({
    data: {
      email: 'john.doe@gmail.com',
      first_name: 'John',
      last_name: 'Doe',
      address: {
        create: {
          city: 'Lyon',
          zip: '69002',
          street: 'rue delandine',
        },
      },
    },
  });

  await contacts.create({
    data: {
      email: 'jane.doe@gmail.com',
      first_name: 'Jane',
      last_name: 'Doe',
      phone_numbers: {
        create: {
          name: 'mobile',
          number: '06787654543',
        },
      },
    },
  });

  const first_name_search = undefined;

  prettyPrint(
    await contacts.findMany({
      select: {
        first_name: true,
        address: {
          select: {
            city: true,
          },
        },
        phone_numbers: true,
      },
      where: {
        first_name: first_name_search,
      },
    })
  );

  await db.closeConnection();
})();

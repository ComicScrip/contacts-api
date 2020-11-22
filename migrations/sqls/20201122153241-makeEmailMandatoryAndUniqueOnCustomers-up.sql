ALTER TABLE
  customers CHANGE email email varchar(191) NOT NULL;
ALTER TABLE
  customers
ADD
  CONSTRAINT Uq_email UNIQUE (email);
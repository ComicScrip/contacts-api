ALTER TABLE
  contacts CHANGE email email varchar(191) NOT NULL;
ALTER TABLE
  contacts
ADD
  CONSTRAINT Uq_email UNIQUE (email);
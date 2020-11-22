ALTER TABLE
  customers CHANGE email email varchar(255) NULL;
ALTER TABLE
  customers DROP CONSTRAINT Uq_email
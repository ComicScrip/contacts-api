ALTER TABLE
  contacts CHANGE email email varchar(255) NULL;
ALTER TABLE
  contacts DROP CONSTRAINT Uq_email
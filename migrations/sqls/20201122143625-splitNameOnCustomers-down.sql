ALTER TABLE
  customers
ADD
  COLUMN name varchar(255) DEFAULT '';
UPDATE
  customers
SET
  name = CONCAT(first_name, ' ', last_name);
ALTER TABLE
  customers DROP COLUMN first_name;
ALTER TABLE
  customers DROP COLUMN last_name;
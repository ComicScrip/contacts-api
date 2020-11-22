ALTER TABLE
  customers
ADD
  COLUMN first_name varchar(255) DEFAULT '';
ALTER TABLE
  customers
ADD
  COLUMN last_name varchar(255) DEFAULT '';
UPDATE
  customers
SET
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = SUBSTRING_INDEX(name, ' ', -1);
ALTER TABLE
  customers DROP COLUMN name;
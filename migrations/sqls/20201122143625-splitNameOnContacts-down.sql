ALTER TABLE
  contacts
ADD
  COLUMN name varchar(255) DEFAULT '';
UPDATE
  contacts
SET
  name = CONCAT(first_name, ' ', last_name);
ALTER TABLE
  contacts DROP COLUMN first_name;
ALTER TABLE
  contacts DROP COLUMN last_name;
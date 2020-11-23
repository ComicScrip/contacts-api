ALTER TABLE
  contacts
ADD
  COLUMN first_name varchar(255) DEFAULT '';
ALTER TABLE
  contacts
ADD
  COLUMN last_name varchar(255) DEFAULT '';
UPDATE
  contacts
SET
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = SUBSTRING_INDEX(name, ' ', -1);
ALTER TABLE
  contacts DROP COLUMN name;
ALTER TABLE
  users
ADD
  COLUMN facebook_id varchar(255);
ALTER TABLE
  users
ADD
  COLUMN google_id varchar(255);
ALTER TABLE
  users
ADD
  COLUMN reset_password_token varchar(255);
ALTER TABLE
  users
ADD
  COLUMN reset_password_token_expires datetime;
ALTER TABLE
  users
ADD
  COLUMN first_name varchar(255);
ALTER TABLE
  users
ADD
  COLUMN last_name varchar(255);
CREATE TABLE `addresses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE
  `contacts`
ADD
  COLUMN address_id int(10) unsigned;
ALTER TABLE
  `contacts`
ADD
  CONSTRAINT `contacts_fk_address` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`);
CREATE TABLE `phone_numbers` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) DEFAULT NULL,
    `number` varchar(255) DEFAULT NULL,
    `contact_id` int(10) unsigned,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE
  `phone_numbers`
ADD
  CONSTRAINT `phone_numbers_fk_contact` FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`);
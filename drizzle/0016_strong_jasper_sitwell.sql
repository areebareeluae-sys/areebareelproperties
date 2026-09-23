CREATE TABLE `inventory_profit` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`cnic` text NOT NULL,
	`inventory_id` text NOT NULL,
	`inventory_price` real NOT NULL,
	`customer_unit` integer NOT NULL,
	`payment_method` text NOT NULL,
	`account_number` text,
	`account_holder_name` text,
	`date` text NOT NULL
);

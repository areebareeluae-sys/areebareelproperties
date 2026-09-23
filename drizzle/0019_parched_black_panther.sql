CREATE TABLE `transaction_history` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`cnic` text NOT NULL,
	`office_user_id` text NOT NULL,
	`inventory_id` text NOT NULL,
	`plan` text NOT NULL,
	`calculated_amount` real NOT NULL,
	`transaction_number` text NOT NULL,
	`remarks` text NOT NULL,
	`date` text NOT NULL
);

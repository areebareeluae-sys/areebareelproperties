CREATE TABLE `customer_payment_methods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cnic` text NOT NULL,
	`account_holder` text NOT NULL,
	`account_number` text NOT NULL,
	`bank_name` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);

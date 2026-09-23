CREATE TABLE `customer_pins` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cnic` text NOT NULL,
	`pin` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_pins_cnic_unique` ON `customer_pins` (`cnic`);
CREATE TABLE `pending_ammount` (
	`id` text PRIMARY KEY NOT NULL,
	`cnic` text NOT NULL,
	`ammount` real NOT NULL,
	`profitdate` text NOT NULL,
	`reson` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`remarks` text,
	`send_data` text
);

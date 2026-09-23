CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`office_user_id` text NOT NULL,
	`action` text NOT NULL,
	`remarks` text,
	`created_at` text,
	FOREIGN KEY (`office_user_id`) REFERENCES `office_users`(`id`) ON UPDATE no action ON DELETE no action
);

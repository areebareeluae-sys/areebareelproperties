CREATE TABLE `application_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`form_app_id` text NOT NULL,
	`office_user_id` text NOT NULL,
	`from_department_id` text,
	`to_department_id` text,
	`action` text NOT NULL,
	`remarks` text,
	`created_at` text,
	FOREIGN KEY (`form_app_id`) REFERENCES `form_applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`office_user_id`) REFERENCES `office_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`step_order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `office_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`department_id` text,
	`role` text DEFAULT 'staff' NOT NULL,
	`created_at` text,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `office_users_email_unique` ON `office_users` (`email`);--> statement-breakpoint
ALTER TABLE `form_applications` ADD `current_department_id` text REFERENCES departments(id);
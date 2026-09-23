ALTER TABLE `users` RENAME COLUMN "email" TO "cnic";--> statement-breakpoint
DROP INDEX `users_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_cnic_unique` ON `users` (`cnic`);
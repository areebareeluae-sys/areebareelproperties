CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`property_title` text NOT NULL,
	`location` text NOT NULL,
	`country` text DEFAULT 'Pakistan' NOT NULL,
	`currency` text DEFAULT 'PKR' NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'Active',
	`slug` text NOT NULL,
	`tag` text DEFAULT 'For Sale',
	`price` real DEFAULT 0 NOT NULL,
	`beds` integer DEFAULT 0 NOT NULL,
	`baths` integer DEFAULT 0 NOT NULL,
	`sqrft` integer DEFAULT 0 NOT NULL,
	`garages` integer DEFAULT 0 NOT NULL,
	`image` text,
	`images` text,
	`created_at` text
);
--> statement-breakpoint
DROP TABLE `inventory `;--> statement-breakpoint
ALTER TABLE `inventory_profit` ADD `status` text DEFAULT 'Active' NOT NULL;
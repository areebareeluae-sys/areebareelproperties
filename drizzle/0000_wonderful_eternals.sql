CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`property_title` text NOT NULL,
	`location` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'Active',
	`tag` text DEFAULT 'For Sale',
	`beds` integer DEFAULT 0 NOT NULL,
	`baths` integer DEFAULT 0 NOT NULL,
	`garages` integer DEFAULT 0 NOT NULL,
	`image` text,
	`created_at` text DEFAULT '2026-09-06T05:47:08.355Z'
);

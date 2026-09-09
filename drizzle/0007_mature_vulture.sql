PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_properties` (
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
	`garages` integer DEFAULT 0 NOT NULL,
	`image` text,
	`created_at` text DEFAULT '2026-09-09T17:49:31.959Z'
);
--> statement-breakpoint
INSERT INTO `__new_properties`("id", "user_id", "property_title", "location", "country", "currency", "category", "status", "slug", "tag", "price", "beds", "baths", "garages", "image", "created_at") SELECT "id", "user_id", "property_title", "location", "country", "currency", "category", "status", "slug", "tag", "price", "beds", "baths", "garages", "image", "created_at" FROM `properties`;--> statement-breakpoint
DROP TABLE `properties`;--> statement-breakpoint
ALTER TABLE `__new_properties` RENAME TO `properties`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
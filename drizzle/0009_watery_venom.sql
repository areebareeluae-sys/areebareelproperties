CREATE TABLE `form_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`app_no` text NOT NULL,
	`date` text NOT NULL,
	`full_name` text NOT NULL,
	`cnic` text NOT NULL,
	`father_name` text NOT NULL,
	`dob` text,
	`mobile` text NOT NULL,
	`alt_contact` text,
	`address` text,
	`photo_url` text,
	`categories` text,
	`applicant_income` real DEFAULT 0,
	`household_income` real DEFAULT 0,
	`participation_amount` real DEFAULT 0,
	`nominee_name` text,
	`nominee_relation` text,
	`nominee_cnic` text,
	`nominee_mobile` text,
	`created_at` text DEFAULT '2026-09-14T17:50:17.847Z',
	`status` text DEFAULT 'Pending' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	`images` text,
	`created_at` text DEFAULT '2026-09-14T17:50:17.849Z'
);
--> statement-breakpoint
INSERT INTO `__new_properties`("id", "user_id", "property_title", "location", "country", "currency", "category", "status", "slug", "tag", "price", "beds", "baths", "garages", "image", "images", "created_at") SELECT "id", "user_id", "property_title", "location", "country", "currency", "category", "status", "slug", "tag", "price", "beds", "baths", "garages", "image", "images", "created_at" FROM `properties`;--> statement-breakpoint
DROP TABLE `properties`;--> statement-breakpoint
ALTER TABLE `__new_properties` RENAME TO `properties`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
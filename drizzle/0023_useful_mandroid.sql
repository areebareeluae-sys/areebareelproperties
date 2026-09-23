ALTER TABLE `properties` ADD `property_type` text DEFAULT 'Residential' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `area_size` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `city` text DEFAULT 'Lahore' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `area` text DEFAULT 'Gulberg III' NOT NULL;
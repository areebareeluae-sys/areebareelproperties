CREATE TABLE `ad_banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image` text NOT NULL,
	`status` text DEFAULT 'Active'
);

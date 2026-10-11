CREATE TABLE `catalog_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` integer NOT NULL
);

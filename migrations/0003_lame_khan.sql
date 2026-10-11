CREATE TABLE `profiles` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`revision` integer NOT NULL,
	`updated_at` integer NOT NULL
);

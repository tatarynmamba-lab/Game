CREATE TABLE `business_media` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`kind` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `business_media_kind_idx` ON `business_media` (`business_id`,`kind`);--> statement-breakpoint
CREATE TABLE `business_pages` (
	`business_id` text PRIMARY KEY NOT NULL,
	`about` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`hours` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `business_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `business_post_date_idx` ON `business_posts` (`business_id`,`created_at`);
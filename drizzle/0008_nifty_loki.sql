CREATE TABLE `coin_score` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`coin` text NOT NULL,
	`scores` text DEFAULT '{}' NOT NULL,
	`conviction` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crypto_narrative` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`quarter` text DEFAULT '' NOT NULL,
	`start_date` text,
	`duration_months` integer,
	`thesis` text DEFAULT '' NOT NULL,
	`coins` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'watching' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

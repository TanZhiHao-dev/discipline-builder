CREATE TABLE `periodic_review` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`period` text NOT NULL,
	`period_key` text NOT NULL,
	`went_well` text DEFAULT '' NOT NULL,
	`went_wrong` text DEFAULT '' NOT NULL,
	`improvements` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `periodic_review_user_id_period_period_key_unique` ON `periodic_review` (`user_id`,`period`,`period_key`);
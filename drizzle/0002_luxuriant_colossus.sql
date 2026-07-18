CREATE TABLE `trade_screenshot` (
	`id` text PRIMARY KEY NOT NULL,
	`trade_id` text NOT NULL,
	`user_id` text NOT NULL,
	`step_key` text NOT NULL,
	`image` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`trade_id`) REFERENCES `trade_journal`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

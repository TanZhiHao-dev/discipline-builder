CREATE TABLE `playbook` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`rules` text DEFAULT '' NOT NULL,
	`checklist` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `trade_journal` ADD `grade` text;--> statement-breakpoint
ALTER TABLE `trade_journal` ADD `tags` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `trade_journal` ADD `playbook_id` text;
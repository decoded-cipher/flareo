CREATE TABLE IF NOT EXISTS `flows` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nodes` text NOT NULL,
	`edges` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_id` text NOT NULL,
	`status` text NOT NULL,
	`workflow_instance_id` text,
	`input` text,
	`output` text,
	`error` text,
	`started_at` text,
	`finished_at` text,
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`flow_id`) REFERENCES `flows`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `triggers` (
	`id` text PRIMARY KEY NOT NULL,
	`flow_id` text NOT NULL,
	`type` text NOT NULL,
	`config` text,
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`flow_id`) REFERENCES `flows`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `internal_cash_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`cnic` text NOT NULL,
	`customer_name` text,
	`agent_id` text NOT NULL,
	`agent_name` text NOT NULL,
	`received_from` text NOT NULL,
	`given_to` text NOT NULL,
	`amount` numeric NOT NULL,
	`slip_or_ref_number` text,
	`internal_remarks` text,
	`created_at` text NOT NULL
);

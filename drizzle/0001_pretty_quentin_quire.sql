ALTER TABLE "content" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, ''))) STORED;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_search" ON "content" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_users_search" ON "users" USING gin ("search_vector");
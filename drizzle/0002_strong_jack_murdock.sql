ALTER TABLE "content" DROP CONSTRAINT "content_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "content" ALTER COLUMN "search_vector" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content" drop column "search_vector";--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
          setweight(to_tsvector('english', coalesce(content, '')), 'B')
        ) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "search_vector" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" drop column "search_vector";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') || 
      setweight(to_tsvector('english', coalesce(email, '')), 'C')
    ) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" DROP COLUMN "userId";
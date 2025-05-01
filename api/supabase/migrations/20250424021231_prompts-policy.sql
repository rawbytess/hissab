alter table "public"."prompts" drop column "expressions";

alter table "public"."prompts" add column "final_answer" text;

alter table "public"."prompts" add column "history" json;

alter table "public"."prompts" add column "line_number" smallint;

alter table "public"."prompts" add column "results" json;

alter table "public"."prompts" alter column "created_at" set default now();

create policy "Allow CRUD"
on "public"."prompts"
as permissive
for all
to authenticated
using (true);




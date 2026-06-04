create extension if not exists pgcrypto;

alter table if exists patients
    add column if not exists enrollment_timestamp timestamptz default now();

alter table if exists followups
    add column if not exists completed_at timestamptz,
    add column if not exists message_sent boolean default false,
    add column if not exists escalation_sent boolean default false;

create table if not exists followup_events (
    id uuid primary key default gen_random_uuid(),
    patient_id bigint references patients(id) on delete cascade,
    followup_id bigint references followups(id) on delete cascade,
    followup_type text not null check (followup_type in ('T0', 'T7', 'T90')),
    scheduled_date timestamptz not null,
    completed_boolean boolean not null default false,
    completed_at timestamptz,
    reminder_sent_count integer not null default 0,
    last_reminder_sent timestamptz,
    status text not null default 'pending' check (status in ('pending', 'sent', 'completed', 'failed', 'escalated')),
    created_at timestamptz not null default now()
);

create index if not exists followup_events_due_idx
    on followup_events (scheduled_date, completed_boolean, status);

create table if not exists grievances (
    id uuid primary key default gen_random_uuid(),
    patient_id bigint references patients(id) on delete cascade,
    created_at timestamptz not null default now(),
    description text,
    audio_reference_if_any text,
    status text not null default 'new' check (status in ('new', 'under_review', 'resolved', 'escalated')),
    assigned_clinician text,
    resolved_at timestamptz,
    pi_alert_sent_boolean boolean not null default false,
    pi_alert_time timestamptz
);

create index if not exists grievances_alert_idx
    on grievances (created_at, status, pi_alert_sent_boolean);

create table if not exists message_logs (
    id uuid primary key default gen_random_uuid(),
    recipient_type text not null,
    recipient_id text,
    phone text not null,
    template_used text,
    sent_time timestamptz,
    twilio_sid text,
    delivery_status text not null default 'queued',
    error_message text,
    created_at timestamptz not null default now()
);

create index if not exists message_logs_delivery_idx
    on message_logs (delivery_status, created_at);

create table if not exists audio_submissions (
    id uuid primary key default gen_random_uuid(),
    patient_id bigint references patients(id) on delete cascade,
    followup_id bigint references followups(id) on delete set null,
    followup_type text not null,
    bucket text not null default 'audio-recordings',
    storage_path text not null unique,
    file_name text not null,
    mime_type text,
    review_status text not null default 'pending_review' check (review_status in ('pending_review', 'reviewing', 'completed')),
    created_at timestamptz not null default now()
);

create index if not exists audio_submissions_patient_idx
    on audio_submissions (patient_id, created_at desc);

create table if not exists audio_reviews (
    id uuid primary key default gen_random_uuid(),
    audio_id uuid references audio_submissions(id) on delete cascade,
    patient_id bigint references patients(id) on delete cascade,
    assigned_clinician text,
    assigned_at timestamptz not null default now(),
    review_status text not null default 'pending_review' check (review_status in ('pending_review', 'reviewing', 'completed')),
    review_completed_at timestamptz,
    notes text
);

create index if not exists audio_reviews_status_idx
    on audio_reviews (review_status, assigned_clinician);

insert into storage.buckets (id, name, public)
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do update
set public = false;

drop policy if exists "Patients can upload follow-up audio" on storage.objects;
create policy "Patients can upload follow-up audio"
on storage.objects
for insert
to anon
with check (
    bucket_id = 'audio-recordings'
    and name like 'audio/%'
);

drop policy if exists "Patients can update own pending audio upload" on storage.objects;
create policy "Patients can update own pending audio upload"
on storage.objects
for update
to anon
using (
    bucket_id = 'audio-recordings'
    and name like 'audio/%'
)
with check (
    bucket_id = 'audio-recordings'
    and name like 'audio/%'
);

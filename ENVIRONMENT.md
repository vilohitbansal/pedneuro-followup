# Environment Variables

Use `.env.local` for local development and deployment secrets in production.
Do not commit real secret values.

Required:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://pedneuro-followup.vercel.app
APP_URL=https://pedneuro-followup.vercel.app
ADMIN_DASHBOARD_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_WHATSAPP_SENDER=
TWILIO_TEMPLATE_PATIENT_REMINDER=
TWILIO_TEMPLATE_PI_ALERT=
PI_WHATSAPP_PHONE=
```

Template variables:

Patient reminder template:

```txt
{{1}} = patient name
{{2}} = tokenized follow-up link
```

PI grievance alert template:

```txt
{{1}} = patient ID
```

The admin dashboard is available at `/admin?key=ADMIN_DASHBOARD_TOKEN`.

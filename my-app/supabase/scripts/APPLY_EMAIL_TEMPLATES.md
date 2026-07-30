# Apply `email_templates` migration

1. Open Supabase → **SQL Editor**
2. Paste contents of  
   `supabase/migrations/20260730180000_email_templates.sql`
3. Run
4. Verify:

```sql
select code, name, is_active, version from public.email_templates;
```

Expect one row: `booking-confirmation`.

## Edit copy without redeploy

**Table Editor:** open `email_templates` → edit `subject_template` / `html_body_template` / `text_body_template`.

**API (admin):**

```http
GET  /api/admin/email-templates/booking-confirmation
PATCH /api/admin/email-templates/booking-confirmation
{ "subject_template": "Booked: {{orderNumber}}" }
```

Requires signed-in profile with `role = admin`.

Vars: `customerName`, `orderNumber`, `trackUrl`, `jobsUrl`, `deliveryLine`, `itemSummary`, `depositFormatted`, `paymentNote`, `hubHint`.

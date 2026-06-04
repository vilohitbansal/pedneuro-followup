import { buildFollowupUrl } from "./followup";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { sendTwilioTemplateMessage } from "./twilio";

export async function checkPendingFollowupReminders() {
    const supabase =
        getSupabaseAdmin();

    const today =
        new Date().toISOString();

    const { data: events, error } =
        await supabase
            .from("followup_events")
            .select(`
                *,
                patients(id, patient_id, patient_name, caregiver_phone),
                followups(id, token)
            `)
            .lte("scheduled_date", today)
            .eq("completed_boolean", false)
            .in("status", ["pending", "failed"]);

    if (error) {
        throw error;
    }

    let sent = 0;
    let failed = 0;

    for (const event of events || []) {
        const phone =
            event.patients?.caregiver_phone;

        const contentSid =
            process.env.TWILIO_TEMPLATE_PATIENT_REMINDER;

        if (!phone || !contentSid) {
            failed += 1;

            await supabase
                .from("followup_events")
                .update({
                    status: "failed",
                })
                .eq("id", event.id);

            continue;
        }

        try {
            await sendTwilioTemplateMessage({
                to: phone,
                recipientType: "patient",
                recipientId:
                    event.patient_id,
                contentSid,
                contentVariables: {
                    "1":
                        event.patients?.patient_name || "your child",
                    "2":
                        buildFollowupUrl(event.followups?.token || ""),
                },
            });

            await supabase
                .from("followup_events")
                .update({
                    status: "sent",
                    reminder_sent_count:
                        (event.reminder_sent_count || 0) + 1,
                    last_reminder_sent:
                        new Date().toISOString(),
                })
                .eq("id", event.id);

            sent += 1;
        } catch {
            failed += 1;

            await supabase
                .from("followup_events")
                .update({
                    status: "failed",
                })
                .eq("id", event.id);
        }
    }

    return {
        checked:
            events?.length || 0,
        sent,
        failed,
    };
}

export async function checkUnresolvedGrievances() {
    const supabase =
        getSupabaseAdmin();

    const cutoff =
        new Date(
            Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();

    const { data: grievances, error } =
        await supabase
            .from("grievances")
            .select("*, patients(patient_id, patient_name, caregiver_phone)")
            .lte("created_at", cutoff)
            .neq("status", "resolved")
            .eq("pi_alert_sent_boolean", false);

    if (error) {
        throw error;
    }

    let escalated = 0;
    let failed = 0;

    for (const grievance of grievances || []) {
        const piPhone =
            process.env.PI_WHATSAPP_PHONE;

        const contentSid =
            process.env.TWILIO_TEMPLATE_PI_ALERT;

        if (!piPhone || !contentSid) {
            failed += 1;
            continue;
        }

        try {
            await sendTwilioTemplateMessage({
                to: piPhone,
                recipientType: "pi",
                recipientId:
                    grievance.assigned_clinician,
                contentSid,
                contentVariables: {
                    "1":
                        grievance.patients?.patient_id || String(grievance.patient_id),
                },
            });

            await supabase
                .from("grievances")
                .update({
                    status: "escalated",
                    pi_alert_sent_boolean: true,
                    pi_alert_time:
                        new Date().toISOString(),
                })
                .eq("id", grievance.id);

            escalated += 1;
        } catch {
            failed += 1;
        }
    }

    return {
        checked:
            grievances?.length || 0,
        escalated,
        failed,
    };
}

export async function checkFailedWhatsAppMessages() {
    const supabase =
        getSupabaseAdmin();

    const { count, error } =
        await supabase
            .from("message_logs")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("delivery_status", "failed");

    if (error) {
        throw error;
    }

    return {
        failedMessages:
            count || 0,
    };
}

export async function runAutomationChecks() {
    const reminders =
        await checkPendingFollowupReminders();

    const grievances =
        await checkUnresolvedGrievances();

    const failedMessages =
        await checkFailedWhatsAppMessages();

    return {
        reminders,
        grievances,
        failedMessages,
    };
}

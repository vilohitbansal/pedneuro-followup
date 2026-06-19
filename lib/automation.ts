import { buildFollowupUrl } from "./followup";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { sendTwilioTemplateMessage } from "./twilio";


function getTenDigitPhone(phone?: string) {

    if (!phone) {
        return null;
    }

    return phone
        .replace(/\D/g, "")
        .slice(-10);

}



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
                patients(
                    id,
                    patient_id,
                    patient_name,
                    caregiver_phone
                ),
                followups(
                    id,
                    token
                )
            `)
            .lte(
                "scheduled_date",
                today
            )
            .eq(
                "completed_boolean",
                false
            )
            .eq(
                "status",
                "pending"
            );


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
                    status:
                        "failed"
                })
                .eq(
                    "id",
                    event.id
                );

            continue;

        }


        try {


            await sendTwilioTemplateMessage({

                to:
                    phone,

                recipientType:
                    "patient",

                recipientId:
                    event.patient_id,

                contentSid,

                contentVariables: {

                    "1":
                        event.patients?.patient_name ||
                        "your child",

                    "2":
                        buildFollowupUrl(
                            event.followups?.token || ""
                        )

                }

            });


            await supabase
                .from("followup_events")
                .update({

                    status:
                        "sent",

                    reminder_sent_count:
                        (event.reminder_sent_count || 0) + 1,

                    last_reminder_sent:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    event.id
                );


            sent += 1;


        } catch {


            failed += 1;


            await supabase
                .from("followup_events")
                .update({
                    status:
                        "failed"
                })
                .eq(
                    "id",
                    event.id
                );

        }

    }


    return {
        checked:
            events?.length || 0,

        sent,

        failed
    };

}




export async function checkMissedFollowups() {


    const supabase =
        getSupabaseAdmin();


    const cutoff =
        new Date(
            Date.now() -
            24 * 60 * 60 * 1000
        ).toISOString();



    const { data: followups, error } =
        await supabase
            .from("followups")
            .select(`
                *,
                patients(
                    patient_id,
                    patient_name,
                    caregiver_phone
                )
            `)
            .eq(
                "completed",
                false
            )
            .eq(
                "escalation_sent",
                false
            )
            .lte(
                "due_date",
                cutoff
            );


    if (error) {
        throw error;
    }


    let alerted = 0;
    let failed = 0;



    for (const followup of followups || []) {


        const cleanPhone =
            getTenDigitPhone(
                followup.patients?.caregiver_phone
            );


        if (!cleanPhone) {

            failed += 1;

            continue;

        }


        try {


            await sendTwilioTemplateMessage({

                to:
                    process.env.PI_WHATSAPP_PHONE!,

                recipientType:
                    "pi",

                recipientId:
                    "PI",

                contentSid:
                    process.env.TWILIO_TEMPLATE_PI_ALERT!,

                contentVariables: {

                    "1":
                        cleanPhone

                }

            });



            await supabase
                .from("followups")
                .update({

                    escalation_sent:
                        true

                })
                .eq(
                    "id",
                    followup.id
                );


            alerted += 1;


        } catch {


            failed += 1;


        }

    }


    return {

        checked:
            followups?.length || 0,

        alerted,

        failed

    };

}




export async function checkFailedWhatsAppMessages() {


    const supabase =
        getSupabaseAdmin();


    const { count, error } =
        await supabase
            .from("message_logs")
            .select(
                "*",
                {
                    count:
                        "exact",

                    head:
                        true
                }
            )
            .eq(
                "delivery_status",
                "failed"
            );


    if (error) {
        throw error;
    }


    return {

        failedMessages:
            count || 0

    };

}




export async function runAutomationChecks() {


    const reminders =
        await checkPendingFollowupReminders();


    const missed =
        await checkMissedFollowups();


    const failedMessages =
        await checkFailedWhatsAppMessages();


    return {

        reminders,

        missed,

        failedMessages

    };

}
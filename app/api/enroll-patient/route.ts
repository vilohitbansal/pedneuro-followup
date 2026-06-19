import { NextResponse } from "next/server";

import { getErrorMessage } from "@/lib/errors";
import {
    addDays,
    buildFollowupUrl,
    followupOffsets,
    FollowupType,
    toDateOnly,
} from "@/lib/followup";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTwilioTemplateMessage } from "@/lib/twilio";

export async function POST(request: Request) {
    try {
        const body =
            await request.json();

        const supabase =
            getSupabaseAdmin();

        const enrolledAt =
            new Date();

        const { data: patient, error: patientError } =
            await supabase
                .from("patients")
                .insert({
                    patient_name:
                        body.patientName,
                    patient_id:
                        body.patientId,
                    address:
                        body.address,
                    caregiver_phone:
                        body.phone,
                    notes:
                        body.notes,
                    discharge_date:
                        toDateOnly(enrolledAt),
                    enrollment_timestamp:
                        enrolledAt.toISOString(),
                    t0_due:
                        toDateOnly(addDays(enrolledAt, 0)),
                    t7_due:
                        toDateOnly(addDays(enrolledAt, 7)),
                    T60_due:
                        toDateOnly(addDays(enrolledAt, 60)),
                })
                .select()
                .single();

        if (patientError || !patient) {
            throw patientError || new Error("Patient was not created");
        }

        const followupRows =
            (Object.keys(followupOffsets) as FollowupType[])
                .map((followupType) => {
                    const dueDate =
                        addDays(
                            enrolledAt,
                            followupOffsets[followupType]
                        );

                    return {
                        patient_row_id:
                            patient.id,
                        followup_type:
                            followupType,
                        due_date:
                            toDateOnly(dueDate),
                        token:
                            crypto.randomUUID(),
                        completed:
                            false,
                        message_sent:
                            false,
                        escalation_sent:
                            false,
                    };
                });

        const { data: followups, error: followupError } =
            await supabase
                .from("followups")
                .insert(followupRows)
                .select();

        if (followupError || !followups) {
            throw followupError || new Error("Follow-ups were not created");
        }

        const eventRows =
            followups.map((followup) => ({
                patient_id:
                    patient.id,
                followup_id:
                    followup.id,
                followup_type:
                    followup.followup_type,
                scheduled_date:
                    followup.due_date,
                completed_boolean:
                    false,
                reminder_sent_count:
                    0,
                status:
                    "pending",
            }));

        await supabase
            .from("followup_events")
            .insert(eventRows);

        const t0Followup =
            followups.find(
                (followup) => followup.followup_type === "T0"
            );

        if (
            t0Followup &&
            body.phone &&
            process.env.TWILIO_TEMPLATE_PATIENT_REMINDER
        ) {
            await sendTwilioTemplateMessage({
                to:
                    body.phone,
                recipientType:
                    "patient",
                recipientId:
                    patient.id,
                contentSid:
                    process.env.TWILIO_TEMPLATE_PATIENT_REMINDER,
                contentVariables: {
                    "1":
                        body.patientName || "your child",
                    "2":
                        buildFollowupUrl(t0Followup.token),
                },
            });

            await supabase
                .from("followups")
                .update({
                    message_sent: true,
                })
                .eq("id", t0Followup.id);

            await supabase
                .from("followup_events")
                .update({
                    status: "sent",
                    reminder_sent_count: 1,
                    last_reminder_sent:
                        new Date().toISOString(),
                })
                .eq("followup_id", t0Followup.id);
        }

        return NextResponse.json({
            success: true,
            patient,
            followups,
        });
    } catch (error: unknown) {

        console.error("ENROLL ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    getErrorMessage(error),
            },
            {
                status: 500,
            }
        );
    }
}

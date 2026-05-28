
import { NextResponse } from "next/server";

import twilio from "twilio";

import { supabase } from "@/lib/supabase";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
);

export async function GET() {

    try {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const {
            data: followups,
            error
        } = await supabase
            .from("followups")
            .select(`
    *,
    patients(
        patient_name,
        caregiver_phone
    )
        `)
            .eq(
                "completed",
                false
            );

        if (error) {

            throw error;
        }

        for (const followup of followups || []) {

            const phone =
                followup.patients?.caregiver_phone;

            const patientName =
                followup.patients?.patient_name;

            const token =
                followup.token;

            const dueDate =
                followup.due_date;

            if (!phone) {

                console.log(
                    "Missing caregiver phone:",
                    followup.id
                );

                continue;
            }

            // SEND FOLLOW-UP MESSAGE

            if (
                followup.message_sent === false
                &&
                new Date(dueDate)
                    <= new Date(today)
            ) {

                const message =
`Dear caregiver,

    Please complete the ${ followup.followup_type } follow - up for ${ patientName }.

        https://pedneuro-followup.vercel.app/?token=${token}`;

    try {

        await client.messages.create({

            from:
                `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

            to:
                `whatsapp:${phone}`,

            body:
                message,
        });

        await supabase
            .from("followups")
            .update({
                message_sent: true
            })
            .eq(
                "id",
                followup.id
            );

        console.log(
            "Follow-up message sent:",
            followup.id
        );

    } catch (err) {

        console.log(
            "SEND ERROR:",
            err
        );
    }
            }

// 24 HOUR ESCALATION ALERT

const now =
    new Date();

const due =
    new Date(dueDate);

const diffHours =
    (
        now.getTime()
        - due.getTime()
    )
    / (1000 * 60 * 60);

if (
    diffHours >= 24
    &&
    followup.completed === false
    &&
    followup.escalation_sent === false
) {

    const reminder =
        `Patient ${patientName} has not completed the ${followup.followup_type} follow-up questionnaire within 24 hours.

Please contact the caregiver if necessary.

Token: ${token}`;

    try {

        await client.messages.create({

            from:
                `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

            to:
                "whatsapp:+918431615569",

            body:
                reminder,
        });

        await supabase
            .from("followups")
            .update({
                escalation_sent: true
            })
            .eq(
                "id",
                followup.id
            );

        console.log(
            "Escalation alert sent:",
            followup.id
        );

    } catch (err) {

        console.log(
            "REMINDER ERROR:",
            err
        );
    }
}
        }

return NextResponse.json({

    success: true,
});

    } catch (error: any) {

    console.log(
        "CRON FAILURE:",
        error
    );

    return NextResponse.json({

        success: false,

        error:
            error.message,
    });
}
}


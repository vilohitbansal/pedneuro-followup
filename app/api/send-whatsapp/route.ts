import { NextResponse } from "next/server";

import { getErrorMessage } from "@/lib/errors";
import { sendTwilioTemplateMessage } from "@/lib/twilio";

export async function POST(request: Request) {
    try {
        const body =
            await request.json();

        const response =
            await sendTwilioTemplateMessage({
                to: body.to,
                recipientType:
                    body.recipientType || "patient",
                recipientId:
                    body.recipientId ?? null,
                contentSid:
                    body.contentSid || process.env.TWILIO_TEMPLATE_PATIENT_REMINDER,
                contentVariables:
                    body.contentVariables || {},
            });

        return NextResponse.json({
            success: true,
            sid:
                response.sid,
        });
    } catch (error: unknown) {
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

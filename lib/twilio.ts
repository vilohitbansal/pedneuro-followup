import twilio from "twilio";

import { getErrorMessage } from "./errors";
import { getSupabaseAdmin } from "./supabaseAdmin";

type RecipientType = "patient" | "clinician" | "pi";

type TemplateMessageInput = {
    to: string;
    recipientType: RecipientType;
    recipientId?: string | number | null;
    contentSid: string;
    contentVariables?: Record<string, string>;
};

function getTwilioClient() {

    const accountSid =
        process.env.TWILIO_ACCOUNT_SID?.trim();

    const authToken =
        process.env.TWILIO_AUTH_TOKEN?.trim();


    if (!accountSid || !authToken) {

        throw new Error(
            "Missing Twilio credentials"
        );

    }


    return twilio(
        accountSid,
        authToken
    );

}

function normalizeWhatsAppAddress(phone: string) {
    return phone.startsWith("whatsapp:")
        ? phone
        : `whatsapp:${phone}`;
}

export async function sendTwilioTemplateMessage({
    to,
    recipientType,
    recipientId = null,
    contentSid,
    contentVariables = {},
}: TemplateMessageInput) {
    const supabase =
        getSupabaseAdmin();

    const sender =
        process.env.TWILIO_WHATSAPP_SENDER;

    if (!sender) {
        throw new Error(
            "Missing TWILIO_WHATSAPP_SENDER"
        );
    }

    const phone =
        normalizeWhatsAppAddress(to);

    let logId: string | null = null;

    const { data: logRow } =
        await supabase
            .from("message_logs")
            .insert({
                recipient_type: recipientType,
                recipient_id:
                    recipientId === null
                        ? null
                        : String(recipientId),
                phone,
                template_used: contentSid,
                delivery_status: "queued",
            })
            .select("id")
            .single();

    logId =
        logRow?.id ?? null;

    try {
        const message =
            await getTwilioClient()
                .messages
                .create({
                    from:
                        normalizeWhatsAppAddress(sender),
                    to: phone,
                    contentSid,
                    contentVariables:
                        JSON.stringify(contentVariables),
                });

        if (logId) {
            await supabase
                .from("message_logs")
                .update({
                    twilio_sid: message.sid,
                    delivery_status:
                        message.status || "sent",
                    sent_time:
                        new Date().toISOString(),
                })
                .eq("id", logId);
        }

        return message;
    } catch (error: unknown) {
        if (logId) {
            await supabase
                .from("message_logs")
                .update({
                    delivery_status: "failed",
                    error_message:
                        getErrorMessage(error),
                })
                .eq("id", logId);
        }

        throw error;
    }
}

import { NextResponse } from "next/server";

const twilio =
    require("twilio");

const client =
    twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

export async function POST(
    request: Request
) {

    try {

        const body =
            await request.json();

        const {
            to,
            message
        } = body;

        const response =
            await client.messages.create({

                from:
                    `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

                to:
                    `whatsapp:${to}`,

                body:
                    message,
            });

        return NextResponse.json({

            success: true,

            sid:
                response.sid,
        });

    } catch (error: any) {

        console.log(
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error.message,
            },
            {
                status: 500,
            }
        );
    }
}
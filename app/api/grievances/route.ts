import { NextResponse } from "next/server";

import { getErrorMessage } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
    try {
        const body =
            await request.json();

        const supabase =
            getSupabaseAdmin();

        const { data, error } =
            await supabase
                .from("grievances")
                .insert({
                    patient_id:
                        body.patientId,
                    description:
                        body.description,
                    audio_reference_if_any:
                        body.audioReference || null,
                    status:
                        "new",
                    assigned_clinician:
                        body.assignedClinician || null,
                    pi_alert_sent_boolean:
                        false,
                })
                .select()
                .single();

        if (error || !data) {
            throw error || new Error("Grievance was not created");
        }

        return NextResponse.json({
            success: true,
            grievance:
                data,
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

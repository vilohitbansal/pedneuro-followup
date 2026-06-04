import { NextResponse } from "next/server";

import { createAudioStoragePath } from "@/lib/followup";
import { getErrorMessage } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
    try {
        const body =
            await request.json();

        const supabase =
            getSupabaseAdmin();

        const { data: followup, error: followupError } =
            await supabase
                .from("followups")
                .select("*, patients(id, patient_id)")
                .eq("id", body.followupId)
                .single();

        if (followupError || !followup) {
            throw followupError || new Error("Follow-up was not found");
        }

        const { storagePath, fileName } =
            createAudioStoragePath({
                patientCode:
                    followup.patients?.patient_id || `patient_${followup.patient_row_id}`,
                followupType:
                    followup.followup_type,
                extension:
                    body.extension || "webm",
            });

        const { data: audio, error: audioError } =
            await supabase
                .from("audio_submissions")
                .insert({
                    patient_id:
                        followup.patient_row_id,
                    followup_id:
                        followup.id,
                    followup_type:
                        followup.followup_type,
                    bucket:
                        "audio-recordings",
                    storage_path:
                        storagePath,
                    file_name:
                        fileName,
                    mime_type:
                        body.mimeType || "audio/webm",
                    review_status:
                        "pending_review",
                })
                .select()
                .single();

        if (audioError || !audio) {
            throw audioError || new Error("Audio metadata was not created");
        }

        await supabase
            .from("audio_reviews")
            .insert({
                audio_id:
                    audio.id,
                patient_id:
                    followup.patient_row_id,
                assigned_clinician:
                    body.assignedClinician || null,
                review_status:
                    "pending_review",
            });

        return NextResponse.json({
            success: true,
            storagePath,
            fileName,
            audio,
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

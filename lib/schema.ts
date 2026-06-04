import type { SupabaseClient } from "@supabase/supabase-js";

const requiredAutomationTables = [
    "followup_events",
    "grievances",
    "message_logs",
    "audio_submissions",
    "audio_reviews",
];

export async function getMissingAutomationTables(
    supabase: SupabaseClient
) {
    const missingTables: string[] = [];

    for (const table of requiredAutomationTables) {
        const { error } =
            await supabase
                .from(table)
                .select("*", {
                    count: "exact",
                    head: true,
                });

        if (error) {
            missingTables.push(table);
        }
    }

    return missingTables;
}

export async function assertAutomationTables(
    supabase: SupabaseClient
) {
    const missingTables =
        await getMissingAutomationTables(supabase);

    if (missingTables.length > 0) {
        throw new Error(
            `Supabase migration is not applied. Missing tables: ${missingTables.join(", ")}`
        );
    }
}

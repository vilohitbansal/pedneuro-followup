import { NextResponse } from "next/server";

import { runAutomationChecks } from "@/lib/automation";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const result =
            await runAutomationChecks();

        return NextResponse.json({
            success: true,
            result,
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

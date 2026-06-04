export type FollowupType = "T0" | "T7" | "T90";

export const followupOffsets: Record<FollowupType, number> = {
    T0: 0,
    T7: 7,
    T90: 90,
};

export function addDays(date: Date, days: number) {
    const nextDate =
        new Date(date);

    nextDate.setDate(
        nextDate.getDate() + days
    );

    return nextDate;
}

export function toDateOnly(date: Date) {
    return date
        .toISOString()
        .split("T")[0];
}

export function buildFollowupUrl(token: string) {
    const baseUrl =
        (
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.APP_URL ||
            "https://pedneuro-followup.vercel.app"
        ).replace(/\/+$/, "");

    return `${baseUrl}/?token=${token}`;
}

export function createAudioStoragePath({
    patientCode,
    followupType,
    extension,
    now = new Date(),
}: {
    patientCode: string;
    followupType: FollowupType | "GRIEVANCE";
    extension: string;
    now?: Date;
}) {
    const cleanPatientCode =
        patientCode.replace(/[^a-z0-9_-]/gi, "_");

    const datePart =
        toDateOnly(now);

    const timePart =
        now
            .toISOString()
            .split("T")[1]
            .replace(/[:.]/g, "")
            .slice(0, 6);

    const folder =
        followupType === "GRIEVANCE"
            ? "grievances"
            : followupType;

    const fileName =
        `${cleanPatientCode}_${followupType}_${datePart}_${timePart}.${extension}`;

    return {
        fileName,
        storagePath:
            `audio/${cleanPatientCode}/${folder}/${fileName}`,
    };
}

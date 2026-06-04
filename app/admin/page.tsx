import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";


type SearchParams = Promise<{
    key?: string;
}>;


function safeValue(value: unknown) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    return String(value);
}


async function prepareRows(
    rows: Record<string, unknown>[],
    supabase: ReturnType<typeof getSupabaseAdmin>
) {

    return Promise.all(

        rows.map(async (row) => {


            const cleaned = { ...row };


            delete cleaned.id;

            delete cleaned.followup_id;

            delete cleaned.patient_row_id;



            if (
                typeof cleaned.openended === "string" &&
                cleaned.openended !== "No Concerns"
            ) {

                const { data } =
                    await supabase.storage
                        .from("audio-recordings")
                        .createSignedUrl(
                            cleaned.openended,
                            60 * 60
                        );


                cleaned.audio =
                    data?.signedUrl || null;

            }


            return cleaned;

        })

    );

}



function ResponseTable({
    title,
    rows,
    error
}: {
    title: string;
    rows: Record<string, unknown>[];
    error?: string;
}) {


    if (error) {

        return (

            <section style={styles.section}>

                <h2>{title}</h2>

                <p style={styles.error}>
                    {error}
                </p>

            </section>

        );

    }


    if (!rows.length) {

        return (

            <section style={styles.section}>

                <h2>{title}</h2>

                <p>No responses</p>

            </section>

        );

    }


    const columns =
        Object.keys(rows[0]);


    return (

        <section style={styles.section}>

            <h2>{title}</h2>


            <div style={styles.tableWrapper}>

                <table style={styles.table}>

                    <thead>

                        <tr>

                            {columns.map((column) => (

                                <th
                                    key={column}
                                    style={styles.th}
                                >
                                    {column}
                                </th>

                            ))}

                        </tr>

                    </thead>


                    <tbody>

                        {rows.map((row, index) => (

                            <tr key={index}>


                                {columns.map((column) => (

                                    <td
                                        key={column}
                                        style={styles.td}
                                    >

                                        {
                                            column === "audio" &&
                                                row[column]
                                                ?
                                                (
                                                    <audio
                                                        controls
                                                        src={
                                                            String(row[column])
                                                        }
                                                    />
                                                )
                                                :
                                                safeValue(
                                                    row[column]
                                                )
                                        }

                                    </td>

                                ))}


                            </tr>

                        ))}

                    </tbody>


                </table>

            </div>

        </section>

    );

}




export default async function Dashboard({
    searchParams
}: {
    searchParams: SearchParams;
}) {


    const params =
        await searchParams;


    if (
        params.key !==
        process.env.ADMIN_DASHBOARD_TOKEN
    ) {

        return (

            <main style={styles.page}>

                <h1>Access denied</h1>

            </main>

        );

    }


    const supabase =
        getSupabaseAdmin();



    const [
        t0,
        t7,
        t90
    ] =
        await Promise.all([


            supabase
                .from("t0_responses")
                .select("*")
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                ),


            supabase
                .from("t7_responses")
                .select("*")
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                ),


            supabase
                .from("t90_responses")
                .select("*")
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                )


        ]);



    const t0Rows =
        await prepareRows(
            t0.data || [],
            supabase
        );


    const t7Rows =
        await prepareRows(
            t7.data || [],
            supabase
        );


    const t90Rows =
        await prepareRows(
            t90.data || [],
            supabase
        );



    return (

        <main style={styles.page}>

            <h1 style={styles.title}>
                Follow-up Responses Dashboard
            </h1>


            <ResponseTable
                title="T0 Responses"
                rows={t0Rows}
                error={t0.error?.message}
            />


            <ResponseTable
                title="T7 Responses"
                rows={t7Rows}
                error={t7.error?.message}
            />


            <ResponseTable
                title="T90 Responses"
                rows={t90Rows}
                error={t90.error?.message}
            />


        </main>

    );

}



const styles: Record<string, CSSProperties> = {


    page: {

        minHeight: "100vh",

        padding: 30,

        background: "#ffffff",

        color: "#000000"

    },


    title: {

        fontSize: 32,

        marginBottom: 30

    },


    section: {

        marginBottom: 40

    },


    tableWrapper: {

        overflowX: "auto",

        background: "#ffffff",

        border: "1px solid #ccc"

    },


    table: {

        width: "100%",

        borderCollapse: "collapse"

    },


    th: {

        padding: 12,

        background: "#eeeeee",

        color: "#000",

        borderBottom: "1px solid #ccc",

        textAlign: "left",

        whiteSpace: "nowrap"

    },


    td: {

        padding: 10,

        color: "#000",

        borderBottom: "1px solid #eee",

        whiteSpace: "nowrap"

    },


    error: {

        color: "red",

        fontWeight: 700

    }

};
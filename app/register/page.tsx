"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

function generateWhatsAppMessage(
    patientName: string,
    token: string,
    day: number
) {

    const link =
        `https://pedneuro-followup.vercel.app/?token=${token}`;

    return `Dear caregiver of ${patientName},

Please complete the Day ${day} pediatric neurology follow-up questionnaire using the secure link below:

${link}

Thank you.
AIIMS Pediatric Neurology Follow-up Team`;
}

export default function RegisterPage() {

    const [patientName, setPatientName] =
        useState("");

    const [patientId, setPatientId] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const handleSubmit = async () => {

        const today = new Date();

        const t0 = new Date(today);

        const t7 = new Date(today);
        t7.setDate(today.getDate() + 7);

        const t90 = new Date(today);
        t90.setDate(today.getDate() + 90);

        // CREATE PATIENT

        const {
            data: patientData,
            error: patientError
        } = await supabase
            .from("patients")
            .insert([
                {
                    patient_name: patientName,

                    patient_id: patientId,

                    address: address,

                    caregiver_phone: phone,

                    notes: notes,

                    discharge_date: today
                        .toISOString()
                        .split("T")[0],

                    t0_due: t0
                        .toISOString()
                        .split("T")[0],

                    t7_due: t7
                        .toISOString()
                        .split("T")[0],

                    t90_due: t90
                        .toISOString()
                        .split("T")[0],
                },
            ])
            .select()
            .single();

        if (patientError || !patientData) {

            alert(
                patientError?.message
            );

            return;
        }

        // GENERATE TOKENS

        const t0Token =
            crypto.randomUUID();

        const t7Token =
            crypto.randomUUID();

        const t90Token =
            crypto.randomUUID();

        // CREATE FOLLOWUPS

        const {
            error: followupError
        } = await supabase
            .from("followups")
            .insert([
                {
                    patient_row_id:
                        patientData.id,

                    followup_type: "T0",

                    due_date:
                        t0.toISOString()
                            .split("T")[0],

                    token: t0Token,

                    completed: false
                },

                {
                    patient_row_id:
                        patientData.id,

                    followup_type: "T7",

                    due_date:
                        t7.toISOString()
                            .split("T")[0],

                    token: t7Token,

                    completed: false
                },

                {
                    patient_row_id:
                        patientData.id,

                    followup_type: "T90",

                    due_date:
                        t90.toISOString()
                            .split("T")[0],

                    token: t90Token,

                    completed: false
                }
            ]);

        if (followupError) {

            alert(
                followupError.message
            );

            return;
        }

        // GENERATE WHATSAPP MESSAGES

        const t0Message =
            generateWhatsAppMessage(
                patientName,
                t0Token,
                0
            );

        const t7Message =
            generateWhatsAppMessage(
                patientName,
                t7Token,
                7
            );

        const t90Message =
            generateWhatsAppMessage(
                patientName,
                t90Token,
                90
            );

        console.log(
            "T0 MESSAGE:",
            t0Message
        );
        await fetch(
            "/api/send-whatsapp",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({

                    to:
                        phone,

                    message:
                        t0Message,
                }),
            }
        );
        await supabase
            .from("followups")
            .update({
                message_sent: true
            })
            .eq(
                "token",
                t0Token
            );

        console.log(
            "T7 MESSAGE:",
            t7Message
        );

        console.log(
            "T7 MESSAGE:",
            t7Message
        );

        console.log(
            "T90 MESSAGE:",
            t90Message
        );

        alert(
            "Patient + followups created successfully!"
        );

        setPatientName("");
        setPatientId("");
        setAddress("");
        setPhone("");
        setNotes("");
    };

    return (
        <div style={styles.container}>

            <h1 style={styles.heading}>
                Patient Registration
            </h1>

            <input
                style={styles.input}
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) =>
                    setPatientName(
                        e.target.value
                    )
                }
            />

            <input
                style={styles.input}
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) =>
                    setPatientId(
                        e.target.value
                    )
                }
            />

            <input
                style={styles.input}
                placeholder="Address"
                value={address}
                onChange={(e) =>
                    setAddress(
                        e.target.value
                    )
                }
            />

            <input
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                    setPhone(
                        e.target.value
                    )
                }
            />

            <textarea
                style={{
                    ...styles.input,
                    minHeight: 120,
                    resize: "vertical",
                }}
                placeholder="Notes"
                value={notes}
                onChange={(e) =>
                    setNotes(
                        e.target.value
                    )
                }
            />

            <button
                style={styles.button}
                onClick={handleSubmit}
            >
                REGISTER PATIENT
            </button>

        </div>
    );
}

const styles: Record<
    string,
    React.CSSProperties
> = {

    container: {

        minHeight: "100vh",

        padding: 25,

        display: "flex",

        flexDirection: "column",

        justifyContent: "center",

        alignItems: "center",

        textAlign: "center",

        background: "#000000",

        color: "white",
    },

    heading: {

        marginBottom: 30,

        lineHeight: 1.5,

        maxWidth: 800,

        fontSize: 36,

        color: "white",
    },

    input: {

        width: "85%",

        maxWidth: 500,

        padding: "18px 20px",

        marginBottom: 18,

        fontSize: 20,

        borderRadius: 14,

        border: "1px solid white",

        background: "#111111",

        color: "white",

        outline: "none",
    },

    button: {

        width: "85%",

        maxWidth: 500,

        padding: "18px 22px",

        marginTop: 10,

        fontSize: 22,

        borderRadius: 14,

        border: "none",

        background: "white",

        color: "black",

        fontWeight: 600,

        cursor: "pointer",

        boxShadow:
            "0 4px 10px rgba(255,255,255,0.12)",
    },
};
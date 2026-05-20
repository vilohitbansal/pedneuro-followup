"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

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

        const { error } = await supabase
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
            ]);

        if (error) {
            alert(error.message);
        } else {
            alert(
                "Patient registered successfully!"
            );

            setPatientName("");
            setPatientId("");
            setAddress("");
            setPhone("");
            setNotes("");
        }
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
                    setPatientName(e.target.value)
                }
            />

            <input
                style={styles.input}
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) =>
                    setPatientId(e.target.value)
                }
            />

            <input
                style={styles.input}
                placeholder="Address"
                value={address}
                onChange={(e) =>
                    setAddress(e.target.value)
                }
            />

            <input
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                    setPhone(e.target.value)
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
                    setNotes(e.target.value)
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
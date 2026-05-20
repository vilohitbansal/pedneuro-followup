"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
type Language = "en" | "hi" | "pa";

type Answer = string;

interface Question {
    id: string;

    type: "yesno" | "audio";

    text: Record<Language, string>;

    audio: Record<Language, string>;
}

export default function Home() {
    const [language, setLanguage] =
        useState<Language | null>(null);

    const [introFinished, setIntroFinished] =
        useState(false);

    const [showQuietRequest, setShowQuietRequest] =
        useState(false);

    const [showWelcomeMsg, setShowWelcomeMsg] =
        useState(true);

    const [step, setStep] = useState(0);

    const [consentAttempts, setConsentAttempts] =
        useState(0);

    const [terminated, setTerminated] =
        useState(false);

    const [answers, setAnswers] =
        useState<Record<string, Answer>>({});
    const hasSubmitted = useRef(false);
    const searchParams = useSearchParams();
    const token =
        searchParams.get("token");

    const [followupData, setFollowupData] =
        useState<any>(null);

    useEffect(() => {

        const fetchFollowup =
            async () => {

                if (!token) {

                    console.log("NO TOKEN");

                    return;
                }

                const { data, error } =
                    await supabase
                        .from("followups")
                        .select("*")
                        .eq("token", token)
                        .single();

                console.log(
                    "FOLLOWUP DATA:",
                    data
                );

                console.log(
                    "FOLLOWUP ERROR:",
                    error
                );

                if (data) {

                    setFollowupData(data);
                }
            };

        fetchFollowup();

    }, [token]); 
    
    const labels = {
        yes: {
            en: "Yes",
            hi: "हाँ",
            pa: "ਹਾਂ"
        },

        no: {
            en: "No",
            hi: "नहीं",
            pa: "ਨਹੀਂ"
        },

        next: {
            en: "Next",
            hi: "आगे बढ़ें",
            pa: "ਅੱਗੇ ਵਧੋ"
        },

        startRecording: {
            en: "Start Recording",
            hi: "रिकॉर्डिंग शुरू करें",
            pa: "ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਕਰੋ"
        },

        stopRecording: {
            en: "Stop Recording",
            hi: "रिकॉर्डिंग बंद करें",
            pa: "ਰਿਕਾਰਡਿੰਗ ਬੰਦ ਕਰੋ"
        },
        reviewRecording: {
            en: "Review Recording",
            hi: "रिकॉर्डिंग सुनें",
            pa: "ਰਿਕਾਰਡਿੰਗ ਸੁਣੋ"
        },

        recordAgain: {
            en: "Record Again",
            hi: "दोबारा रिकॉर्ड करें",
            pa: "ਮੁੜ ਰਿਕਾਰਡ ਕਰੋ"
        },

        submitRecording: {
            en: "Submit Recording",
            hi: "रिकॉर्डिंग जमा करें",
            pa: "ਰਿਕਾਰਡਿੰਗ ਜਮ੍ਹਾਂ ਕਰੋ"
        },

        noConcerns: {
            en: "No Concerns",
            hi: "कोई समस्या नहीं",
            pa: "ਕੋਈ ਸਮੱਸਿਆ ਨਹੀਂ"
        }
    };

    const questions: Question[] = [
        {
            id: "consent",

            type: "yesno",

            text: {
                en: "Do you consent to continue with this follow-up questionnaire?",

                hi: "क्या आप इस फॉलो-अप प्रश्नावली को जारी रखने के लिए सहमत हैं?",

                pa: "ਕੀ ਤੁਸੀਂ ਇਸ ਫਾਲੋਅੱਪ ਪ੍ਰਸ਼ਨਾਵਲੀ ਨੂੰ ਜਾਰੀ ਰੱਖਣ ਲਈ ਸਹਿਮਤ ਹੋ?"
            },

            audio: {
                en: "/audio/en/engconsent1.mp3",

                hi: "/audio/hi/hinconsent1.mp3",

                pa: "/audio/pa/pbiconsent1.mp3"
            }
        },

        {
            id: "q1",

            type: "yesno",

            text: {
                en: "After discharge, did your child miss any dose of antiseizure medication?",

                hi: "अस्पताल से छुट्टी के बाद क्या बच्चे की दौरे की दवा की कोई खुराक छूटी थी?",

                pa: "ਹਸਪਤਾਲ ਤੋਂ ਛੁੱਟੀ ਤੋਂ ਬਾਅਦ ਕੀ ਤੁਹਾਡੇ ਬੱਚੇ ਦੀ ਦੌਰੇ ਦੀ ਦਵਾ ਦੀ ਕੋਈ ਖੁਰਾਕ ਰਹਿ ਗਈ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq1.mp3",

                hi: "/audio/hi/hinq1.mp3",

                pa: "/audio/pa/pbiq1.mp3"
            }
        },

        {
            id: "q2",

            type: "yesno",

            text: {
                en: "Did you change your child's antiseizure medication dosage on your own or on someone else's advice?",

                hi: "क्या आपने अपने बच्चे की दौरे की दवा की मात्रा खुद से या किसी और की सलाह पर बदली थी?",

                pa: "ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਬੱਚੇ ਦੀ ਦੌਰੇ ਦੀ ਦਵਾ ਦੀ ਮਾਤਰਾ ਆਪਣੇ ਆਪ ਜਾਂ ਕਿਸੇ ਹੋਰ ਦੀ ਸਲਾਹ ਨਾਲ ਬਦਲੀ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq2.mp3",

                hi: "/audio/hi/hinq2.mp3",

                pa: "/audio/pa/pbiq2.mp3"
            }
        },

        {
            id: "q3",

            type: "yesno",

            text: {
                en: "Did you stop your child's antiseizure medication on your own?",

                hi: "क्या आपने अपने बच्चे की दौरे की दवा खुद से बंद की थी?",

                pa: "ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਬੱਚੇ ਦੀ ਦੌਰੇ ਦੀ ਦਵਾ ਆਪਣੇ ਆਪ ਬੰਦ ਕਰ ਦਿੱਤੀ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq3.mp3",

                hi: "/audio/hi/hinq3.mp3",

                pa: "/audio/pa/pbiq3.mp3"
            }
        },

        {
            id: "q4",

            type: "yesno",

            text: {
                en: "Did you have difficulty understanding the timing of administering medication?",

                hi: "क्या आपको अपने बच्चे की दौरे की दवा देने का समय समझने में कोई कठिनाई हुई थी?",

                pa: "ਕੀ ਤੁਹਾਨੂੰ ਆਪਣੇ ਬੱਚੇ ਦੀ ਦਵਾ ਦੇਣ ਦਾ ਸਮਾਂ ਸਮਝਣ ਵਿੱਚ ਕੋਈ ਦਿੱਕਤ ਹੋਈ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq4.mp3",

                hi: "/audio/hi/hinq4.mp3",

                pa: "/audio/pa/pbiq4.mp3"
            }
        },

        {
            id: "q5",

            type: "yesno",

            text: {
                en: "Did your child experience vomiting, rashes, or excessive drowsiness after taking medication?",

                hi: "अस्पताल से छुट्टी के बाद क्या बच्चे को उल्टी, चकत्ते या बहुत ज्यादा नींद आने जैसी समस्या हुई?",

                pa: "ਕੀ ਬੱਚੇ ਨੂੰ ਦਵਾਈ ਤੋਂ ਬਾਅਦ ਉਲਟੀ, ਚੱਕਤੇ ਜਾਂ ਬਹੁਤ ਜ਼ਿਆਦਾ ਨੀਂਦ ਆਉਣੀ ਵਰਗੀ ਕੋਈ ਦਿੱਕਤ ਹੋਈ?"
            },

            audio: {
                en: "/audio/en/engq5.mp3",

                hi: "/audio/hi/hinq5.mp3",

                pa: "/audio/pa/pbiq5.mp3"
            }
        },

        {
            id: "q6",

            type: "yesno",

            text: {
                en: "Did you need to visit a nearby clinic or hospital because of side effects?",

                hi: "क्या इन दुष्प्रभावों के कारण आपको पास के किसी क्लिनिक या अस्पताल जाना पड़ा था?",

                pa: "ਕੀ ਇਨ੍ਹਾਂ ਦਿੱਕਤਾਂ ਕਰਕੇ ਤੁਹਾਨੂੰ ਨੇੜਲੇ ਕਿਸੇ ਕਲੀਨਿਕ ਜਾਂ ਹਸਪਤਾਲ ਜਾਣਾ ਪਿਆ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq6.mp3",

                hi: "/audio/hi/hinq6.mp3",

                pa: "/audio/pa/pbiq6.mp3"
            }
        },

        {
            id: "q7",

            type: "yesno",

            text: {
                en: "Did your child have any seizure at home after discharge?",

                hi: "अस्पताल से छुट्टी होने के बाद क्या आपके बच्चे को घर पर कोई दौरा पड़ा था?",

                pa: "ਹਸਪਤਾਲ ਤੋਂ ਛੁੱਟੀ ਹੋਣ ਤੋਂ ਬਾਅਦ ਕੀ ਤੁਹਾਡੇ ਬੱਚੇ ਨੂੰ ਘਰ ਵਿੱਚ ਕੋਈ ਦੌਰਾ ਪਿਆ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq7.mp3",

                hi: "/audio/hi/hinq7.mp3",

                pa: "/audio/pa/pbiq7.mp3"
            }
        },

        {
            id: "q8",

            type: "yesno",

            text: {
                en: "Did you need hospital visit because your child suddenly had a seizure at home?",

                hi: "क्या घर पर अचानक दौरा आने के कारण आपको अस्पताल जाना पड़ा था?",

                pa: "ਕੀ ਘਰ ਵਿੱਚ ਅਚਾਨਕ ਦੌਰਾ ਆਉਣ ਕਾਰਨ ਤੁਹਾਨੂੰ ਹਸਪਤਾਲ ਜਾਣਾ ਪਿਆ ਸੀ?"
            },

            audio: {
                en: "/audio/en/engq8.mp3",

                hi: "/audio/hi/hinq8.mp3",

                pa: "/audio/pa/pbiq8.mp3"
            }
        },

        {
            id: "q9",

            type: "yesno",

            text: {
                en: "Do you have midazolam nasal spray or rescue medication at home?",

                hi: "क्या आपके पास घर में मिडाजोलाम नेजल स्प्रे उपलब्ध है?",

                pa: "ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਘਰ ਵਿੱਚ ਮਿਡਾਜੋਲਾਮ ਨੇਜ਼ਲ ਸਪਰੇ ਮੌਜੂਦ ਹੈ?"
            },

            audio: {
                en: "/audio/en/engq9.mp3",

                hi: "/audio/hi/hinq9.mp3",

                pa: "/audio/pa/pbiq9.mp3"
            }
        },

        {
            id: "q10",

            type: "yesno",

            text: {
                en: "Do you know when and how to use midazolam nasal spray?",

                hi: "क्या आपको पता है कि मिडाजोलाम नेजल स्प्रे कब और कैसे इस्तेमाल करना है?",

                pa: "ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ ਕਿ ਮਿਡਾਜੋਲਾਮ ਸਪਰੇ ਕਦੋਂ ਅਤੇ ਕਿਵੇਂ ਵਰਤਣਾ ਹੈ?"
            },

            audio: {
                en: "/audio/en/engq10.mp3",

                hi: "/audio/hi/hinq10.mp3",

                pa: "/audio/pa/pbiq10.mp3"
            }
        },

        {
            id: "q11",

            type: "yesno",

            text: {
                en: "If the primary caregiver is not available, do others know how to manage it?",

                hi: "क्या परिवार के दूसरे सदस्यों को भी दौरे की दवा कब और कैसे देनी है पता है?",

                pa: "ਕੀ ਪਰਿਵਾਰ ਦੇ ਹੋਰ ਮੈਂਬਰਾਂ ਨੂੰ ਵੀ ਪਤਾ ਹੈ ਕਿ ਦੌਰੇ ਦੀ ਦਵਾ ਕਦੋਂ ਅਤੇ ਕਿਵੇਂ ਦੇਣੀ ਹੈ?"
            },

            audio: {
                en: "/audio/en/engq11.mp3",

                hi: "/audio/hi/hinq11.mp3",

                pa: "/audio/pa/pbiq11.mp3"
            }
        },

        {
            id: "q12",

            type: "yesno",

            text: {
                en: "Are you able to obtain your child's antiseizure medication from a pharmacy near your home?",

                hi: "क्या आपको घर के पास की दवा की दुकान से बच्चे की दवा मिल जाती है?",

                pa: "ਕੀ ਤੁਹਾਨੂੰ ਘਰ ਦੇ ਨੇੜੇ ਦੀ ਦਵਾ ਦੀ ਦੁਕਾਨ ਤੋਂ ਬੱਚੇ ਦੀ ਦਵਾ ਮਿਲ ਜਾਂਦੀ ਹੈ?"
            },

            audio: {
                en: "/audio/en/engq12.mp3",

                hi: "/audio/hi/hinq12.mp3",

                pa: "/audio/pa/pbiq12.mp3"
            }
        },

        {
            id: "q13",

            type: "yesno",

            text: {
                en: "Do you know when to come for follow-up after discharge?",

                hi: "क्या आपको पता है कि अस्पताल से छुट्टी के बाद फॉलो-अप के लिए कब आना है?",

                pa: "ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ ਕਿ ਫਾਲੋ-ਅਪ ਲਈ ਕਦੋਂ ਆਉਣਾ ਹੈ?"
            },

            audio: {
                en: "/audio/en/engq13.mp3",

                hi: "/audio/hi/hinq13.mp3",

                pa: "/audio/pa/pbiq13.mp3"
            }
        },

        {
            id: "openended",

            type: "audio",

            text: {
                en: "Are there any problems left that were not discussed?",

                hi: "क्या कोई समस्या रह गई है जिस पर चर्चा नहीं हुई?",

                pa: "ਕੀ ਕੋਈ ਸਮੱਸਿਆ ਰਹਿ ਗਈ ਹੈ ਜਿਸ ਬਾਰੇ ਗੱਲ ਨਹੀਂ ਹੋਈ?"
            },

            audio: {
                en: "/audio/en/engopenendedq.mp3",

                hi: "/audio/hi/hinopenendedq.mp3",

                pa: "/audio/pa/openendpbi_q.mp3"
            }
        }
    ];

    const current = questions[step];
    const submitResponses = async (
        finalAnswers: Record<string, string>
    ) => {
        if (!followupData) {

            console.log("NO FOLLOWUP DATA");

            return;
        }
        if (hasSubmitted.current) return;

        hasSubmitted.current = true;
        console.log("FUNCTION STARTED");

        const { data, error } = await supabase
            .from("responses")
            .insert([
                {
                    patient_row_id:
                        followupData.patient_row_id,

                    followup_id:
                        followupData.id,

                    language: language,

                    consent: finalAnswers.consent,

                    q1: finalAnswers.q1,
                    q2: finalAnswers.q2,
                    q3: finalAnswers.q3,
                    q4: finalAnswers.q4,
                    q5: finalAnswers.q5,
                    q6: finalAnswers.q6,
                    q7: finalAnswers.q7,
                    q8: finalAnswers.q8,
                    q9: finalAnswers.q9,
                    q10: finalAnswers.q10,
                    q11: finalAnswers.q11,
                    q12: finalAnswers.q12,
                    q13: finalAnswers.q13,

                    openended:
                        finalAnswers.openended,

                    terminated: false
                }
            ])
            .select();

        console.log("DATA:", data);

        console.log("ERROR:", error);
        if (data) {

            await supabase
                .from("followups")
                .update({
                    completed: true
                })
                .eq(
                    "id",
                    followupData.id
                );
        }
    };

    const handleAnswer = (value: string) => {
        const updatedAnswers = {
            ...answers,
            [current.id]: value
        };

        setAnswers(updatedAnswers);

        if (current.id === "consent") {
            if (value === "no") {

                if (consentAttempts === 0) {

                    setConsentAttempts(1);

                    return;
                }

                if (consentAttempts === 1) {

                    setTerminated(true);

                    return;
                }
            }
        }

        setStep((prev) => prev + 1);
    };

    if (!introFinished) {

        return (
            <div style={styles.container}>

                <h1
                    style={{
                        ...styles.heading,
                        fontSize: "clamp(32px, 6vw, 48px)"
                    }}
                >
                    Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ
                </h1>

                <div
                    style={{
                        display: "flex",
                        gap: 20,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        width: "100%",
                        maxWidth: 1000
                    }}
                >

                    <button
                        style={{
                            ...styles.button,
                            width: 250
                        }}
                        onClick={() => {

                            setLanguage("en");

                            setShowQuietRequest(true);

                            setIntroFinished(true);
                        }}
                    >
                        English
                    </button>

                    <button
                        style={{
                            ...styles.button,
                            width: 250
                        }}
                        onClick={() => {

                            setLanguage("hi");

                            setShowQuietRequest(true);

                            setIntroFinished(true);
                        }}
                    >
                        हिन्दी
                    </button>

                    <button
                        style={{
                            ...styles.button,
                            width: 250
                        }}
                        onClick={() => {

                            setLanguage("pa");

                            setShowQuietRequest(true);

                            setIntroFinished(true);
                        }}
                    >
                        ਪੰਜਾਬੀ
                    </button>

                </div>

            </div>
        );
    }

    if (!language) return null;
    if (token && !followupData) {

        return (
            <div style={styles.container}>
                <h1 style={styles.heading}>
                    Loading follow-up...
                </h1>
            </div>
        );
    }

    if (showQuietRequest) {
        return (
            <div style={styles.container}>
                <QuestionAudio
                    src={
                        language === "en"
                            ? "/audio/en/quietreqeng.mp3"
                            : language === "hi"
                                ? "/audio/hi/hinquietreq.mp3"
                                : "/audio/pa/silencereq_pbi.mp3"
                    }
                />

                <h2 style={styles.questionText}>
                    {
                        {
                            en: "Please sit in a quiet place before answering the questions.",

                            hi: "कृपया शांत स्थान पर बैठकर उत्तर दें।",

                            pa: "ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਾਂਤ ਥਾਂ 'ਤੇ ਬੈਠ ਕੇ ਜਵਾਬ ਦਿਓ।"
                        }[language]
                    }
                </h2>

                <button
                    style={styles.button}
                    onClick={() =>
                        setShowQuietRequest(false)
                    }
                >
                    {labels.next[language]}
                </button>
            </div>
        );
    }

    if (showWelcomeMsg) {
        return (
            <div style={styles.container}>
                <QuestionAudio
                    src={
                        language === "en"
                            ? "/audio/en/engwelcomemsg.mp3"
                            : language === "hi"
                                ? "/audio/hi/hindiintro.mp3"
                                : "/audio/pa/welcomemsgpunzabi.mp3"
                    }
                />

                <h2 style={styles.questionText}>
                    {
                        {
                            en: "Hello, I am from the Paediatric Neurology Team AIIMS Bathinda. I am calling for a medical follow-up regarding your child after their discharge. I have a few questions about their medication and recovery that will take about 10 minutes. Is now a good time to talk?",

                            hi: "नमस्ते, मैं एम्स बठिंडा की पीडियाट्रिक न्यूरोलॉजी टीम से बात कर रहा/रही हूँ। हम आपके बच्चे के अस्पताल से छुट्टी मिलने के बाद उनकी सेहत की जानकारी लेने के लिए फोन कर रहे हैं। दवाओं और सुधार से जुड़े कुछ जरूरी सवालों के लिए क्या आपके पास अगले 10 मिनट का समय है?",

                            pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਐਮਜ਼ ਬਠਿੰਡਾ ਦੀ ਬਾਲ ਨਿਊਰੋਲੋਜੀ ਟੀਮ ਤੋਂ ਗੱਲ ਕਰ ਰਿਹਾ/ਰਹੀ ਹਾਂ। ਅਸੀਂ ਤੁਹਾਡੇ ਬੱਚੇ ਦੇ ਹਸਪਤਾਲ ਤੋਂ ਛੁੱਟੀ ਮਿਲਣ ਤੋਂ ਬਾਅਦ ਉਹਨਾਂ ਦੀ ਸਿਹਤ ਬਾਰੇ ਜਾਣਨ ਲਈ ਫੋਨ ਕਰ ਰਹੇ ਹਾਂ। ਦਵਾਈਆਂ ਅਤੇ ਸੁਧਾਰ ਲਈ ਕੁਝ ਜ਼ਰੂਰੀ ਸਵਾਲਾਂ ਲਈ ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਹੁਣ 10 ਮਿੰਟ ਸਮਾਂ ਹੈ?"
                        }[language]
                    }
                </h2>

                <button
                    style={styles.button}
                    onClick={() =>
                        setShowWelcomeMsg(false)
                    }
                >
                    {labels.next[language]}
                </button>
            </div>
        );
    }

    if (
        consentAttempts === 1 &&
        current.id === "consent"
    ) {
        return (
            <div style={styles.container}>
                <QuestionAudio
                    src={
                        language === "en"
                            ? "/audio/en/engconsent2.mp3"
                            : language === "hi"
                                ? "/audio/hi/hinconsent2.mp3"
                                : "/audio/pa/pbiconsent_2.mp3"
                    }
                />

                <h2 style={styles.questionText}>
                    {
                        {
                            en: "Your responses are important for your child’s treatment and safety. Do you wish to continue?",

                            hi: "आपके उत्तर आपके बच्चे के उपचार और सुरक्षा के लिए महत्वपूर्ण हैं। क्या आप जारी रखना चाहेंगे?",

                            pa: "ਤੁਹਾਡੇ ਜਵਾਬ ਤੁਹਾਡੇ ਬੱਚੇ ਦੇ ਇਲਾਜ ਅਤੇ ਸੁਰੱਖਿਆ ਲਈ ਮਹੱਤਵਪੂਰਨ ਹਨ। ਕੀ ਤੁਸੀਂ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੋਗੇ?"
                        }[language]
                    }
                </h2>

                <button
                    style={styles.button}
                    onClick={() => {
                        setConsentAttempts(0);

                        handleAnswer("yes");
                    }}
                >
                    {labels.yes[language]}
                </button>

                <button
                    style={styles.button}
                    onClick={() => {

                        setTerminated(true);

                        setConsentAttempts(0);

                        setStep(-1);
                    }}
                >
                    {labels.no[language]}
                </button>
            </div>
        );
    }



    if (step === -1) {

        return (
            <div style={styles.container}>
                <h1>
                    {
                        {
                            en: "your response has not been recorded - kindly contact 84316 15569 for further help",

                            hi: "आपका उत्तर दर्ज नहीं किया गया है - कृपया आगे की मदद के लिए 84316 15569 पर संपर्क करें।",

                            pa: "ਤੁਹਾਡਾ ਜਵਾਬ ਦਰਜ ਨਹੀਂ ਕੀਤਾ ਗਿਆ - ਅੱਗੇ ਦੀ ਮਦਦ ਲਈ ਕਿਰਪਾ ਕਰਕੇ 84316 15569 'ਤੇ ਸੰਪਰਕ ਕਰੋ।"
                        }[language]
                    }
                </h1>
            </div>
        );
    }

    if (terminated) {
        return (
            <div style={styles.container}>
                <h1>
                    {
                        {
                            en: "Thank you.",

                            hi: "धन्यवाद।",

                            pa: "ਧੰਨਵਾਦ।"
                        }[language]
                    }
                </h1>
            </div>
        );
    }

    if (step >= questions.length) {

        submitResponses(answers);

        return (
            <div style={styles.container}>
                <QuestionAudio
                    src={
                        language === "en"
                            ? "/audio/en/thankumsgeng.mp3"
                            : language === "hi"
                                ? "/audio/hi/hinthankmsg.mp3"
                                : "/audio/pa/thank_msg_pbi.mp3"
                    }
                />

                <h1 style={styles.heading}>
                    {
                        {
                            en: "Thank you for your responses.",

                            hi: "आपके उत्तरों के लिए धन्यवाद।",

                            pa: "ਤੁਹਾਡੇ ਜਵਾਬਾਂ ਲਈ ਧੰਨਵਾਦ।"
                        }[language]
                    }
                </h1>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <QuestionAudio
                src={current.audio[language]}
            />

            <h2 style={styles.questionText}>
                {current.text[language]}
            </h2>

            {current.type === "yesno" && (
                <>
                    <button
                        style={styles.button}
                        onClick={() =>
                            handleAnswer("yes")
                        }
                    >
                        {labels.yes[language]}
                    </button>

                    <button
                        style={styles.button}
                        onClick={() =>
                            handleAnswer("no")
                        }
                    >
                        {labels.no[language]}
                    </button>
                </>
            )}

            {current.type === "audio" && (
                <AudioRecorder
                    language={language}
                    labels={labels}
                    onComplete={(url: string) => {
                        handleAnswer(url);
                    }}
                />
            )}
        </div>
    );
}

function QuestionAudio({
    src
}: {
    src?: string;
}) {

    const audioRef =
        useRef<HTMLAudioElement | null>(null);

    useEffect(() => {

        if (audioRef.current && src) {

            audioRef.current.pause();

            audioRef.current.load();

            const playPromise =
                audioRef.current.play();

            if (playPromise !== undefined) {

                playPromise.catch(() => { });
            }
        }

    }, [src]);

    if (!src) return null;

    return (
        <audio
            ref={audioRef}
            src={src}
            preload="auto"
            hidden
        />
    );
}

function AudioRecorder({
    onComplete,
    language,
    labels
}: any) {

    const [recording, setRecording] =
        useState(false);

    const [audioURL, setAudioURL] =
        useState<string | null>(null);

    const [audioBlob, setAudioBlob] =
        useState<Blob | null>(null);

    const mediaRecorderRef =
        useRef<MediaRecorder | null>(null);

    const start = async () => {

        setAudioURL(null);

        setAudioBlob(null);

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        const recorder =
            new MediaRecorder(stream);

        mediaRecorderRef.current =
            recorder;

        const chunks: Blob[] = [];

        recorder.ondataavailable = (
            e
        ) => {

            chunks.push(e.data);
        };

        recorder.onstop = () => {

            const blob =
                new Blob(chunks, {
                    type: "audio/webm"
                });

            const url =
                URL.createObjectURL(blob);

            setAudioBlob(blob);

            setAudioURL(url);

            stream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );
        };

        recorder.start();

        setRecording(true);
    };

    const stop = () => {

        if (!mediaRecorderRef.current)
            return;

        mediaRecorderRef.current.stop();

        setRecording(false);
    };

    const uploadAudio =
        async () => {

            if (!audioBlob) {

                alert(
                    "No audio recorded"
                );

                return;
            }

            const fileName =
                `${Date.now()}.webm`;

            const { error } =
                await supabase.storage
                    .from(
                        "audio-recordings"
                    )
                    .upload(
                        fileName,
                        audioBlob
                    );

            if (error) {

                console.error(error);

                alert(
                    JSON.stringify(error)
                );

                return;
            }

            const { data } =
                supabase.storage
                    .from(
                        "audio-recordings"
                    )
                    .getPublicUrl(
                        fileName
                    );

            onComplete(
                data.publicUrl
            );
        };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >

            {audioURL && (

                <audio
                    controls
                    src={audioURL}
                    style={{
                        width: "90%",
                        maxWidth: 500,
                        marginBottom: 20
                    }}
                />
            )}

            {!recording ? (

                audioURL ? (

                    <>
                        <button
                            style={styles.button}
                            onClick={() => {

                                setAudioURL(null);

                                setAudioBlob(null);
                            }}
                        >
                            {
                                labels.recordAgain[
                                language
                                ]
                            }
                        </button>

                        <button
                            style={styles.button}
                            onClick={
                                uploadAudio
                            }
                        >
                            {
                                labels.submitRecording[
                                language
                                ]
                            }
                        </button>
                    </>

                ) : (

                    <>
                        <button
                            style={styles.button}
                            onClick={start}
                        >
                            {
                                labels.startRecording[
                                language
                                ]
                            }
                        </button>

                        <button
                            style={styles.button}
                            onClick={() =>
                                onComplete(
                                    "No Concerns"
                                )
                            }
                        >
                            {
                                labels.noConcerns[
                                language
                                ]
                            }
                        </button>
                    </>

                )

            ) : (

                <button
                    style={styles.button}
                    onClick={stop}
                >
                    {
                        labels.stopRecording[
                        language
                        ]
                    }
                </button>

            )}
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

        justifyContent: "flex-start",

        alignItems: "center",

        textAlign: "center",

        paddingTop: 50,

        background: "#111111"
    },

    heading: {

        color: "#f5f1e8",

        fontSize: "clamp(32px, 6vw, 48px)",

        marginBottom: 30,

        lineHeight: 1.5,

        maxWidth: 800
    },

    questionText: {

        fontSize: "clamp(26px, 5vw, 34px)",

        color: "#f5f1e8",

        lineHeight: 1.6,

        marginBottom: 30,

        maxWidth: 900
    },

    button: {

        width: "85%",

        maxWidth: 500,

        padding: "24px 28px",

        margin: "12px auto",

        fontSize: 26,

        borderRadius: 16,

        border: "none",

        background: "#f5f1e8",

        color: "#111111",

        fontWeight: 700,

        cursor: "pointer",

        boxShadow:
            "0 4px 12px rgba(0,0,0,0.25)"
    },
};
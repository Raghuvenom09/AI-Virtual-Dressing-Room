import { useState, useCallback } from "react";

const API_BASE_URL = "https://ai-virtual-dressing-room-production.up.railway.app";

export const useVirtualDressing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultImage, setResultImage] = useState(null);

    // Convert File → base64 string
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const tryOn = useCallback(async(personFile, clothFile) => {
        setLoading(true);
        setError(null);

        try {
            const personBase64 = await fileToBase64(personFile);
            const clothBase64 = await fileToBase64(clothFile);

            const payload = {
                person_image: personBase64,
                clothing_image: clothBase64,
                user_id: null,
            };

            const response = await fetch(`${API_BASE_URL}/api/tryon/process`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.status !== "success") {
                throw new Error(data.message || "Try-on failed");
            }

            setResultImage(`data:image/jpeg;base64,${data.result_image}`);

            return data;
        } catch (err) {
            setError(err.message);
            console.error("Try-on error:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        resultImage,
        tryOn,
    };
};
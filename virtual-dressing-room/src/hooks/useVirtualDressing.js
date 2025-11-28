import { useState, useCallback } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL;

export const useVirtualDressing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultImage, setResultImage] = useState(null);

    const tryOn = useCallback(async(personFile, clothFile) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("person", personFile);
            formData.append("cloth", clothFile);

            const response = await fetch(`${API_BASE_URL}/api/tryon/process`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Try-on failed");
            }

            const data = await response.json();
            setResultImage(data.output_image);
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
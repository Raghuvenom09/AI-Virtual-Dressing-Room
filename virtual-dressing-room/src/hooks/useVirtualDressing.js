import { useState, useCallback } from 'react';

const API_BASE_URL =
    import.meta.env.VITE_API_URL;


/**
 * Custom hook for virtual dressing room AI processing
 * Handles human parsing, pose estimation, and cloth segmentation
 */
export const useVirtualDressing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    /**
     * Parse human body parts from image
     */
    const parseHuman = useCallback(async(file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/parse-human`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to parse human');
            }

            const data = await response.json();
            setResults(prev => ({...prev, humanParsing: data }));
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error parsing human';
            setError(errorMsg);
            console.error('Parse human error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Estimate human pose from image
     */
    const estimatePose = useCallback(async(file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/estimate-pose`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to estimate pose');
            }

            const data = await response.json();
            setResults(prev => ({...prev, poseEstimation: data }));
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error estimating pose';
            setError(errorMsg);
            console.error('Estimate pose error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Segment clothing items from image
     */
    const segmentCloth = useCallback(async(file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/segment-cloth`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to segment cloth');
            }

            const data = await response.json();
            setResults(prev => ({...prev, clothSegmentation: data }));
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error segmenting cloth';
            setError(errorMsg);
            console.error('Segment cloth error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Process image with all models
     */
    const processFull = useCallback(async(file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/process-full`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process image');
            }

            const data = await response.json();
            setResults(data);
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error processing image';
            setError(errorMsg);
            console.error('Process full error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear results and errors
     */
    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
    }, []);

    return {
        loading,
        error,
        results,
        parseHuman,
        estimatePose,
        segmentCloth,
        processFull,
        clearResults,
    };
};

export default useVirtualDressing;
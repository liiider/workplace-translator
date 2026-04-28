export const runWorkplaceTranslator = async ({ inputText, fireLevel, persona, imageDataUrl }) => {
    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputText,
            fireLevel,
            persona,
            imageDataUrl,
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || `Translate API error: ${response.status}`);
    }

    return {
        subtext: payload.subtext || '',
        actions: Array.isArray(payload.actions) ? payload.actions : [],
        response: payload.response || '',
    };
};

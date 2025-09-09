// Utility to safely parse JSON from a Response object
export async function safeParseJSON(response: Response) {
    try {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch {
        return { message: 'Invalid JSON response' };
    }
}
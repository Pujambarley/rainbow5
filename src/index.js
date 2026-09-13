const CATEGORIES = new Set([
    "Gameplay",
    "UI / Design",
    "Bug / Problem",
    "Suggestion",
    "Other"
]);
const SENDER = "feedback@playrainbow5.com";

function json(body, status = 200, headers = {}) {
    return Response.json(body, {
        status,
        headers: { "Cache-Control": "no-store", ...headers }
    });
}

function invalidFeedback() {
    return json({ ok: false, error: "Invalid feedback." }, 400);
}

async function handleFeedback(request, env) {
    if (request.method !== "POST") {
        return json(
            { ok: false, error: "Method not allowed." },
            405,
            { Allow: "POST" }
        );
    }

    const contentType = (request.headers.get("Content-Type") || "")
        .split(";")[0].trim().toLowerCase();
    if (contentType !== "application/json") {
        return invalidFeedback();
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return invalidFeedback();
    }

    // Only these two fields are accepted; mail routing and headers are server-owned.
    if (
        !body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some(key => key !== "category" && key !== "message") ||
        typeof body.category !== "string" || typeof body.message !== "string"
    ) {
        return invalidFeedback();
    }

    const category = body.category.trim();
    const message = body.message.trim();
    if (!CATEGORIES.has(category) || !message || message.length > 1000) {
        return invalidFeedback();
    }

    try {
        await env.FEEDBACK_EMAIL.send({
            // Omitting `to` uses the binding's single destination_address.
            from: SENDER,
            subject: `Rainbow5 Feedback — ${category}`,
            text: `Rainbow5 Feedback\n\nCategory: ${category}\n\nMessage:\n${message}\n\nSource:\nhttps://playrainbow5.com/`
        });
        return json({ ok: true });
    } catch (error) {
        // Avoid logging the feedback body or private recipient details.
        console.error("Rainbow5 feedback email send failed:", error?.code, error?.message);
        return json({ ok: false, error: "Unable to send feedback right now." }, 500);
    }
}

export default {
    async fetch(request, env) {
        if (new URL(request.url).pathname === "/api/feedback") {
            return handleFeedback(request, env);
        }
        return env.ASSETS.fetch(request);
    }
};

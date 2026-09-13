// Read the game's existing preference before the homepage is painted.
(() => {
    let theme = "dark";
    try {
        if (localStorage.getItem("rainbow5_theme_v1") === "light") {
            theme = "light";
        }
    } catch {
        // Keep the game's default when browser storage is unavailable.
    }
    document.documentElement.dataset.theme = theme;
})();

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("feedback-button");
    const modal = document.getElementById("feedback-modal");
    const form = document.getElementById("feedback-form");
    const category = document.getElementById("feedback-category");
    const feedback = document.getElementById("feedback-text");
    const counter = document.getElementById("feedback-counter");
    const status = document.getElementById("feedback-status");
    const sendButton = form.querySelector('button[type="submit"]');
    let submitting = false;

    function clearStatus() {
        status.textContent = "";
        category.removeAttribute("aria-invalid");
        feedback.removeAttribute("aria-invalid");
    }

    button.addEventListener("click", () => modal.showModal());
    document.getElementById("feedback-close").addEventListener("click", () => modal.close());

    // Native dialog handles Escape and keeps keyboard focus inside the modal.
    modal.addEventListener("close", () => {
        clearStatus();
        button.focus({ preventScroll: true });
    });

    function isBackdrop(event) {
        const bounds = modal.getBoundingClientRect();
        return event.target === modal && (
            event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom
        );
    }

    let startedOnBackdrop = false;
    modal.addEventListener("pointerdown", event => {
        startedOnBackdrop = isBackdrop(event);
    });
    modal.addEventListener("click", event => {
        if (startedOnBackdrop && isBackdrop(event)) {
            modal.close();
        }
        startedOnBackdrop = false;
    });

    feedback.addEventListener("input", () => {
        counter.textContent = `${feedback.value.length} / 1000`;
        clearStatus();
    });
    category.addEventListener("change", clearStatus);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitting) return;
        clearStatus();

        if (!category.value) {
            status.textContent = "Please choose a feedback type.";
            category.setAttribute("aria-invalid", "true");
            category.focus();
            return;
        }
        if (!feedback.value.trim()) {
            status.textContent = "Please enter some feedback first.";
            feedback.setAttribute("aria-invalid", "true");
            feedback.focus();
            return;
        }
        if (feedback.value.length > feedback.maxLength) {
            status.textContent = "Please keep your feedback to 1000 characters or fewer.";
            feedback.setAttribute("aria-invalid", "true");
            feedback.focus();
            return;
        }

        submitting = true;
        sendButton.disabled = true;
        sendButton.textContent = "Sending...";

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: category.value,
                    message: feedback.value.trim()
                })
            });
            if (!response.ok) throw new Error("Feedback request failed");
            const result = await response.json();
            if (result?.ok !== true) throw new Error("Feedback request failed");

            feedback.value = "";
            counter.textContent = "0 / 1000";
            status.textContent = modal.open ? "Thanks! Your feedback was sent. 🌈" : "";
        } catch {
            status.textContent = "Sorry — I couldn't send that right now. Please try again.";
        } finally {
            submitting = false;
            sendButton.textContent = "Send Feedback";
            sendButton.disabled = false;
        }
    });
});

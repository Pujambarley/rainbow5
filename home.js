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
    const themeButton = document.getElementById("theme-button");

    function updateThemeLabel() {
        const action = document.documentElement.dataset.theme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode";
        themeButton.setAttribute("aria-label", action);
        themeButton.title = action;
    }
    updateThemeLabel();
    themeButton.addEventListener("click", () => {
        const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        updateThemeLabel();
        try {
            localStorage.setItem("rainbow5_theme_v1", theme);
        } catch {
            // The theme still changes when browser storage is unavailable.
        }
    });

    function updateDailyPuzzleNumber() {
        const today = new Date();
        // Match the game's local calendar day, using UTC arithmetic to avoid DST drift.
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const dayIndex = Math.floor((todayUTC - Date.UTC(2026, 8, 12)) / 86400000);
        document.getElementById("daily-puzzle-number").textContent = dayIndex < 0
            ? "Coming soon"
            : `#${dayIndex + 1}`;
    }
    updateDailyPuzzleNumber();
    window.addEventListener("pageshow", updateDailyPuzzleNumber);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) updateDailyPuzzleNumber();
    });

    const button = document.getElementById("feedback-button");
    const modal = document.getElementById("feedback-modal");
    const form = document.getElementById("feedback-form");
    const category = document.getElementById("feedback-category");
    const feedback = document.getElementById("feedback-text");
    const counter = document.getElementById("feedback-counter");
    const status = document.getElementById("feedback-status");
    const sendButton = form.querySelector('button[type="submit"]');
    let submitting = false;

    const categoryValues = {
        gameplay: "Gameplay",
        design: "UI / Design",
        bug: "Bug / Problem",
        suggestion: "Suggestion",
        other: "Other"
    };
    const allowedCategories = new Set(Object.values(categoryValues));
    for (const option of category.options) {
        option.value = categoryValues[option.value] ?? option.value;
    }

    function updateCounter() {
        counter.textContent = `${feedback.value.length} / 1000`;
    }
    updateCounter();
    window.addEventListener("pageshow", updateCounter);

    function clearStatus() {
        status.textContent = "";
        category.removeAttribute("aria-invalid");
        feedback.removeAttribute("aria-invalid");
    }

    button.addEventListener("click", () => {
        updateCounter();
        modal.showModal();
    });
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
        updateCounter();
        clearStatus();
    });
    feedback.addEventListener("change", updateCounter);
    category.addEventListener("change", clearStatus);

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submitting) return;
        clearStatus();
        updateCounter();
        const selectedCategory = category.value;
        const trimmedMessage = feedback.value.trim();

        if (!allowedCategories.has(selectedCategory)) {
            status.textContent = "Please choose a feedback type.";
            category.setAttribute("aria-invalid", "true");
            category.focus();
            return;
        }
        if (!trimmedMessage) {
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
                    category: selectedCategory,
                    message: trimmedMessage
                })
            });
            if (!response.ok) throw new Error("Feedback request failed");
            const result = await response.json();
            if (result?.ok !== true) throw new Error("Feedback request failed");

            feedback.value = "";
            updateCounter();
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

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

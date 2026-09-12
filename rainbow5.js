/* -------------------------GAME SETTINGS------------------------- */

const ROW_COUNT = 6;
const COLUMN_COUNT = 5;
/*
    JavaScript months are zero-based.

    0 = January
    7 = August

    Puzzle #1 launch date: September 12, 2026
*/

const LAUNCH_DATE =
    new Date(
        2026,
        8,
        12
    );

/* -------------------------STORAGE SETTINGS------------------------- */

const GAME_STATE_STORAGE_KEY =
    "rainbow5_game_states_v1";
const STATS_STORAGE_KEY =
    "rainbow5_stats_v1";
const THEME_STORAGE_KEY =
    "rainbow5_theme_v1";

/* -------------------------CURRENT PUZZLE------------------------- */

let CURRENT_PUZZLE = null;
let currentPuzzleIndex = -1;
let ANSWER = null;

let gameMode = "daily";
let archiveBrowseIndex = -1;

/* -------------------------ENDLESS MODE STATE------------------------- */

const ENDLESS_RECENT_LIMIT = 8;
let endlessRecentPuzzleIndices = [];

/* -------------------------DOM REFERENCES------------------------- */

const board =
    document.getElementById("board");
const message =
    document.getElementById("message");
const keyboardKeys =
    document.querySelectorAll(".key");

const clearMarkingsButton =
    document.getElementById("clear-markings-button");
const rainbowHistory =
    document.getElementById("rainbow-history");
const puzzleNumber =
    document.getElementById("puzzle-number");

const resultPanel =
    document.getElementById("result-panel");
const resultTitle =
    document.getElementById("result-title");
const resultText =
    document.getElementById("result-text");
const nextPuzzleButton =
    document.getElementById("next-puzzle-button");

const statsButton =
    document.getElementById("settings-stats-button");
const statsPanel =
    document.getElementById("stats-panel");
const modalOverlay =
    document.getElementById("modal-overlay");
const modalTitle =
    document.getElementById("modal-title");
const modalContent =
    document.getElementById("modal-content");
const modalCloseButton =
    document.getElementById("modal-close-button");
const statPlayed =
    document.getElementById("stat-played");
const statWinRate =
    document.getElementById("stat-win-rate");
const statStreak =
    document.getElementById("stat-streak");
const statMaxStreak =
    document.getElementById("stat-max-streak");
const guessDistribution =
    document.getElementById("guess-distribution");

const howToPlayButton =
    document.getElementById("how-to-play-button");
const howToPlayPanel =
    document.getElementById("how-to-play-panel");

const settingsButton =
    document.getElementById("settings-button");
const settingsPanel =
    document.getElementById("settings-panel");
const themeLightButton =
    document.getElementById("theme-light-button");
const themeDarkButton =
    document.getElementById(
        "theme-dark-button"
    );

/* -------------------------PLAY MENU------------------------- */

const playMenuButton =
    document.getElementById(
        "play-menu-button"
    );

const playMenu =
    document.getElementById(
        "play-menu"
    );

const dailyModeButton =
    document.getElementById(
        "daily-mode-button"
    );

const archiveModeButton =
    document.getElementById(
        "archive-mode-button"
    );

const endlessModeButton =
    document.getElementById(
        "endless-mode-button"
    );


/* -------------------------ARCHIVE NAVIGATION------------------------- */

const archiveDateNav =
    document.getElementById(
        "archive-date-nav"
    );

const archiveDateDisplay =
    document.getElementById(
        "archive-date-display"
    );

const archivePreviousButton =
    document.getElementById(
        "archive-previous-button"
    );

const archiveNextButton =
    document.getElementById(
        "archive-next-button"
    ); 
    

/* -------------------------GAME STATE------------------------- */

let currentRow = 0;
let currentGuess = "";
let submittedGuesses = [];
let gameOver = false;
let isAnimating = false;

/* -------------------------ANIMATION SETTINGS------------------------- */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

const GUESS_FLIP_DURATION =
    prefersReducedMotion ? 1 : 350;
const GUESS_FLIP_STAGGER =
    prefersReducedMotion ? 0 : 100;
const HISTORY_FLIP_DURATION =
    prefersReducedMotion ? 1 : 350;
const HISTORY_FLIP_STAGGER =
    prefersReducedMotion ? 0 : 100;
const LOSS_RESULT_PAUSE =
    prefersReducedMotion ? 1 : 500;
const DAILY_STATS_POPUP_DELAY =
    prefersReducedMotion ? 1 : 900;

/* -------------------------WIN ANIMATION SETTINGS------------------------- */

/*
    These are intentionally separate
    from normal guess timing.

    The win sweep has many more tiles,
    so it can travel slightly faster.
*/

const WIN_SWEEP_DURATION =
    prefersReducedMotion ? 1 : 150;
const WIN_SWEEP_STAGGER =
    prefersReducedMotion ? 0 : 50;
const WIN_RESULT_PAUSE =
    prefersReducedMotion ? 1 : 500;

const WIN_COLOR_CLASSES = [
    "celebration-red",
    "celebration-orange",
    "celebration-yellow",
    "celebration-green",
    "celebration-blue"
];


/* -------------------------THEME------------------------- */

let currentTheme =
    loadTheme();

function loadTheme() {
    const savedTheme =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );
    if (
        savedTheme === "light"
    ) {
        return "light";
    }
    return "dark";
}

function applyTheme(
    theme
) {
    currentTheme =
        theme === "dark"
            ? "dark"
            : "light";

    document.documentElement.dataset.theme =
        currentTheme;

    themeLightButton.classList.toggle(
        "active-theme",
        currentTheme === "light"
    );

    themeDarkButton.classList.toggle(
        "active-theme",
        currentTheme === "dark"
    );
}

function setTheme(
    theme
) {
    applyTheme(
        theme
    );

    localStorage.setItem(
        THEME_STORAGE_KEY,
        currentTheme
    );
}


/* -------------------------SETTINGS MODAL------------------------- */

settingsButton.addEventListener(
    "click",
    () => {
        closePlayMenu();
        openModal(
            "Settings",
            settingsPanel
        );
    }
);


/* -------------------------THEME BUTTONS------------------------- */

themeLightButton.addEventListener(
    "click",
    () => {

        setTheme(
            "light"
        );
    }
);

themeDarkButton.addEventListener(
    "click",
    () => {

        setTheme(
            "dark"
        );
    }
);



/* -------------------------SAVED GAME STATE------------------------- */
let gameStates =
    loadGameStates();

/* -------------------------LOCAL STATS------------------------- */
let stats =
    loadStats();

/* -------------------------DICTIONARY STATE------------------------- */
let VALID_WORDS =
    new Set();
let dictionaryLoaded =
    false;

/* -------------------------PLAYER MARKING SETTINGS------------------------- */

const PLAYER_MARKINGS = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue"
];


/* -------------------------CREATE BOARD------------------------- */

function createBoard() {

    board.innerHTML = "";

    for (
        let row = 0;
        row < ROW_COUNT;
        row++
    ) {

        for (
            let column = 0;
            column < COLUMN_COUNT;
            column++
        ) {

            const tile =
                document.createElement(
                    "div"
                );

            tile.classList.add(
                "tile"
            );

            tile.dataset.row = row;

            tile.dataset.column =
                column;

            board.appendChild(tile);
        }
    }
}


/* -------------------------PLAY MODE MENU------------------------- */

function closePlayMenu() {

    playMenu.classList.add(
        "hidden"
    );


    playMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

function togglePlayMenu() {

    const isOpen =
        !playMenu.classList.contains(
            "hidden"
        );

    if (isOpen) {

        closePlayMenu();

    } else {

        playMenu.classList.remove(
            "hidden"
        );


        playMenuButton.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}

playMenuButton.addEventListener(
    "click",
    (event) => {

        if (isAnimating) {
            return;
        }

        event.stopPropagation();

        togglePlayMenu();
    }
);

playMenu.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();
    }
);

/* -------------------------
   ENDLESS NEXT PUZZLE
------------------------- */

nextPuzzleButton.addEventListener(
    "click",
    () => {

        if (
            gameMode !==
            "endless"
        ) {
            return;
        }


        selectEndlessPuzzle();
    }
);

document.addEventListener(
    "click",
    () => {

        closePlayMenu();
    }
);

/* -------------------------MODAL SYSTEM------------------------- */

function openModal(
    title,
    contentElement
) {

    modalTitle.textContent =
        title;

    modalContent.innerHTML = "";

    contentElement.classList.remove(
        "hidden"
    );

    modalContent.appendChild(
        contentElement
    );

    modalOverlay.classList.remove(
        "hidden"
    );

    modalOverlay.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeModal() {

    modalOverlay.classList.add(
        "hidden"
    );

    modalOverlay.setAttribute(
        "aria-hidden",
        "true"
    );
}

/* -------------------------OPEN STATS------------------------- */

function openStatsModal() {

    updateStatsDisplay();

    openModal(
        "Statistics",
        statsPanel
    );
}



/* -------------------------STATS MODAL------------------------- */

statsButton.addEventListener(
    "click",
    openStatsModal
);

/* -------------------------CLOSE MODAL------------------------- */

modalCloseButton.addEventListener(
    "click",
    closeModal
);

modalOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalOverlay
        ) {

            closeModal();
        }
    }
);


/* -------------------------HOW TO PLAY MODAL------------------------- */

howToPlayButton.addEventListener(
    "click",
    () => {

        closePlayMenu();

        openModal(
            "How to Play",
            howToPlayPanel
        );
    }
);

/* -------------------------RELEASED PUZZLES------------------------- */

function getTodayPuzzleIndex() {

    return getDailyPuzzleIndex();
}

function getLatestArchivePuzzleIndex() {

    const todayIndex =
        getTodayPuzzleIndex();


    /*
        Puzzle #1 has no
        historical puzzles yet.
    */

    if (
        todayIndex <= 0
    ) {

        return -1;
    }


    /*
        Archive ends at yesterday.

        It can also never exceed
        our authored puzzle list.
    */

    return Math.min(
        todayIndex - 1,
        PUZZLES.length - 1
    );
}


/* -------------------------PUZZLE DATE------------------------- */

function getPuzzleDate(
    puzzleIndex
) {

    const date =
        new Date(
            LAUNCH_DATE.getFullYear(),
            LAUNCH_DATE.getMonth(),
            LAUNCH_DATE.getDate()
        );


    date.setDate(
        date.getDate() +
        puzzleIndex
    );


    return date;
}

function formatPuzzleDate(
    puzzleIndex
) {

    const date =
        getPuzzleDate(
            puzzleIndex
        );


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* -------------------------OPEN ARCHIVE MODE------------------------- */

function openArchiveMode() {

    const latestArchiveIndex =
        getLatestArchivePuzzleIndex();


    closePlayMenu();


    /*
        Day #1 has nothing
        historical to browse.
    */

    if (
        latestArchiveIndex < 0
    ) {

        showMessage(
            "No past puzzles are available yet."
        );

        return;
    }


    /*
        Archive initially opens
        on yesterday's puzzle.
    */

    archiveBrowseIndex =
        latestArchiveIndex;


    archiveDateNav.classList.remove(
        "hidden"
    );


    loadArchiveBrowsePuzzle();
}


/* -------------------------LOAD ARCHIVE PUZZLE------------------------- */

function loadArchiveBrowsePuzzle() {

    if (
        archiveBrowseIndex < 0
    ) {
        return;
    }


    loadPuzzle(
        archiveBrowseIndex,
        "archive"
    );


    archiveDateDisplay.textContent =
        formatPuzzleDate(
            archiveBrowseIndex
        );


    updateArchiveDateButtons();
}


/* -------------------------UPDATE ARCHIVE BUTTONS------------------------- */

function updateArchiveDateButtons() {

    const latestArchiveIndex =
        getLatestArchivePuzzleIndex();


    archivePreviousButton.disabled =
        archiveBrowseIndex <= 0;


    archiveNextButton.disabled =
        archiveBrowseIndex >=
        latestArchiveIndex;
}


/* -------------------------ACTIVE PLAY MODE------------------------- */

function updateActiveModeIndicator() {

    dailyModeButton.classList.toggle(
        "active-mode",
        gameMode === "daily"
    );

    archiveModeButton.classList.toggle(
        "active-mode",
        gameMode === "archive"
    );

    endlessModeButton.classList.toggle(
        "active-mode",
        gameMode === "endless"
    );
}


/* -------------------------ARCHIVE NAVIGATION------------------------- */

archivePreviousButton.addEventListener(
    "click",
    () => {

        if (
            archiveBrowseIndex <= 0
        ) {
            return;
        }


        archiveBrowseIndex--;


        loadArchiveBrowsePuzzle();
    }
);

archiveNextButton.addEventListener(
    "click",
    () => {

        const latestArchiveIndex =
            getLatestArchivePuzzleIndex();


        if (
            archiveBrowseIndex >=
            latestArchiveIndex
        ) {
            return;
        }


        archiveBrowseIndex++;


        loadArchiveBrowsePuzzle();
    }
);


/* -------------------------PLAY MODE BUTTONS------------------------- */

dailyModeButton.addEventListener(
    "click",
    () => {

        closePlayMenu();


        archiveDateNav.classList.add(
            "hidden"
        );


        archiveBrowseIndex = -1;


        selectDailyPuzzle();
    }
);

archiveModeButton.addEventListener(
    "click",
    () => {

        openArchiveMode();
    }
);

endlessModeButton.addEventListener(
    "click",
    () => {

        closePlayMenu();

        selectEndlessPuzzle();
    }
);


/* -------------------------ANIMATE GUESS ROW------------------------- */

async function animateGuessRow(
    row
) {

    for (
        let column = 0;
        column < COLUMN_COUNT;
        column++
    ) {

        const tile =
            getTile(
                row,
                column
            );


        if (!tile) {
            continue;
        }

        tile.classList.add(
            "tile-flip"
        );


        /*
            Remove the class after
            the animation finishes
            so this tile can animate
            again if needed later.
        */

        setTimeout(
            () => {

                tile.classList.remove(
                    "tile-flip"
                );
            },
            GUESS_FLIP_DURATION
        );


        /*
            Start the next tile
            slightly later.
        */

        await wait(
            GUESS_FLIP_STAGGER
        );
    }


    /*
        Wait for the final tile
        to finish its flip.
    */

    await wait(
        GUESS_FLIP_DURATION -
        GUESS_FLIP_STAGGER
    );
}


/* -------------------------ANIMATE RAINBOW HISTORY------------------------- */

async function animateRainbowHistory(
    row,
    result
) {

    const historyRow =
        document.querySelector(
            `.rainbow-history-row[data-row="${row}"]`
        );


    if (!historyRow) {
        return;
    }

    const colorTiles =
        historyRow.querySelectorAll(
            ".history-color"
        );

    for (
        let index = 0;
        index < colorTiles.length;
        index++
    ) {

        const tile =
            colorTiles[index];


        tile.classList.add(
            "history-flip"
        );


        /*
            Change the actual result
            around the halfway point,
            when the tile is visually
            edge-on.
        */

        setTimeout(
            () => {

                tile.classList.remove(
                    "hit"
                );


                if (
                    result[index]
                ) {

                    tile.classList.add(
                        "hit"
                    );
                }

            },
            HISTORY_FLIP_DURATION / 2
        );

        setTimeout(
            () => {

                tile.classList.remove(
                    "history-flip"
                );

            },
            HISTORY_FLIP_DURATION
        );


        await wait(
            HISTORY_FLIP_STAGGER
        );
    }

    await wait(
        HISTORY_FLIP_DURATION -
        HISTORY_FLIP_STAGGER
    );
}


/* -------------------------ANIMATE ACCEPTED GUESS------------------------- */

async function animateAcceptedGuess(
    row,
    rainbowResult
) {

    isAnimating = true;


    await animateGuessRow(
        row
    );


    await animateRainbowHistory(
        row,
        rainbowResult
    );

    isAnimating = false;
}


/* -------------------------START WIN TILE FLIP------------------------- */

function startWinTileFlip(
    tile,
    colorClass,
    keepColor = false
) {

    if (!tile) {
        return;
    }


    tile.classList.add(
        "win-sweep-flip"
    );


    /*
        At the halfway point the tile
        is visually edge-on.

        That's when we change color.
    */

    setTimeout(
        () => {

            tile.classList.add(
                colorClass
            );

        },
        WIN_SWEEP_DURATION / 2
    );

    /*
        At the end of the flip:

        - normal sweep tiles return
          to their original appearance

        - solved-row tiles KEEP
          their final Rainbow color
    */

    setTimeout(
        () => {

            tile.classList.remove(
                "win-sweep-flip"
            );

            if (!keepColor) {

                tile.classList.remove(
                    colorClass
                );
            }
        },
        WIN_SWEEP_DURATION
    );
}


/* -------------------------PLAY WIN TILE SEQUENCE------------------------- */

async function playWinTileSequence(
    tiles,
    keepColors = false
) {

    for (
        const item of tiles
    ) {

        startWinTileFlip(
            item.tile,
            item.colorClass,
            keepColors
        );

        await wait(
            WIN_SWEEP_STAGGER
        );
    }

    /*
        The final tile has started,
        but still needs time to finish.
    */

    await wait(
        Math.max(
            0,
            WIN_SWEEP_DURATION -
            WIN_SWEEP_STAGGER
        )
    );
}


/* -------------------------RAINBOW WIN ANIMATION------------------------- */

async function playRainbowWinAnimation(
    solvedRow
) {

    isAnimating = true;


    /* =========================
       PART 1
       HISTORY ROWS BELOW

       Top → Bottom

       Each row:
       Red → Blue

       The solved history row
       already revealed normally,
       so we begin one row below it.
    ========================= */

    for (
        let row =
            solvedRow + 1;

        row < ROW_COUNT;

        row++
    ) {

        const historyRow =
            document.querySelector(
                `.rainbow-history-row[data-row="${row}"]`
            );


        if (!historyRow) {
            continue;
        }

        const historyTiles =
            historyRow.querySelectorAll(
                ".history-color"
            );

        const sequence = [];

        for (
            let column = 0;

            column < COLUMN_COUNT;

            column++
        ) {

            sequence.push({

                tile:
                    historyTiles[
                        column
                    ],

                colorClass:
                    WIN_COLOR_CLASSES[
                        column
                    ]
            });
        }


        await playWinTileSequence(
            sequence,
            true
        );
    }


    /* =========================
       PART 2
       UNUSED GUESS ROWS

       Bottom → Up

       Each row:
       Red → Blue
    ========================= */

    for (
        let row =
            ROW_COUNT - 1;

        row > solvedRow;

        row--
    ) {
        const sequence = [];

        for (
            let column = 0;

            column < COLUMN_COUNT;

            column++
        ) {

            sequence.push({

                tile:
                    getTile(
                        row,
                        column
                    ),

                colorClass:
                    WIN_COLOR_CLASSES[
                        column
                    ]
            });
        }


        await playWinTileSequence(
            sequence,
            true
        );
    }

    /* =========================
       PART 3
       SOLVED WORD FINALE

       Red → Orange → Yellow
       → Green → Blue

       These colors STAY.
    ========================= */

    const solvedSequence = [];

    for (
        let column = 0;

        column < COLUMN_COUNT;

        column++
    ) {

        solvedSequence.push({

            tile:
                getTile(
                    solvedRow,
                    column
                ),

            colorClass:
                WIN_COLOR_CLASSES[
                    column
                ]
        });
    }

    await playWinTileSequence(
        solvedSequence,
        true
    );

    isAnimating = false;
}

/* -------------------------APPLY COMPLETED WIN COLORS------------------------- */

function applyCompletedWinColors(
    solvedRow
) {

    /*
        Solved guess row
        and every unused guess
        row below it.
    */

    for (
        let row = solvedRow;

        row < ROW_COUNT;

        row++
    ) {

        for (
            let column = 0;

            column < COLUMN_COUNT;

            column++
        ) {

            const tile =
                getTile(
                    row,
                    column
                );


            if (!tile) {
                continue;
            }

            tile.classList.add(
                WIN_COLOR_CLASSES[
                    column
                ]
            );
        }
    }

    /*
        History rows BELOW the
        solved row need celebration
        colors restored.

        The solved history row itself
        already restores naturally
        through its normal "hit" state.
    */

    for (
        let row =
            solvedRow + 1;

        row < ROW_COUNT;

        row++
    ) {

        const historyRow =
            document.querySelector(
                `.rainbow-history-row[data-row="${row}"]`
            );


        if (!historyRow) {
            continue;
        }

        const historyTiles =
            historyRow.querySelectorAll(
                ".history-color"
            );


        historyTiles.forEach(
            (tile, column) => {

                tile.classList.add(
                    WIN_COLOR_CLASSES[
                        column
                    ]
                );
            }
        );
    }
}

/* -------------------------CREATE RAINBOW HISTORY------------------------- */

function createRainbowHistory() {

    rainbowHistory.innerHTML = "";


    for (
        let row = 0;
        row < ROW_COUNT;
        row++
    ) {

        const historyRow =
            document.createElement(
                "div"
            );


        historyRow.classList.add(
            "rainbow-history-row"
        );


        historyRow.dataset.row =
            row;


        const colorClasses = [
            "rainbow-red",
            "rainbow-orange",
            "rainbow-yellow",
            "rainbow-green",
            "rainbow-blue"
        ];


        colorClasses.forEach(
            (colorClass, index) => {

                const colorTile =
                    document.createElement(
                        "div"
                    );


                colorTile.classList.add(
                    "history-color",
                    colorClass
                );


                colorTile.dataset.feedbackPosition =
                    index;


                historyRow.appendChild(
                    colorTile
                );
            }
        );


        rainbowHistory.appendChild(
            historyRow
        );
    }
}


/* -------------------------UPDATE RAINBOW HISTORY------------------------- */

function updateRainbowHistory(
    row,
    result
) {

    const historyRow =
        document.querySelector(
            `.rainbow-history-row[data-row="${row}"]`
        );


    if (!historyRow) {
        return;
    }


    const colorTiles =
        historyRow.querySelectorAll(
            ".history-color"
        );


    colorTiles.forEach(
        (tile, index) => {

            tile.classList.remove(
                "hit"
            );


            if (result[index]) {

                tile.classList.add(
                    "hit"
                );
            }
        }
    );
}


/* -------------------------LOAD DICTIONARY------------------------- */

async function loadDictionary() {

    try {

         const response =
            await fetch(
                    "/data/valid_words.txt"
            );

        if (!response.ok) {

            throw new Error(
                "Could not load dictionary."
            );
        }


        const text =
            await response.text();


        const words =
            text
                .split(/\r?\n/)
                .map(
                    word =>
                        word
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    word =>
                        word.length === 5
                );


        VALID_WORDS =
            new Set(words);


        dictionaryLoaded =
            true;

        validatePuzzleData();

        selectDailyPuzzle();
        openInitialView();
         

    } catch (error) {

        console.error(error);


        showMessage(
            "Dictionary failed to load."
        );
    }
}


/* URL options request an initial view only; normal mode persistence stays unchanged. */
function openInitialView() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("mode") === "endless") {
        selectEndlessPuzzle();
    } else if (params.get("mode") === "archive") {
        openArchiveMode();
    }

    if (params.get("modal") === "howto") {
        openModal("How to Play", howToPlayPanel);
    }
}

/* -------------------------VALIDATE PUZZLE DATA------------------------- */

function validatePuzzleData() {

    const seenAnswers =
        new Set();


    let problemCount = 0;


    PUZZLES.forEach(
        (puzzle, index) => {

            const puzzleNumber =
                index + 1;


            const answer =
                String(
                    puzzle.answer || ""
                )
                    .trim()
                    .toUpperCase();


            /* -------------------------
               EXACTLY FIVE LETTERS
            ------------------------- */

            if (
                !/^[A-Z]{5}$/.test(
                    answer
                )
            ) {

                console.error(
                    `Puzzle ${puzzleNumber}: Invalid answer "${answer}".`
                );

                problemCount++;

                return;
            }


            /* -------------------------
               FIVE DISTINCT LETTERS
            ------------------------- */

            if (
                new Set(answer).size !==
                COLUMN_COUNT
            ) {

                console.error(
                    `Puzzle ${puzzleNumber}: "${answer}" contains repeated letters.`
                );

                problemCount++;
            }


            /* -------------------------
               MUST BE A VALID GUESS
            ------------------------- */

            if (
                !VALID_WORDS.has(
                    answer
                )
            ) {

                console.error(
                    `Puzzle ${puzzleNumber}: "${answer}" is not in valid_words.txt.`
                );

                problemCount++;
            }


            /* -------------------------
               NO DUPLICATE ANSWERS
            ------------------------- */

            if (
                seenAnswers.has(
                    answer
                )
            ) {

                console.error(
                    `Puzzle ${puzzleNumber}: "${answer}" appears more than once.`
                );

                problemCount++;

            } else {

                seenAnswers.add(
                    answer
                );
            }
        }
    );


    if (
        problemCount === 0
    ) {

    } else {

        console.warn(
            `Rainbow5 puzzle data found ${problemCount} problem(s).`
        );
    }
}


/* -------------------------DAILY PUZZLE INDEX------------------------- */
function getDailyPuzzleIndex() {

    const today =
        new Date();


    /*
        Convert both dates to UTC
        calendar dates.

        This keeps Day advancement
        stable across daylight-saving
        time changes.
    */

    const todayUTC =
        Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    const launchUTC =
        Date.UTC(
            LAUNCH_DATE.getFullYear(),
            LAUNCH_DATE.getMonth(),
            LAUNCH_DATE.getDate()
        );


    const millisecondsPerDay =
        1000 * 60 * 60 * 24;


    return Math.floor(
        (
            todayUTC -
            launchUTC
        ) /
        millisecondsPerDay
    );
}


/* -------------------------SELECT DAILY PUZZLE------------------------- */

function selectDailyPuzzle() {

    archiveDateNav.classList.add(
        "hidden"
    );


    archiveBrowseIndex = -1;

    const dailyIndex =
        getDailyPuzzleIndex();


    /* -------------------------
       BEFORE LAUNCH
    ------------------------- */

    if (
        dailyIndex < 0
    ) {

        showUnavailableDaily(
            "Rainbow5 has not launched yet."
        );

        return;
    }


    /* -------------------------
       NO AUTHORED PUZZLE
    ------------------------- */

    if (
        dailyIndex >=
        PUZZLES.length
    ) {

        showUnavailableDaily(
            "Today's Rainbow5 is not available yet."
        );


        console.error(
            `Missing Daily puzzle at index ${dailyIndex}.`
        );

        return;
    }


    /* -------------------------
       LOAD TODAY'S PUZZLE
    ------------------------- */

    loadPuzzle(
        dailyIndex,
        "daily"
    );
}


/* -------------------------LOCAL STATS------------------------- */
function createDefaultStats() {

    return {
        version: 1,
        played: 0,
        wins: 0,
        losses: 0,
        currentStreak: 0,
        maxStreak: 0,

        /*
            Index 0 = solved on guess 1
            Index 1 = solved on guess 2
            ...
            Index 5 = solved on guess 6
        */

        guessDistribution: [
            0,
            0,
            0,
            0,
            0,
            0
        ],


        /*
            Prevents the same Daily
            puzzle from counting twice.
        */

        dailyResults: {}
    };
}

function loadStats() {

    const saved =
        localStorage.getItem(
            STATS_STORAGE_KEY
        );


    if (!saved) {

        return createDefaultStats();
    }


    try {

        const parsed =
            JSON.parse(saved);


        return {

            ...createDefaultStats(),

            ...parsed
        };

    } catch (error) {

        console.error(
            "Could not load Rainbow5 stats:",
            error
        );


        return createDefaultStats();
    }
}

function saveStats() {

    localStorage.setItem(
        STATS_STORAGE_KEY,
        JSON.stringify(stats)
    );
}

/* -------------------------TODAY DATE STRING------------------------- */

function getTodayDateString() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/* -------------------------RECORD DAILY STATS------------------------- */
function recordDailyResult(
    won,
    guesses
) {

    const resultKey =
        String(
            currentPuzzleIndex
        );


    /*
        Never count the same
        Daily puzzle twice.
    */

    if (
        stats.dailyResults[
            resultKey
        ]
    ) {

        return;
    }


    stats.played++;


    if (won) {

        stats.wins++;


        stats.guessDistribution[
            guesses - 1
        ]++;


        /*
            Streak continues only if
            the immediately previous
            Daily was also won.
        */

        const previousResult =
            stats.dailyResults[
                String(
                    currentPuzzleIndex - 1
                )
            ];


        if (
            previousResult &&
            previousResult.won
        ) {

            stats.currentStreak++;

        } else {

            stats.currentStreak = 1;
        }


        if (
            stats.currentStreak >
            stats.maxStreak
        ) {

            stats.maxStreak =
                stats.currentStreak;
        }

    } else {

        stats.losses++;


        stats.currentStreak = 0;
    }


    stats.dailyResults[
        resultKey
    ] = {

        won: won,

        guesses: guesses,

        date:
            getTodayDateString()
    };


    saveStats();


    updateStatsDisplay();
}


/* -------------------------GAME STATE STORAGE------------------------- */
function createDefaultGameStates() {

    return {

        version: 1,

        puzzles: {}
    };
}

function loadGameStates() {

    const saved =
        localStorage.getItem(
            GAME_STATE_STORAGE_KEY
        );


    if (!saved) {

        return createDefaultGameStates();
    }


    try {

        const parsed =
            JSON.parse(saved);


        return {

            ...createDefaultGameStates(),

            ...parsed
        };

    } catch (error) {

        console.error(
            "Could not load Rainbow5 game states:",
            error
        );


        return createDefaultGameStates();
    }
}

function saveGameStates() {

    localStorage.setItem(
        GAME_STATE_STORAGE_KEY,
        JSON.stringify(
            gameStates
        )
    );
}


/* -------------------------COLLECT PLAYER MARKINGS------------------------- */

function collectPlayerMarkings() {

    const markings = {};


    const markedTiles =
        document.querySelectorAll(
            ".tile[data-marking]"
        );


    markedTiles.forEach(
        (tile) => {

            const row =
                Number(
                    tile.dataset.row
                );


            const column =
                Number(
                    tile.dataset.column
                );


            /*
                Only submitted rows
                belong in saved state.
            */

            if (
                row >=
                submittedGuesses.length
            ) {
                return;
            }


            const key =
                `${row}-${column}`;


            markings[key] =
                tile.dataset.marking;
        }
    );


    return markings;
}


/* -------------------------SAVE CURRENT PUZZLE STATE------------------------- */

function saveCurrentPuzzleState(
    completed = false,
    won = null
) {

    /*
        Endless never uses
        Daily/Archive persistence.
    */

    if (
        gameMode === "endless"
    ) {
        return;
    }


    if (
        currentPuzzleIndex < 0 ||
        !ANSWER
    ) {
        return;
    }


    const puzzleKey =
        String(
            currentPuzzleIndex
        );


    gameStates.puzzles[
        puzzleKey
    ] = {

        /*
            Saving the answer provides
            protection during development.

            If puzzles.js gets reordered,
            stale saved state will not
            silently restore onto a
            different answer.
        */

        answer: ANSWER,


        guesses: [
            ...submittedGuesses
        ],


        markings:
            collectPlayerMarkings(),


        completed: completed,

        won: won
    };


    saveGameStates();
}


/* -------------------------RESTORE PUZZLE STATE------------------------- */

function restorePuzzleState() {
    /*
        Endless always begins fresh.
    */
    if (
        gameMode === "endless"
    ) {

        return false;
    }

    const puzzleKey =
        String(
            currentPuzzleIndex
        );


    const savedState =
        gameStates.puzzles[
            puzzleKey
        ];


    if (!savedState) {

        return false;
    }

    /*
        DEVELOPMENT SAFETY

        If this puzzle index now points
        at a different answer, ignore
        the old state.
    */

    if (
        savedState.answer &&
        savedState.answer !== ANSWER
    ) {

        console.warn(
            `Ignored stale saved state for Rainbow5 #${currentPuzzleIndex + 1}.`
        );


        return false;
    }

    submittedGuesses =
        Array.isArray(
            savedState.guesses
        )
            ? [
                ...savedState.guesses
            ]
            : [];

    /* -------------------------
       RESTORE GUESSES
    ------------------------- */

    submittedGuesses.forEach(
        (guess, rowIndex) => {

            /*
                Put letters back
                onto the board.
            */

            for (
                let column = 0;
                column < COLUMN_COUNT;
                column++
            ) {

                const tile =
                    getTile(
                        rowIndex,
                        column
                    );


                if (!tile) {
                    continue;
                }


                tile.textContent =
                    guess[column] || "";
            }


            /*
                Restore submitted-row
                behavior.
            */

            markRowSubmitted(
                rowIndex
            );


            /*
                Rainbow history can be
                reconstructed from the
                answer + submitted guess.
            */

            const rainbowResult =
                evaluateRainbowGuess(
                    guess,
                    ANSWER
                );


            updateRainbowHistory(
                rowIndex,
                rainbowResult
            );


            /*
                Used keyboard letters
                can also be reconstructed.
            */

            markKeyboardLettersUsed(
                guess
            );
        }
    );

    /* -------------------------
       RESTORE PLAYER MARKINGS
    ------------------------- */

    const savedMarkings =
        savedState.markings || {};


    Object.entries(
        savedMarkings
    ).forEach(
        ([position, marking]) => {

            const [
                rowText,
                columnText
            ] =
                position.split("-");


            const row =
                Number(rowText);


            const column =
                Number(columnText);


            const tile =
                getTile(
                    row,
                    column
                );


            if (
                !tile ||
                !PLAYER_MARKINGS.includes(
                    marking
                )
            ) {
                return;
            }


            applyTileMarking(
                tile,
                marking
            );
        }
    );

    currentGuess = "";

    /* -------------------------
    COMPLETED PUZZLE
    ------------------------- */

    if (
        savedState.completed
    ) {

        gameOver = true;

        currentRow =
            submittedGuesses.length;


        clearMarkingsButton.disabled =
            true;


        showMessage("");

        /*
            Restored games do NOT replay
            the future win animation.

            They simply restore the final
            result presentation.
        */

        if (
            savedState.won
        ) {

            applyCompletedWinColors(
                submittedGuesses.length - 1
            );
        }

        showPuzzleResult(
            savedState.won
        );

        return true;
    }

    /* -------------------------
       UNFINISHED PUZZLE
    ------------------------- */

    currentRow =
        submittedGuesses.length;

    gameOver = false;

    clearMarkingsButton.disabled =
        false;

    showMessage("");

    return true;
}


/* -------------------------LOAD PUZZLE------------------------- */

function loadPuzzle(
    puzzleIndex,
    mode = "daily"
) {

    if (
        puzzleIndex < 0 ||
        puzzleIndex >= PUZZLES.length
    ) {

        console.error(
            `Invalid Rainbow5 puzzle index: ${puzzleIndex}`
        );

        return;
    }


    currentPuzzleIndex =
        puzzleIndex;


    CURRENT_PUZZLE =
        PUZZLES[
            currentPuzzleIndex
        ];


    ANSWER =
        CURRENT_PUZZLE.answer
            .trim()
            .toUpperCase();


    gameMode =
        mode;

    updateActiveModeIndicator();

    resetGameBoard();

    /*
        Daily and Archive restore
        saved progress if it exists.
        Endless deliberately ignores it.
    */
    restorePuzzleState();


    if (
        gameMode === "endless"
    ) {

        puzzleNumber.textContent =
            "Endless";

    } else {

        puzzleNumber.textContent =
            `#${currentPuzzleIndex + 1}`;
    }


}


/* -------------------------RESET GAME BOARD------------------------- */

function resetGameBoard() {

    currentRow = 0;

    currentGuess = "";

    submittedGuesses = [];

    gameOver = false;

    clearMarkingsButton.disabled =
        false;


    /* -------------------------
       CLEAR GUESS TILES
    ------------------------- */

    for (
        let row = 0;
        row < ROW_COUNT;
        row++
    ) {
        for (
            let column = 0;
            column < COLUMN_COUNT;
            column++
        ) {

            const tile =
                getTile(
                    row,
                    column
                );

            if (!tile) {
                continue;
            }

            tile.textContent = "";

            tile.classList.remove(
                "invalid",
                "submitted",
                "player-red",
                "player-orange",
                "player-yellow",
                "player-green",
                "player-blue",
                "celebration-red",
                "celebration-orange",
                "celebration-yellow",
                "celebration-green",
                "celebration-blue",
                "win-sweep-flip"
            );

            delete tile.dataset.marking;
        }
    }


    /* -------------------------
       CLEAR RAINBOW HISTORY
    ------------------------- */

    const historyTiles =
        document.querySelectorAll(
            ".history-color"
        );


    historyTiles.forEach(
        (tile) => {

            tile.classList.remove(
                "hit",
                "celebration-red",
                "celebration-orange",
                "celebration-yellow",
                "celebration-green",
                "celebration-blue",
                "win-sweep-flip"
            );
        }
    );


    /* -------------------------
       RESET KEYBOARD
    ------------------------- */

    keyboardKeys.forEach(
        (key) => {

            key.classList.remove(
                "used"
            );
        }
    );

    /* -------------------------
    CLEAR RESULT PANEL
    ------------------------- */

    resultPanel.classList.add(
        "hidden"
    );

    resultPanel.classList.remove(
        "result-win",
        "result-loss"
    );

    nextPuzzleButton.classList.add(
        "hidden"
    );

    resultTitle.textContent = "";

    resultText.textContent = "";

    /* -------------------------
       CLEAR MESSAGE
    ------------------------- */
    showMessage("");
}


/* -------------------------DAILY UNAVAILABLE------------------------- */

function showUnavailableDaily(
    text
) {

    resetGameBoard();

    CURRENT_PUZZLE = null;

    ANSWER = null;

    currentPuzzleIndex = -1;

    gameMode = "daily";

    updateActiveModeIndicator();

    gameOver = true;

    puzzleNumber.textContent = "";

    showMessage(
        text
    );

    console.warn(
        text
    );
}


/* -------------------------REMEMBER ENDLESS PUZZLE------------------------- */

function rememberEndlessPuzzle(
    puzzleIndex
) {

    /*
        Remove an older occurrence
        first, just in case.
    */

    endlessRecentPuzzleIndices =
        endlessRecentPuzzleIndices.filter(
            index =>
                index !==
                puzzleIndex
        );

    /*
        Most recently played puzzle
        always goes at the end.
    */

    endlessRecentPuzzleIndices.push(
        puzzleIndex
    );

    /*
        Keep only our chosen number
        of recent Endless puzzles.
    */

    if (
        endlessRecentPuzzleIndices.length >
        ENDLESS_RECENT_LIMIT
    ) {

        endlessRecentPuzzleIndices.shift();
    }
}

/* -------------------------ENDLESS PUZZLE------------------------- */

function selectEndlessPuzzle() {

    if (!dictionaryLoaded) {

        showMessage(
            "Dictionary is still loading."
        );

        return;
    }


    /*
        Endless uses only curated
        Rainbow5 answers that pass
        the normal puzzle rules.
    */

    const playablePuzzles =
        PUZZLES
            .map(
                (puzzle, index) => {

                    return {

                        index: index,

                        answer:
                            String(
                                puzzle.answer || ""
                            )
                                .trim()
                                .toUpperCase()
                    };
                }
            )
            .filter(
                (puzzle) => {

                    return (
                        /^[A-Z]{5}$/.test(
                            puzzle.answer
                        ) &&

                        new Set(
                            puzzle.answer
                        ).size ===
                            COLUMN_COUNT &&

                        VALID_WORDS.has(
                            puzzle.answer
                        )
                    );
                }
            );


    if (
        playablePuzzles.length === 0
    ) {

        console.error(
            "No playable Endless puzzles were found."
        );

        showMessage(
            "No Endless puzzles are available."
        );

        return;
    }


/* -------------------------
   AVOID RECENT ENDLESS PUZZLES
------------------------- */

let candidates =
    playablePuzzles.filter(
        puzzle =>
            !endlessRecentPuzzleIndices.includes(
                puzzle.index
            )
    );


    /*
        Eventually a very small puzzle pool
        could exhaust every recent candidate.

        If that happens, recycle the pool,
        but preserve the most recent puzzle
        so we still avoid an immediate repeat.
    */

    if (
        candidates.length === 0
    ) {

        const mostRecentIndex =
            endlessRecentPuzzleIndices.length > 0
                ? endlessRecentPuzzleIndices[
                    endlessRecentPuzzleIndices.length - 1
                ]
                : -1;


        endlessRecentPuzzleIndices =
            mostRecentIndex >= 0
                ? [mostRecentIndex]
                : [];


        candidates =
            playablePuzzles.filter(
                puzzle =>
                    puzzle.index !==
                    mostRecentIndex
            );
    }


    /*
        Extreme fallback:

        A one-puzzle Endless pool would
        otherwise leave zero candidates.
    */

    if (
        candidates.length === 0
    ) {

        candidates =
            playablePuzzles;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            candidates.length
        );


    const selectedPuzzle =
        candidates[
            randomIndex
        ];

    rememberEndlessPuzzle(
        selectedPuzzle.index
    );


    /*
        Archive navigation never appears
        while playing Endless.
    */

    archiveDateNav.classList.add(
        "hidden"
    );

    archiveBrowseIndex = -1;


    /*
        Use the same central puzzle loader
        as Daily and Archive.
    */

    loadPuzzle(
        selectedPuzzle.index,
        "endless"
    );

}


/* -------------------------PHYSICAL KEYBOARD------------------------- */

document.addEventListener(
    "keydown",
    handlePhysicalKey
);

function handlePhysicalKey(event) {
    const key =
        event.key;


    /* -------------------------
       MODAL INPUT
    ------------------------- */

    if (
        !modalOverlay.classList.contains(
            "hidden"
        )
    ) {

        if (
            key === "Escape"
        ) {

            event.preventDefault();

            closeModal();
        }


        return;
    }


    if (
        gameOver ||
        isAnimating
    ) {
        return;
    }

    /* Backspace */

    if (key === "Backspace") {

        event.preventDefault();

        removeLetter();

        return;
    }


    /* Enter */

    if (key === "Enter") {

        event.preventDefault();

        submitGuess();

        return;
    }


    /*
        Space creates an underscore.

        This is a scratch-space placeholder
        and cannot be submitted as part
        of a finished guess.
    */

    if (key === " ") {

        event.preventDefault();

        addCharacter("_");

        return;
    }


    /* Letters A-Z */

    if (/^[a-zA-Z]$/.test(key)) {

        addCharacter(
            key.toUpperCase()
        );
    }
}

/* -------------------------ON-SCREEN KEYBOARD------------------------- */

keyboardKeys.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                if (
                    gameOver ||
                    isAnimating
                ) {
                    return;
                }   

                const key =
                    button.dataset.key;


                if (
                    key ===
                    "BACKSPACE"
                ) {

                    removeLetter();

                    return;
                }


                if (
                    key ===
                    "ENTER"
                ) {

                    submitGuess();

                    return;
                }


                addCharacter(key);
            }
        );
    }
);


/* -------------------------ADD CHARACTER------------------------- */

function addCharacter(character) {

    if (
        currentGuess.length >=
        COLUMN_COUNT
    ) {
        return;
    }

    clearInvalidState();

    currentGuess += character;

    updateCurrentRow();

    showMessage("");

    /*
        As soon as five real letters
        are entered, check whether
        the word exists.
    */

    if (
        currentGuess.length ===
            COLUMN_COUNT &&
        !currentGuess.includes("_")
    ) {

        checkCurrentWordValidity();
    }
}

/* -------------------------REMOVE CHARACTER------------------------- */

function removeLetter() {

    if (
        currentGuess.length === 0
    ) {
        return;
    }

    clearInvalidState();


    currentGuess =
        currentGuess.slice(
            0,
            -1
        );


    updateCurrentRow();


    showMessage("");
}


/* -------------------------PLAYER TILE MARKINGS------------------------- */

board.addEventListener(
    "click",
    (event) => {

        const tile =
            event.target.closest(
                ".tile"
            );


        if (!tile) {
            return;
        }

         /*
            Player annotations are only
            editable while the puzzle
            is still active.
         */

        if (
            gameOver ||
            isAnimating
        ) {
            return;
        }

        /*
            Only completed guesses
            may be annotated.

            The current typing row and
            empty future rows cannot
            be marked.
        */

        if (
            !tile.classList.contains(
                "submitted"
            )
        ) {
            return;
        }


        cycleTileMarking(tile);

        saveCurrentPuzzleState(
            false,
            null
        );
    }
);


/* -------------------------CYCLE TILE MARKING------------------------- */

function cycleTileMarking(
    tile
) {

    const currentMarking =
        tile.dataset.marking || "";


    let nextMarking = "";


    /*
        Blank begins at Red.
    */

    if (
        currentMarking === ""
    ) {

        nextMarking =
            PLAYER_MARKINGS[0];

    } else {

        const currentIndex =
            PLAYER_MARKINGS.indexOf(
                currentMarking
            );


        const nextIndex =
            currentIndex + 1;


        /*
            Blue cycles back to blank.
        */

        if (
            nextIndex <
            PLAYER_MARKINGS.length
        ) {

            nextMarking =
                PLAYER_MARKINGS[
                    nextIndex
                ];
        }
    }


    applyTileMarking(
        tile,
        nextMarking
    );
}


/* -------------------------APPLY TILE MARKING------------------------- */

function applyTileMarking(
    tile,
    marking
) {

    tile.classList.remove(
        "player-red",
        "player-orange",
        "player-yellow",
        "player-green",
        "player-blue"
    );


    if (!marking) {

        delete tile.dataset.marking;

        return;
    }


    tile.dataset.marking =
        marking;


    tile.classList.add(
        `player-${marking}`
    );
}

/* -------------------------CLEAR PLAYER MARKINGS------------------------- */

clearMarkingsButton.addEventListener(
    "click",
    clearPlayerMarkings
);

function clearPlayerMarkings() {

    if (gameOver) {
        return;
    }

    const markedTiles =
        document.querySelectorAll(
            ".tile[data-marking]"
        );


    markedTiles.forEach(
        (tile) => {

            applyTileMarking(
                tile,
                ""
            );
        }
    );

    saveCurrentPuzzleState(
        false,
        null
    );
}


/* -------------------------UPDATE CURRENT ROW------------------------- */

function updateCurrentRow() {

    for (
        let column = 0;
        column < COLUMN_COUNT;
        column++
    ) {

        const tile =
            getTile(
                currentRow,
                column
            );


        if (!tile) {
            continue;
        }


        tile.textContent =
            currentGuess[column] || "";
    }
}

/* -------------------------GET TILE------------------------- */

function getTile(
    row,
    column
) {

    return document.querySelector(
        `.tile[data-row="${row}"][data-column="${column}"]`
    );
}

/* -------------------------WORD VALIDATION------------------------- */

function checkCurrentWordValidity() {

    if (!dictionaryLoaded) {

        return false;
    }


    if (
        VALID_WORDS.has(
            currentGuess
        )
    ) {

        clearInvalidState();

        showMessage("");

        return true;
    }


    markCurrentRowInvalid();


    showMessage(
        "Not a recognized word."
    );


    return false;
}


/* -------------------------INVALID WORD VISUAL------------------------- */

function markCurrentRowInvalid() {

    for (
        let column = 0;
        column < COLUMN_COUNT;
        column++
    ) {

        const tile =
            getTile(
                currentRow,
                column
            );


        if (!tile) {
            continue;
        }


        tile.classList.add(
            "invalid"
        );
    }
}

function clearInvalidState() {

    for (
        let column = 0;
        column < COLUMN_COUNT;
        column++
    ) {

        const tile =
            getTile(
                currentRow,
                column
            );


        if (!tile) {
            continue;
        }


        tile.classList.remove(
            "invalid"
        );
    }
}


/* -------------------------USED KEYBOARD LETTERS------------------------- */

function markKeyboardLettersUsed(
    guess
) {

    const usedLetters =
        new Set(
            guess.split("")
        );


    usedLetters.forEach(
        (letter) => {

            const key =
                document.querySelector(
                    `.key[data-key="${letter}"]`
                );

            if (!key) {
                return;
            }


            key.classList.add(
                "used"
            );
        }
    );
}

/* -------------------------SHOW PUZZLE RESULT------------------------- */

function showPuzzleResult(
    won
) {

    resultPanel.classList.remove(
        "hidden"
    );

    resultPanel.classList.remove(
        "result-win",
        "result-loss"
    );


    resultPanel.classList.add(
        won
            ? "result-win"
            : "result-loss"
    );


    /*
        WIN
    */

    if (won) {

        resultTitle.textContent =
            "Nailed it!";


        resultText.textContent =
            ` ${ANSWER} · ${submittedGuesses.length}/${ROW_COUNT}`;

    } else {

        resultTitle.textContent =
            "Out of guesses";


        resultText.textContent =
            `Answer: ${ANSWER}`;
    }

    /*
        Endless receives a direct
        Next Puzzle action.

        Daily and Archive remain
        completed and locked.
    */

    if (
        gameMode === "endless"
    ) {

        nextPuzzleButton.classList.remove(
            "hidden"
        );

    } else {

        nextPuzzleButton.classList.add(
            "hidden"
        );
    }
}

/* -------------------------PRESENT COMPLETED PUZZLE------------------------- */

async function presentCompletedPuzzle(
    won
) {

    /* -------------------------
       WIN
    ------------------------- */
    if (won) {

        await playRainbowWinAnimation(
            currentRow
        );

        await wait(
            WIN_RESULT_PAUSE
        );

    } else {

        /* -------------------------
           LOSS
        ------------------------- */
        /*
            The normal accepted-guess
            animation already revealed
            the final history row.
        */

        await wait(
            LOSS_RESULT_PAUSE
        );
    }

    /* -------------------------
       SHOW RESULT
    ------------------------- */
    showPuzzleResult(
        won
    );

    /* -------------------------
       DAILY STATS HANDOFF
    ------------------------- */
    if (
        gameMode === "daily"
    ) {

        /*
            Let the result presentation
            sit briefly before Stats
            takes focus.
        */

        await wait(
            DAILY_STATS_POPUP_DELAY
        );

        /*
            Check the mode again.

            If the player somehow switched
            modes during the pause, don't
            unexpectedly open Daily Stats.
        */
        if (
            gameMode === "daily"
        ) {

            openStatsModal();
        }
    }
}

/* -------------------------COMPLETE PUZZLE------------------------- */

function completePuzzle(
    won
) {

    gameOver = true;
    currentGuess = "";

    clearMarkingsButton.disabled =
        true;

    /*
        Daily / Archive save.

        Endless automatically ignores
        persistence inside this function.
    */

    saveCurrentPuzzleState(
        true,
        won
    );


    /* -------------------------
    DAILY STATS
    ------------------------- */

    if (
        gameMode === "daily"
    ) {

        recordDailyResult(
            won,
            submittedGuesses.length
        );
    }


    showMessage("");


    presentCompletedPuzzle(
        won
    );
}

/* -------------------------ANIMATION WAIT------------------------- */

function wait(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}




/* -------------------------UPDATE STATS DISPLAY------------------------- */

function updateStatsDisplay() {

    statPlayed.textContent =
        stats.played;


    const winRate =
        stats.played === 0
            ? 0
            : Math.round(
                (
                    stats.wins /
                    stats.played
                ) * 100
            );


    statWinRate.textContent =
        `${winRate}%`;


    statStreak.textContent =
        stats.currentStreak;


    statMaxStreak.textContent =
        stats.maxStreak;

    updateGuessDistribution();
}

/* -------------------------UPDATE GUESS DISTRIBUTION------------------------- */

function updateGuessDistribution() {

    guessDistribution.innerHTML = "";

    const highestCount =
        Math.max(
            ...stats.guessDistribution,
            1
        );

    stats.guessDistribution.forEach(
        (count, index) => {
            const row =
                document.createElement(
                    "div"
                );

            row.classList.add(
                "guess-bar-row"
            );

            const number =
                document.createElement(
                    "div"
                );

            number.classList.add(
                "guess-number"
            );

            number.textContent =
                index + 1;

            const track =
                document.createElement(
                    "div"
                );

            track.classList.add(
                "guess-bar-track"
            );

            const bar =
                document.createElement(
                    "div"
                );

            bar.classList.add(
                "guess-bar"
            );

            const percentage =
                count === 0
                    ? 0
                    : Math.max(
                        12,
                        (
                            count /
                            highestCount
                        ) * 100
                    );

            bar.style.width =
                `${percentage}%`;

            const countLabel =
                document.createElement(
                    "div"
                );

            countLabel.classList.add(
                "guess-count"
            );

            countLabel.textContent =
                count;

            track.appendChild(
                bar
            );

            row.appendChild(
                number
            );

            row.appendChild(
                track
            );

            row.appendChild(
                countLabel
            );

            guessDistribution.appendChild(
                row
            );
        }
    );
}

/* -------------------------SUBMIT GUESS------------------------- */

async function submitGuess() {

    if (gameOver) {
        return;
    }

    if (!ANSWER) {

    showMessage(
         "Puzzle is still loading."
      );

      return;
   }

    if (!dictionaryLoaded) {

      showMessage(
         "Dictionary is still loading."
      );

      return;
   }

    if (
        currentGuess.length !==
        COLUMN_COUNT
    ) {

        showMessage(
            "Enter a 5-letter word."
        );

        return;
    }

    if (
        currentGuess.includes("_")
    ) {

        showMessage(
            "Complete the word before submitting."
        );

        return;
    }

    if (
      !checkCurrentWordValidity()
   ) {

      return;
   }


   /*
      Save the submitted word before
      currentGuess gets cleared.
   */

   const submittedGuess =
      currentGuess;

   const rainbowResult =
      evaluateRainbowGuess(
         submittedGuess,
         ANSWER
      );


   submittedGuesses.push(
      submittedGuess
   );

   markKeyboardLettersUsed(
      submittedGuess
   );

   markRowSubmitted(
      currentRow
   );

   await animateAcceptedGuess(
        currentRow,
        rainbowResult
    );
    
    /* -------------------------
    WIN BLOCK
    ------------------------- */
    if (
        submittedGuess ===
        ANSWER
    ) {

        completePuzzle(
            true
        );

        return;
    }

   /* -------------------------
      NEXT ROW
   ------------------------- */

   currentRow++;
   currentGuess = "";

    /* -------------------------
    LOSS BLOCK
    ------------------------- */

    if (
        currentRow >=
        ROW_COUNT
    ) {

        completePuzzle(
            false
        );

        return;
    }

    /*
        Save an unfinished Daily
        or Archive puzzle after
        each accepted guess.
    */

    saveCurrentPuzzleState(
        false,
        null
    );

    showMessage("");

}


/* -------------------------MARK SUBMITTED ROW------------------------- */

function markRowSubmitted(
    row
) {

    for (
        let column = 0;
        column < COLUMN_COUNT;
        column++
    ) {

        const tile =
            getTile(
                row,
                column
            );


        if (!tile) {
            continue;
        }


        tile.classList.add(
            "submitted"
        );
    }
}


/* -------------------------RAINBOW FEEDBACK------------------------- */

function evaluateRainbowGuess(
    guess,
    answer
) {

    const result =
        new Array(
            COLUMN_COUNT
        ).fill(false);


    /*
        Each answer position owns
        one permanent Rainbow color.

        We only ask:

        Does the guess contain
        the letter belonging to
        this answer position?

        We DO NOT reveal which
        guessed tile caused the hit.
    */

    for (
        let answerPosition = 0;
        answerPosition < COLUMN_COUNT;
        answerPosition++
    ) {

        const answerLetter =
            answer[
                answerPosition
            ];


        if (
            guess.includes(
                answerLetter
            )
        ) {

            result[
                answerPosition
            ] = true;
        }
    }


    return result;
}


/* -------------------------MESSAGE------------------------- */

function showMessage(text) {

    message.textContent = text;
}

/* -------------------------GAME START------------------------- */

applyTheme(
    currentTheme
);

createBoard();

createRainbowHistory();

updateStatsDisplay();

loadDictionary();










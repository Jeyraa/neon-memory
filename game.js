
// ==========================================
// NEON MEMORY - DIFFICULTY SYSTEM
// ==========================================

// 1. SYMBOL COLLECTION

const allSymbols = [
    "🚀", "🌌", "🤖", "⚡",
    "🪐", "💎", "🛸", "🔮",
    "🌙", "☄️", "👾", "🌍"
];

// 2. DIFFICULTY SETTINGS

const difficulties = {
    easy: {
        pairs: 6,
        preview: 6,
        level: "LEVEL 01",
        description: "BEGINNER"
    },

    medium: {
        pairs: 9,
        preview: 4,
        level: "LEVEL 02",
        description: "INTERMEDIATE"
    },

    hard: {
        pairs: 12,
        preview: 2,
        level: "LEVEL 03",
        description: "EXPERT"
    }
};

let currentDifficulty = "medium";

// 3. HTML ELEMENTS

const gameGrid = document.getElementById("game-grid");
const timeDisplay = document.getElementById("time");
const movesDisplay = document.getElementById("moves");
const scoreDisplay = document.getElementById("score");
const accuracyDisplay = document.getElementById("accuracy");

const gameMessage = document.getElementById("game-message");
const previewText = document.getElementById("preview-text");

const restartButton = document.getElementById("restart-button");
const winModal = document.getElementById("win-modal");
const playAgainButton = document.getElementById("play-again");

const finalTime = document.getElementById("final-time");
const finalMoves = document.getElementById("final-moves");

const levelName = document.getElementById("level-name");
const levelDescription =
    document.getElementById("level-description");

const dataCells =
    document.getElementById("data-cells");

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");

// 4. GAME VARIABLES

let firstCard = null;
let secondCard = null;

let moves = 0;
let matchedPairs = 0;
let seconds = 0;

let timerInterval = null;
let previewInterval = null;
let mismatchTimeout = null;

let lockBoard = true;

// 5. SHUFFLE FUNCTION

function shuffleCards(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
        [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// 6. CREATE CARD

function createCard(symbol) {
    const card = document.createElement("button");

    card.classList.add("card");
    card.type = "button";
    card.dataset.symbol = symbol;

    card.innerHTML = `
        <span class="card-inner">
            <span class="card-face card-front">N</span>

            <span class="card-face card-back">
                ${symbol}
            </span>
        </span>
    `;

    card.addEventListener("click", () => {
        flipCard(card);
    });

    return card;
}

// 7. SELECT DIFFICULTY

function selectDifficulty(level) {

    if (!difficulties[level]) return;

    currentDifficulty = level;

    difficultyButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.level === level
        );
    });

    const settings = difficulties[level];

    levelName.textContent = settings.level;
    levelDescription.textContent = settings.description;
dataCells.textContent =
    `${settings.pairs * 2} DATA CELLS DETECTED`;

    startGame();
}

// 8. START GAME

function startGame() {

    clearInterval(timerInterval);
    clearInterval(previewInterval);
    clearTimeout(mismatchTimeout);

    const settings = difficulties[currentDifficulty];

    const totalPairs = settings.pairs;

    firstCard = null;
    secondCard = null;

    moves = 0;
    matchedPairs = 0;
    seconds = 0;

    lockBoard = true;

    gameGrid.innerHTML = "";

    timeDisplay.textContent = "00:00";
    movesDisplay.textContent = "00";
    scoreDisplay.textContent =
        `00 / ${String(totalPairs).padStart(2, "0")}`;

    accuracyDisplay.textContent = "100%";

    winModal.classList.remove("show");

    gameMessage.textContent =
        "Memorise the symbols before time runs out.";

    // Generate pairs according to difficulty

    const selectedSymbols =
        allSymbols.slice(0, totalPairs);

    const symbols = [
        ...selectedSymbols,
        ...selectedSymbols
    ];

    const shuffledSymbols = shuffleCards(symbols);

    // Generate cards

    shuffledSymbols.forEach(symbol => {
        const card = createCard(symbol);

        card.classList.add("open");

        gameGrid.appendChild(card);
    });

    // Preview countdown

    let countdown = settings.preview;

    previewText.textContent =
        `PREVIEW: ${countdown}s`;

    previewInterval = setInterval(() => {

        countdown--;

        if (countdown > 0) {

            previewText.textContent =
                `PREVIEW: ${countdown}s`;

        } else {

            clearInterval(previewInterval);

            document.querySelectorAll(".card").forEach(card => {
                card.classList.remove("open");
            });

            previewText.textContent = "SYSTEM READY";

            gameMessage.textContent =
                "Find all matching pairs!";

            lockBoard = false;

            startTimer();
        }

    }, 1000);
}

// 9. FLIP CARD

function flipCard(card) {

    if (lockBoard) return;

    if (card.classList.contains("open")) return;

    if (card.classList.contains("matched")) return;

    if (card === firstCard) return;

    card.classList.add("open");

    if (!firstCard) {

        firstCard = card;

        return;
    }

    secondCard = card;

    moves++;

    updateDashboard();

    checkMatch();
}

// 10. CHECK MATCH

function checkMatch() {

    const isMatch =
        firstCard.dataset.symbol ===
        secondCard.dataset.symbol;

    if (isMatch) {

        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        matchedPairs++;

        updateDashboard();

        resetTurn();

        gameMessage.textContent = "MATCH FOUND!";

        const totalPairs =
            difficulties[currentDifficulty].pairs;

        if (matchedPairs === totalPairs) {
            endGame();
        }

    } else {

        lockBoard = true;

        gameMessage.textContent = "NO MATCH. TRY AGAIN!";

        mismatchTimeout = setTimeout(() => {

            firstCard.classList.remove("open");
            secondCard.classList.remove("open");

            resetTurn();

            gameMessage.textContent =
                "Keep searching for matching pairs!";

        }, 900);
    }
}

// 11. RESET TURN

function resetTurn() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;
}

// 12. UPDATE DASHBOARD

function updateDashboard() {

    const totalPairs =
        difficulties[currentDifficulty].pairs;

    movesDisplay.textContent =
        String(moves).padStart(2, "0");

    scoreDisplay.textContent =
        `${String(matchedPairs).padStart(2, "0")} / ${String(totalPairs).padStart(2, "0")}`;

    const accuracy = moves === 0
        ? 100
        : Math.round((matchedPairs / moves) * 100);

    accuracyDisplay.textContent = `${accuracy}%`;
}

// 13. TIMER

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        seconds++;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        timeDisplay.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0");

    }, 1000);
}

// 14. END GAME

function endGame() {

    lockBoard = true;

    clearInterval(timerInterval);

    finalTime.textContent = timeDisplay.textContent;

    finalMoves.textContent =
        String(moves).padStart(2, "0");

    gameMessage.textContent =
        "MISSION ACCOMPLISHED!";

    previewText.textContent =
        "ALL PAIRS RECOVERED";

    setTimeout(() => {
        winModal.classList.add("show");
    }, 600);
}

// 15. BUTTON EVENTS

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectDifficulty(button.dataset.level);

    });

});

restartButton.addEventListener("click", startGame);

playAgainButton.addEventListener("click", startGame);

// 16. INITIALISE

selectDifficulty("medium");

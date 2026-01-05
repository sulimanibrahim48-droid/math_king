document.addEventListener('DOMContentLoaded', () => {
    // Initial load
});

let currentMode = null;

// --- Emojis (Twemoji) ---
const EMOJI_CODES = [
    '1f431', // Cat
    '1f436', // Dog
    '1f981', // Lion
    '1f430', // Rabbit
    '1f43c', // Panda
    '1f427', // Penguin
    '1f984', // Unicorn
    '1f34e', // Apple
    '1f353', // Strawberry
    '1f366', // Ice Cream
    '1f680', // Rocket
    '1f697', // Car
];

function getRandomEmojiUrl() {
    const code = EMOJI_CODES[Math.floor(Math.random() * EMOJI_CODES.length)];
    return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;
}

// --- Utilities ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playSound(type) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance();
        if (type === 'success') {
            const praises = ['Great Job!', 'Awesome!', 'Correct!', 'You are a star!', 'Math King!'];
            msg.text = praises[Math.floor(Math.random() * praises.length)];
            msg.rate = 1.2;
            msg.pitch = 1.2;
        } else {
            msg.text = 'Try again!';
            msg.rate = 1.1;
        }
        window.speechSynthesis.speak(msg);
    } else {
        console.log(`Sound: ${type}`);
    }
}

// --- Navigation ---
function startGame(mode) {
    currentMode = mode;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-board').classList.remove('hidden');

    // Set card border color based on mode
    const card = document.getElementById('active-game-card');
    card.className = `game-card mode-${mode}`;

    // Set Title
    const title = document.getElementById('game-title');
    const titles = {
        'count': 'Counting 123',
        'add': 'Addition (+)',
        'sub': 'Subtraction (-)',
        'mul': 'Multiplication (×)',
        'div': 'Division (÷)'
    };
    title.textContent = titles[mode];

    // Toggle Equals Sign
    const equalsSign = document.querySelector('.equals');
    if (mode === 'count') {
        equalsSign.classList.add('invisible');
    } else {
        equalsSign.classList.remove('invisible');
    }

    initRound();
}

function showMenu() {
    document.getElementById('game-board').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    currentMode = null;
}

// --- Game Logic ---
function initRound() {
    if (!currentMode) return;

    const equationContainer = document.getElementById('equation-display');
    const answerSlot = document.getElementById('answer-slot');
    const optionsArea = document.getElementById('options-area');

    // Reset UI
    equationContainer.innerHTML = '';
    optionsArea.innerHTML = '';
    answerSlot.textContent = '?';
    answerSlot.className = 'answer-slot';

    // Generate Problem
    let problem = generateProblem(currentMode);

    // Render Problem
    renderProblem(problem, equationContainer);

    // Render Options
    renderOptions(problem.answer, optionsArea);
}

function generateProblem(mode) {
    let num1, num2, answer, operator;

    switch (mode) {
        case 'count':
            num1 = getRandomInt(1, 9);
            num2 = 0;
            answer = num1;
            operator = null;
            break;
        case 'add':
            num1 = getRandomInt(1, 5);
            num2 = getRandomInt(1, 5);
            answer = num1 + num2;
            operator = '+';
            break;
        case 'sub':
            num1 = getRandomInt(2, 9);
            num2 = getRandomInt(1, num1); // Ensure valid subtraction (>= 0)
            answer = num1 - num2;
            operator = '-';
            break;
        case 'mul':
            num1 = getRandomInt(1, 4);
            num2 = getRandomInt(1, 3); // Keep totals small for UI (max 12)
            answer = num1 * num2;
            operator = '×';
            break;
        case 'div':
            num2 = getRandomInt(1, 3); // Divisor
            answer = getRandomInt(1, 4); // Quotient
            num1 = answer * num2; // Dividend (so it divides cleanly)
            operator = '÷';
            break;
    }

    return { num1, num2, answer, operator };
}

function renderProblem(problem, container) {
    const { num1, num2, operator } = problem;

    // Pick first image
    let img1 = getRandomEmojiUrl();

    // Pick second image - ensure it is different from img1 if we have an operator (like + or -)
    // For Division, it usually makes sense to divide "Apples" into groups of "Apples", so we keep them same or handled differently.
    // For Add/Sub/Mul, we want distinct groups (e.g. 2 Cats + 3 Dogs).
    let img2 = img1;

    // Group 1
    const group1 = document.createElement('div');
    group1.className = 'group-container';
    for (let i = 0; i < num1; i++) {
        const img = document.createElement('img');
        img.src = img1;
        img.className = 'item-img';
        img.style.animationDelay = `${i * 0.1}s`;
        group1.appendChild(img);
    }
    container.appendChild(group1);

    // Operator & Group 2 (If not counting)
    if (operator) {
        const opSpan = document.createElement('span');
        opSpan.className = 'operator-sign';
        opSpan.textContent = operator;
        container.appendChild(opSpan);

        const group2 = document.createElement('div');
        group2.className = 'group-container variant-group';
        for (let i = 0; i < num2; i++) {
            const img = document.createElement('img');
            img.src = img2;
            img.className = 'item-img';
            img.style.animationDelay = `${(i + num1) * 0.1}s`;
            group2.appendChild(img);
        }
        container.appendChild(group2);
    }
}

function renderOptions(correctAnswer, container) {
    const options = new Set([correctAnswer]);
    while (options.size < 3) {
        let wrong = getRandomInt(0, correctAnswer + 5);
        if (wrong !== correctAnswer) options.add(wrong);
    }

    // Convert to array and shuffle
    const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);

    optionsArray.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = num;
        btn.onclick = () => checkAnswer(num, correctAnswer);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, actual) {
    const slot = document.getElementById('answer-slot');
    if (selected === actual) {
        slot.textContent = selected;
        slot.classList.add('correct');
        playSound('success');
        setTimeout(initRound, 1500);
    } else {
        slot.textContent = '?';
        slot.classList.add('incorrect');
        playSound('error');
        setTimeout(() => slot.classList.remove('incorrect'), 500);
    }
}

// i pull my live discord avatar + decoration through lanyard
// https://github.com/Phineas/lanyard
(async () => {
    try {
        const res = await fetch('https://api.lanyard.rest/v1/users/732621010074861588');
        const { data } = await res.json();
        const user = data.discord_user;
        const avatarExt = user.avatar && user.avatar.startsWith('a_') ? 'gif' : 'png';
        document.getElementById('discordAvatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=128`;

        if (user.avatar_decoration_data) {
            const decoImg = document.getElementById('discordDecoration');
            decoImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=160`;
            decoImg.style.display = 'block';
        }
    } catch (e) {
        console.error('lanyard fetch failed', e);
    }
})();

const searchInput = document.getElementById('searchInput');
const projectCards = document.querySelectorAll('#projectsContainer .card');
const noResults = document.getElementById('noResults');
const sortToggle = document.getElementById('sortToggle');
const projectsContainer = document.getElementById('projectsContainer');

const sortIcons = {
    alpha: '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M16 8h4l-4 8h4" /><path d="M4 16v-6a2 2 0 1 1 4 0v6" /><path d="M4 13h4" /><path d="M11 12h2" />',
    newest: '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l9 0" /><path d="M4 12l7 0" /><path d="M4 18l7 0" /><path d="M15 15l3 3l3 -3" /><path d="M18 6l0 12" />',
    oldest: '<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l7 0" /><path d="M4 12l7 0" /><path d="M4 18l9 0" /><path d="M15 9l3 -3l3 3" /><path d="M18 6l0 12" />'
};
const sortOrder = ['alpha', 'newest', 'oldest'];
let sortMode = 'oldest';

// i tried sorting with css order once but it glitched the rendering, so i just move the cards around
function sortProjectCards(mode) {
    const cards = Array.from(projectsContainer.querySelectorAll('.card'));
    cards.sort((a, b) => {
        if (mode === 'alpha') {
            const titleA = a.querySelector('.card-title').textContent.trim().toLowerCase();
            const titleB = b.querySelector('.card-title').textContent.trim().toLowerCase();
            return titleA.localeCompare(titleB);
        }
        const dateA = a.dataset.date;
        const dateB = b.dataset.date;
        return mode === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });
    cards.forEach(card => projectsContainer.appendChild(card));
}

function applySortMode(mode) {
    sortMode = mode;
    sortToggle.querySelector('svg').innerHTML = sortIcons[mode];
    sortProjectCards(mode);
}

if (sortToggle) {
    sortToggle.addEventListener('click', () => {
        const nextIndex = (sortOrder.indexOf(sortMode) + 1) % sortOrder.length;
        applySortMode(sortOrder[nextIndex]);
    });
    applySortMode('oldest');
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    projectCards.forEach(card => {
        const title = card.querySelector('.card-title')?.textContent || '';
        const description = card.querySelector('.card-description')?.textContent || '';
        const searchData = (title + ' ' + description).toLowerCase();
        const matches = searchData.includes(searchTerm);
        card.style.display = matches ? 'block' : 'none';
        if (matches) visibleCount++;
    });

    noResults.classList.toggle('show', visibleCount === 0 && searchTerm !== '');
});

const oshawottTrigger = document.querySelector('.oshawott-container');
const particlesLayer = document.getElementById('oshawottParticles');
let oshawottsActive = false;

function spawnOshawotts(count = 35) {
    particlesLayer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.src = 'assets/oshawott.webp';
        img.className = 'oshawott-particle';
        const size = 16 + Math.random() * 28;
        const left = Math.random() * 100;
        const duration = 20 + Math.random() * 25;
        const delay = -Math.random() * duration;
        const drift = (Math.random() * 120 - 60).toFixed(0) + 'px';
        const spin = (Math.random() * 40 - 20).toFixed(0) + 'deg';
        const opacity = (0.35 + Math.random() * 0.35).toFixed(2);
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.left = left + 'vw';
        img.style.animationDuration = duration + 's';
        img.style.animationDelay = delay + 's';
        img.style.setProperty('--drift', drift);
        img.style.setProperty('--spin', spin);
        img.style.setProperty('--particle-opacity', opacity);
        particlesLayer.appendChild(img);
    }
}

if (oshawottTrigger && particlesLayer) {
    oshawottTrigger.addEventListener('click', () => {
        oshawottsActive = !oshawottsActive;
        if (oshawottsActive) {
            spawnOshawotts();
            requestAnimationFrame(() => particlesLayer.classList.add('active'));
        } else {
            particlesLayer.classList.remove('active');
            setTimeout(() => {
                if (!oshawottsActive) particlesLayer.innerHTML = '';
            }, 350);
        }
    });
}

const typewriterTexts = [
    "I like building lightweight, privacy-friendly software, and pretty much everything I do ends up open-source on GitHub.",
    "No clutter, no bullshit, just software that respects your privacy and genuinely feels great to use.",
    "The easiest way to get in touch with me is Signal, Twitter is mostly just where I lurk and occasionally shitpost."
];

const typewriterEl = document.getElementById('typewriterText');

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let textQueue = [];

// every text shows once before any repeats, and the swap stops the same one showing twice when a new round starts
function drawNextTextIndex(lastIndex) {
    if (textQueue.length === 0) {
        textQueue = shuffleArray(typewriterTexts.map((_, i) => i));
        if (typeof lastIndex === 'number' && textQueue.length > 1 && textQueue[0] === lastIndex) {
            [textQueue[0], textQueue[1]] = [textQueue[1], textQueue[0]];
        }
    }
    return textQueue.shift();
}

if (typewriterEl) {
    let textIndex = drawNextTextIndex();
    let charIndex = 0;
    let isDeleting = false;

    function typewriterLoop() {
        const currentText = typewriterTexts[textIndex];

        if (!isDeleting) {
            charIndex++;
            typewriterEl.textContent = currentText.slice(0, charIndex);

            if (charIndex === currentText.length) {
                setTimeout(() => {
                    isDeleting = true;
                    typewriterLoop();
                }, 12000);
                return;
            }
            setTimeout(typewriterLoop, 35);
        } else {
            charIndex--;
            typewriterEl.textContent = currentText.slice(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                textIndex = drawNextTextIndex(textIndex);
                setTimeout(typewriterLoop, 400);
                return;
            }
            setTimeout(typewriterLoop, 20);
        }
    }

    typewriterLoop();
}

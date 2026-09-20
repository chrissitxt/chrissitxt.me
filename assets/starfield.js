(function () {
    const layer = document.getElementById('starfield');
    if (!layer) return;

    const count = 40;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const size = 1 + Math.random() * 2.5;
        const driftDuration = 40 + Math.random() * 40;
        const twinkleDuration = 3 + Math.random() * 4;

        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.setProperty('--drift-x', (Math.random() * 50 - 25).toFixed(1) + 'vw');
        star.style.setProperty('--drift-y', (Math.random() * 50 - 25).toFixed(1) + 'vh');
        star.style.setProperty('--star-min', (0.05 + Math.random() * 0.1).toFixed(2));
        star.style.setProperty('--star-max', (0.25 + Math.random() * 0.35).toFixed(2));
        star.style.animationDuration = `${driftDuration.toFixed(1)}s, ${twinkleDuration.toFixed(1)}s`;
        star.style.animationDelay = `${(Math.random() * -driftDuration).toFixed(1)}s, ${(Math.random() * -twinkleDuration).toFixed(1)}s`;

        layer.appendChild(star);
    }
})();

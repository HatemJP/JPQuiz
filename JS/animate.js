window.addEventListener("DOMContentLoaded", () => {
  const snowContainer = document.querySelector(".snow-animation");
  const sakuraContainer = document.querySelector(".sakura-animation");
  if (!snowContainer || !sakuraContainer) return;

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const quizContainer = document.querySelector(".container");
  if (!quizContainer) return;
  let quizRect = quizContainer.getBoundingClientRect();

  const zonePadding = 20;
  const containerBuffer = 30;

  const leftZone = {
    startX: zonePadding,
    endX: quizRect.left - containerBuffer,
  };
  const rightZone = {
    startX: quizRect.right + containerBuffer,
    endX: vw - zonePadding,
  };

  const totalPairs = 32;
  const snowPairs = [];
  const sakuraParticles = [];

  const randomRange = (min, max) => Math.random() * (max - min) + min;

  function createSnowParticle(size, x, y) {
    const particle = document.createElement("div");
    particle.classList.add("snow-particle");
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.opacity = 0;
    particle.dataset.x = x;
    particle.dataset.y = y;
    return particle;
  }

  function spawnSnowPairs() {
    const maxDelay = 1800;
    const leftWidth = leftZone.endX - leftZone.startX;
    const rightWidth = rightZone.endX - rightZone.startX;

    for (let i = 0; i < totalPairs; i++) {
      const delay = (i / totalPairs) * maxDelay;
      const size = randomRange(5, 8);
      const speed = randomRange(0.2, 0.45);
      const swayAmplitude = randomRange(6, 14);
      const swayFrequency = randomRange(0.0015, 0.003);
      const swayPhase = Math.random() * Math.PI * 2;
      const initialY = randomRange(-vh * 0.7, 0);

      // Even horizontal spacing with NO jitter
      const leftX = leftZone.startX + (leftWidth * i) / totalPairs;
      const rightX = rightZone.startX + (rightWidth * i) / totalPairs;

      const leftParticle = createSnowParticle(size, leftX, initialY);
      const rightParticle = createSnowParticle(size, rightX, initialY);

      [leftParticle, rightParticle].forEach((el) => {
        el.dataset.speed = speed;
        el.dataset.swayAmplitude = swayAmplitude;
        el.dataset.swayFrequency = swayFrequency;
        el.dataset.swayPhase = swayPhase;
      });

      snowContainer.appendChild(leftParticle);
      snowContainer.appendChild(rightParticle);
      snowPairs.push({ leftEl: leftParticle, rightEl: rightParticle });

      setTimeout(() => {
        leftParticle.style.opacity = 0.85;
        rightParticle.style.opacity = 0.85;
      }, delay);
    }
  }

  let snowAnimationRunning = false;
  function animateSnow() {
    if (!snowAnimationRunning) return;
    snowPairs.forEach((pair) => {
      animateSnowParticle(pair.leftEl, leftZone);
      animateSnowParticle(pair.rightEl, rightZone);
    });
    requestAnimationFrame(animateSnow);
  }

  function animateSnowParticle(el, zone) {
    let y = parseFloat(el.dataset.y);
    const speed = parseFloat(el.dataset.speed);
    const swayAmp = parseFloat(el.dataset.swayAmplitude);
    const swayFreq = parseFloat(el.dataset.swayFrequency);
    let swayPhase = parseFloat(el.dataset.swayPhase);

    y += speed;
    swayPhase += swayFreq;
    const swayX = swayAmp * Math.sin(swayPhase);

    el.style.transform = `translateX(${swayX}px)`;
    el.style.top = `${y}px`;

    el.dataset.y = y;
    el.dataset.swayPhase = swayPhase;

    const fadeStart = vh * 0.75;
    const fadeEnd = vh * 0.85;
    if (y > fadeStart) {
      let opacity = 1 - (y - fadeStart) / (fadeEnd - fadeStart);
      el.style.opacity = Math.max(opacity, 0);
    } else {
      el.style.opacity = 0.85;
    }

    if (y > vh) {
      const newX = randomRange(zone.startX, zone.endX);
      const newY = randomRange(-vh * 0.25, 0);
      el.dataset.x = newX;
      el.dataset.y = newY;
      el.dataset.swayPhase = Math.random() * Math.PI * 2;
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.opacity = 0.85;
    }
  }

  // Sakura functions unchanged
  function createSakuraParticle(zone, delay = 0) {
    const petal = document.createElement("div");
    petal.classList.add("sakura-petal");

    const width = randomRange(6, 9);
    const height = width * 1.8;
    petal.style.width = `${width}px`;
    petal.style.height = `${height}px`;

    petal.innerHTML = `
      <svg viewBox="0 0 24 32" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="petalGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#F9C5D1"/>
            <stop offset="100%" stop-color="#FBC2EB"/>
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#EAA7B3" flood-opacity="0.5"/>
          </filter>
        </defs>
        <path filter="url(#shadow)" fill="url(#petalGradient)" stroke="#F9A3B7" stroke-width="0.7"
          d="M12 2 C7 7, 6 16, 12 30 C18 16, 17 7, 12 2 Z" />
      </svg>`;

    const x = randomRange(zone.startX, zone.endX);
    const y = randomRange(-vh, 0);

    petal.dataset.x = x;
    petal.dataset.y = y;
    petal.dataset.speed = randomRange(0.25, 0.45);
    petal.dataset.swayAmplitude = randomRange(6, 12);
    petal.dataset.swayFrequency = randomRange(0.0015, 0.0035);
    petal.dataset.swayPhase = Math.random() * Math.PI * 2;
    petal.dataset.windOffset = 0;
    petal.dataset.windSpeed = randomRange(0.0007, 0.0015);
    petal.dataset.rotation = randomRange(-10, 10);
    petal.dataset.rotationSpeed = randomRange(0.05, 0.15);
    petal.dataset.rotationDirection = Math.random() < 0.5 ? 1 : -1;

    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.opacity = 0;

    sakuraContainer.appendChild(petal);
    sakuraParticles.push({ el: petal, zone });

    setTimeout(() => {
      petal.style.opacity = 0.85;
    }, delay);
  }

  function spawnSakuraParticles() {
    const waveCount = 5;
    const totalSakura = 60;
    const particlesPerWave = totalSakura / (waveCount * 2);
    const waveInterval = 300;

    for (let w = 0; w < waveCount; w++) {
      const delay = w * waveInterval;
      const leftStart =
        leftZone.startX + ((leftZone.endX - leftZone.startX) / waveCount) * w;
      const leftEnd = leftStart + (leftZone.endX - leftZone.startX) / waveCount;
      const rightEnd =
        rightZone.endX - ((rightZone.endX - rightZone.startX) / waveCount) * w;
      const rightStart =
        rightEnd - (rightZone.endX - rightZone.startX) / waveCount;
      const tempLeftZone = { startX: leftStart, endX: leftEnd };
      const tempRightZone = { startX: rightStart, endX: rightEnd };

      for (let i = 0; i < particlesPerWave; i++) {
        createSakuraParticle(tempLeftZone, delay);
        createSakuraParticle(tempRightZone, delay);
      }
    }
  }

  let sakuraAnimationRunning = false;
  function animateSakura() {
    if (!sakuraAnimationRunning) return;
    sakuraParticles.forEach((p) => {
      const el = p.el;
      let y = parseFloat(el.dataset.y);
      const speed = parseFloat(el.dataset.speed);
      const swayAmp = parseFloat(el.dataset.swayAmplitude);
      const swayFreq = parseFloat(el.dataset.swayFrequency);
      let swayPhase = parseFloat(el.dataset.swayPhase);
      let windOffset = parseFloat(el.dataset.windOffset);
      const windSpeed = parseFloat(el.dataset.windSpeed);
      let rotation = parseFloat(el.dataset.rotation);
      const rotationSpeed = parseFloat(el.dataset.rotationSpeed);
      const rotationDirection = parseFloat(el.dataset.rotationDirection);

      windOffset += windSpeed;
      swayPhase += swayFreq;
      rotation += rotationSpeed * rotationDirection;

      const swayX = swayAmp * Math.sin(swayPhase);
      const windX = 8 * Math.sin(windOffset + swayPhase * 0.5);
      const totalX = swayX + windX;

      y += speed;

      el.style.transform = `translateX(${totalX}px) rotate(${rotation}deg)`;
      el.style.top = `${y}px`;

      el.dataset.y = y;
      el.dataset.swayPhase = swayPhase;
      el.dataset.windOffset = windOffset;
      el.dataset.rotation = rotation;

      const fadeStart = vh * 0.9;
      if (y > fadeStart) {
        const opacity = 1 - (y - fadeStart) / (vh * 0.1);
        el.style.opacity = Math.max(opacity, 0.2);
      }

      if (y > vh) {
        const newX = randomRange(p.zone.startX, p.zone.endX);
        const newY = randomRange(-vh * 0.25, 0);
        el.dataset.x = newX;
        el.dataset.y = newY;
        el.dataset.swayPhase = Math.random() * Math.PI * 2;
        el.dataset.windOffset = 0;
        el.dataset.rotation = randomRange(-10, 10);
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.opacity = 0.85;
      }
    });

    requestAnimationFrame(animateSakura);
  }

  // === Controls ===
  function startSnow() {
    if (snowAnimationRunning) return;
    snowAnimationRunning = true;
    snowContainer.style.display = "block";
    sakuraContainer.style.display = "none";
    animateSnow();
  }

  function stopSnow() {
    snowAnimationRunning = false;
    snowContainer.style.display = "none";
  }

  function startSakura() {
    if (sakuraAnimationRunning) return;
    sakuraAnimationRunning = true;
    sakuraContainer.style.display = "block";
    snowContainer.style.display = "none";
    animateSakura();
  }

  function stopSakura() {
    sakuraAnimationRunning = false;
    sakuraContainer.style.display = "none";
  }

  spawnSnowPairs();
  spawnSakuraParticles();
  stopSnow();
  stopSakura();

  window.addEventListener("resize", () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    quizRect = quizContainer.getBoundingClientRect();
    leftZone.endX = quizRect.left - containerBuffer;
    rightZone.startX = quizRect.right + containerBuffer;
  });

  window.startSnow = startSnow;
  window.stopSnow = stopSnow;
  window.startSakura = startSakura;
  window.stopSakura = stopSakura;
});
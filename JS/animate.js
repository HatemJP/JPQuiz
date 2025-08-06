window.addEventListener("DOMContentLoaded", () => {
  const snowContainer = document.querySelector(".snow-animation");
  const quizContainer = document.querySelector(".container");
  if (!snowContainer || !quizContainer) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const quizRect = quizContainer.getBoundingClientRect();

  const gap = 50;
  const zonePadding = 30;
  const particlesPerSide = 80;
  const particles = [];

  const leftZone = {
    startX: zonePadding,
    endX: quizRect.left - gap,
  };

  const rightZone = {
    startX: quizRect.right + gap,
    endX: vw - zonePadding,
  };

  const randomRange = (min, max) => Math.random() * (max - min) + min;

  function createParticle(zone) {
    const particle = document.createElement("div");
    particle.classList.add("snow-particle");

    const size = randomRange(4, 7);
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    const x = randomRange(zone.startX, zone.endX);
    const y = randomRange(-vh, 0);

    particle.dataset.x = x;
    particle.dataset.y = y;
    particle.dataset.speed = randomRange(0.2, 0.45); // slower fall
    particle.dataset.swayAmplitude = randomRange(6, 12); // gentler sway
    particle.dataset.swayFrequency = randomRange(0.002, 0.004); // smoother
    particle.dataset.swayPhase = Math.random() * Math.PI * 2;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.opacity = 0.85;

    snowContainer.appendChild(particle);
    particles.push({ el: particle, zone });
  }

  for (let i = 0; i < particlesPerSide; i++) {
    createParticle(leftZone);
    createParticle(rightZone);
  }

  function animate() {
    particles.forEach((p) => {
      const el = p.el;
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

      const fadeStart = vh * 0.85;
      if (y > fadeStart) {
        const opacity = 1 - (y - fadeStart) / (vh * 0.15);
        el.style.opacity = Math.max(opacity, 0.3);
      } else {
        el.style.opacity = 0.85;
      }

      if (y > vh) {
        const newX = randomRange(p.zone.startX, p.zone.endX);
        const newY = randomRange(-vh, 0);
        el.dataset.x = newX;
        el.dataset.y = newY;
        el.dataset.swayPhase = Math.random() * Math.PI * 2;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.opacity = 0.85;
      }
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    const newQuizRect = quizContainer.getBoundingClientRect();
    leftZone.endX = newQuizRect.left - gap;
    rightZone.startX = newQuizRect.right + gap;
  });
});

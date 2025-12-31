/* =====================================================
   SCREEN SWITCH HELPER
===================================================== */
function goToScreen(num) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  const screen = document.getElementById(`screen${num}`);
  if (screen) screen.classList.add("active");
}

/* =====================================================
   SCREEN 1 – HEART HOLD LOADER
===================================================== */
const heart = document.getElementById("heart");
const circle = document.querySelector(".progress-ring__circle");

let progress = 0;
let holdTimer = null;
const circumference = 440;

function setProgress(p) {
  if (!circle) return;
  circle.style.strokeDashoffset =
    circumference - (p / 100) * circumference;
}

function startHold() {
  if (holdTimer) return;

  holdTimer = setInterval(() => {
    progress++;
    setProgress(progress);

    if (progress >= 100) {
      clearInterval(holdTimer);
      holdTimer = null;
      goToScreen(2);
    }
  }, 25);
}

function resetHold() {
  clearInterval(holdTimer);
  holdTimer = null;
  progress = 0;
  setProgress(0);
}

if (heart) {
  heart.addEventListener("mousedown", startHold);
  heart.addEventListener("mouseup", resetHold);
  heart.addEventListener("mouseleave", resetHold);
  heart.addEventListener("touchstart", startHold);
  heart.addEventListener("touchend", resetHold);
}

/* =====================================================
   SCREEN 2 – DRAG CARDS → GIFT REVEAL
===================================================== */
const cards = document.querySelectorAll(".card-item");
const gift = document.querySelector(".gift");

let removedCards = 0;
const totalCards = cards.length;

if (gift) {
  gift.style.opacity = "0";
  gift.style.pointerEvents = "none";
}

cards.forEach(card => {
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let dragging = false;

  const start = e => {
    dragging = true;
    card.style.transition = "none";
    startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  };

  const move = e => {
    if (!dragging) return;
    const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const y = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

    currentX = x - startX;
    currentY = y - startY;

    card.style.transform =
      `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.05}deg)`;
  };

  const end = () => {
    if (!dragging) return;
    dragging = false;

    const absX = Math.abs(currentX);
    const absY = Math.abs(currentY);
    let exitX = 0, exitY = 0;

    if (absX > absY) exitX = currentX > 0 ? 500 : -500;
    else exitY = currentY > 0 ? 500 : -500;

    card.style.transition = "transform 0.45s ease, opacity 0.45s ease";
    card.style.transform = `translate(${exitX}px, ${exitY}px)`;
    card.style.opacity = "0";

    setTimeout(() => {
      card.remove();
      removedCards++;

      if (gift) {
        gift.style.opacity = removedCards / totalCards;
        if (removedCards === totalCards) unlockGift();
      }
    }, 450);
  };

  card.addEventListener("mousedown", start);
  card.addEventListener("touchstart", start);
  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move);
  document.addEventListener("mouseup", end);
  document.addEventListener("touchend", end);
});

function unlockGift() {
  if (!gift) return;
  gift.style.opacity = "1";
  gift.style.pointerEvents = "auto";
  gift.style.transform = "translate(-50%, -50%) scale(1.05)";
}

/* =====================================================
   GIFT HOVER + CLICK → SCREEN 3
===================================================== */
if (gift) {
  gift.addEventListener("mousemove", e => {
    const r = gift.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;

    gift.style.transform =
      `translate(-50%, -50%) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale(1.08)`;
  });

  gift.addEventListener("mouseleave", () => {
    gift.style.transform = "translate(-50%, -50%) scale(1)";
  });

 gift.addEventListener("click", () => {
  startConfettiFromGift();

  setTimeout(() => {
    goToScreen(3);
  }, 800);
});

}

/* =====================================================
   CONFETTI
===================================================== */
function startConfettiFromGift() {
  if (!gift) return;

  const rect = gift.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 90; i++) {
    const c = document.createElement("span");

    const angle = Math.random() * Math.PI * 2;
    const velocity = 6 + Math.random() * 6;

    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    c.style.position = "fixed";
    c.style.left = originX + "px";
    c.style.top = originY + "px";
    c.style.width = "6px";
    c.style.height = "10px";
    c.style.background =
      ["#e6c36a", "#ff7abf", "#8fd3ff"][Math.floor(Math.random() * 3)];
    c.style.borderRadius = "2px";
    c.style.pointerEvents = "none";
    c.style.zIndex = "9999";

    document.body.appendChild(c);

    let x = 0;
    let y = 0;
    let gravity = 0.35;

    const anim = setInterval(() => {
      x += vx;
      y += vy + gravity;
      gravity += 0.15;

      c.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;

      if (y > window.innerHeight) {
        clearInterval(anim);
        c.remove();
      }
    }, 16);
  }
}


/* =====================================================
   SCREEN 3 → PHOTO ALBUM
===================================================== */
const claimBtn = document.querySelector(".claim");
if (claimBtn) {
  claimBtn.addEventListener("click", () => goToScreen(4));
}

/* =====================================================
   SCREEN 4 – PHOTO STACK
===================================================== */
const photoStack = document.getElementById("photoStack");
const photos = Array.from(document.querySelectorAll(".photo"));
let photoIndex = 0;

function updateAlbum() {
  photos.forEach((p, i) => {
    p.classList.remove("active", "next", "next2");
    if (i === photoIndex) p.classList.add("active");
    else if (i === photoIndex + 1) p.classList.add("next");
    else if (i === photoIndex + 2) p.classList.add("next2");
  });
}

if (photos.length) updateAlbum();

if (photoStack) {
  photoStack.addEventListener("click", () => {
    const active = photos[photoIndex];
    if (!active) return;

    
    active.style.transform = "translateX(420px) rotate(18deg)";
    active.style.opacity = "0";

    setTimeout(() => {
      photoIndex++;
      if (photoIndex >= photos.length) {
        goToScreen(5);
        return;
      }
      active.style.transition = "";
      active.style.transform = "";
      active.style.opacity = "";
      updateAlbum();
    }, 450);
  });
}



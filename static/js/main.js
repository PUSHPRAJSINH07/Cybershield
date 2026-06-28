// ── Mobile Nav Toggle ───────────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
// ── Tools Dropdown Click Toggle ──────────────────────────────────────────────
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu   = document.querySelector('.dropdown-menu');

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
  });

  // Close when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (!dropdownToggle.contains(e.target)) {
      dropdownMenu.classList.remove('open');
    }
  });

  // Close when a tool is selected
  dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
    });
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ── Scroll-based navbar shadow ──────────────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
}, { passive: true });
// ── Dark Mode Toggle ─────────────────────────────────────────────────────────
const darkToggle = document.getElementById('darkToggle');
const darkIcon   = document.querySelector('.dark-icon');

// Load saved preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  darkIcon.textContent = '☀️';
}

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkIcon.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
// ── 1. Typewriter Effect on Hero Headline ──────────────────────────────────
const heroHeadline = document.querySelector('.hero-headline');
if (heroHeadline) {
  const lines = ['Detect Scams.', 'Block Phishing.', 'Stay Protected.'];
  heroHeadline.innerHTML = '';
  let lineIndex = 0;
  let charIndex = 0;
  let currentLine = document.createElement('div');
  heroHeadline.appendChild(currentLine);

  function typeLine() {
    if (lineIndex >= lines.length) return;

    if (charIndex < lines[lineIndex].length) {
      currentLine.textContent += lines[lineIndex][charIndex];
      charIndex++;
      setTimeout(typeLine, 60);
    } else {
      lineIndex++;
      charIndex = 0;
      if (lineIndex < lines.length) {
        currentLine = document.createElement('div');
        if (lineIndex === 2) currentLine.className = 'hero-accent';
        heroHeadline.appendChild(currentLine);
        setTimeout(typeLine, 300);
      }
    }
  }
  setTimeout(typeLine, 400);
}

// ── 2. Scroll Fade In for Cards ────────────────────────────────────────────
const fadeEls = document.querySelectorAll(
  '.tool-card, .hiw-card, .stat-box, .report-card, .awareness-card, .info-card, .threat-card'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 120);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

fadeEls.forEach(el => observer.observe(el));

// ── 3. Count Up Animation for Stats ───────────────────────────────────────
function countUp(el, target, suffix, duration) {
  let start = 0;
  const isDecimal = target % 1 !== 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = (isDecimal ? start.toFixed(1) : Math.floor(start))  + suffix;
  }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const raw = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (raw) countUp(el, parseFloat(raw), suffix, 1800);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-big[data-count]').forEach(el => {
  statObserver.observe(el);
});

// ── 4. Navbar hide on scroll down, show on scroll up ──────────────────────
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > lastScroll && current > 100) {
    navbar?.classList.add('nav-hidden');
  } else {
    navbar?.classList.remove('nav-hidden');
  }
  lastScroll = current;
}, { passive: true });



/* ===========================================
   PROFILE JAVASCRIPT
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       Typing Animation
    ========================== */

    const roles = [
        "Cybersecurity Enthusiast",
        "Frontend Developer",
        "Python Developer",
        "Future Ethical Hacker",
        "Flask Developer",
        "IT Student"
    ];

    const typingText = document.querySelector(".typing-text");

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {

        const currentRole = roles[roleIndex];

        if (!deleting) {

            typingText.textContent =
                currentRole.substring(0, charIndex++);

            if (charIndex > currentRole.length) {

                deleting = true;

                setTimeout(typeEffect, 1700);

                return;

            }

        } else {

            typingText.textContent =
                currentRole.substring(0, charIndex--);

            if (charIndex < 0) {

                deleting = false;

                roleIndex++;

                if (roleIndex >= roles.length) {

                    roleIndex = 0;

                }

            }

        }

        setTimeout(typeEffect, deleting ? 45 : 95);

    }

    typeEffect();


    /* ==========================
       Counter Animation
    ========================== */

    const counters = document.querySelectorAll(".stat-card h2");

    const speed = 40;

    function animateCounter(counter) {

        const text = counter.innerText;

        const number = parseInt(text);

        let count = 0;

        const update = () => {

            count += Math.ceil(number / speed);

            if (count >= number) {

                counter.innerText = text;

            }

            else {

                counter.innerText =
                    count + text.replace(number, "");

                requestAnimationFrame(update);

            }

        }

        update();

    }

    const counterObserver = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                animateCounter(
                    entry.target
                );

                counterObserver.unobserve(entry.target);

            }

        });

    });

    counters.forEach(counter => {

        counterObserver.observe(counter);

    });



    /* ==========================
       Scroll Reveal
    ========================== */

    const reveals = document.querySelectorAll(

        ".timeline-item,.contact-card,.skills-grid span,.stat-card"

    );

    function revealAnimation() {

        const trigger = window.innerHeight - 120;

        reveals.forEach(item => {

            const top = item.getBoundingClientRect().top;

            if (top < trigger) {

                item.style.opacity = "1";

                item.style.transform =
                    "translateY(0)";

            }

        });

    }

    window.addEventListener(

        "scroll",

        revealAnimation

    );

    revealAnimation();



    /* ==========================
       Floating Profile Image
    ========================== */

    const profileImage = document.querySelector(

        ".profile-image-box"

    );

    let float = 0;

    function floatingImage() {

        float += 0.03;

        profileImage.style.transform =

            `translateY(${Math.sin(float)*10}px)`;

        requestAnimationFrame(

            floatingImage

        );

    }

    floatingImage();



    /* ==========================
       Mouse Tilt Effect
    ========================== */

    profileImage.addEventListener(

        "mousemove",

        e => {

            const rect = profileImage.getBoundingClientRect();

            const x =

                e.clientX - rect.left;

            const y =

                e.clientY - rect.top;

            const rotateY =

                ((x / rect.width) - .5) * 18;

            const rotateX =

                ((y / rect.height) - .5) * -18;

            profileImage.style.transform =

                `perspective(900px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.05)`;

        }

    );

    profileImage.addEventListener(

        "mouseleave",

        () => {

            profileImage.style.transform =

                "perspective(900px) rotateX(0) rotateY(0)";

        }

    );



    /* ==========================
       Button Ripple
    ========================== */

    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(btn => {

        btn.addEventListener(

            "click",

            function(e){

                const ripple =

                    document.createElement("span");

                ripple.classList.add(

                    "ripple"

                );

                const x =

                    e.clientX -

                    btn.offsetLeft;

                const y =

                    e.clientY -

                    btn.offsetTop;

                ripple.style.left =

                    x + "px";

                ripple.style.top =

                    y + "px";

                btn.appendChild(

                    ripple

                );

                setTimeout(()=>{

                    ripple.remove();

                },600);

            }

        );

    });



    /* ==========================
       Social Hover Bounce
    ========================== */

    document.querySelectorAll(

        ".social-links a"

    ).forEach(icon=>{

        icon.addEventListener(

            "mouseenter",

            ()=>{

                icon.animate([

                    {

                        transform:

                        "translateY(0)"

                    },

                    {

                        transform:

                        "translateY(-12px)"

                    },

                    {

                        transform:

                        "translateY(0)"

                    }

                ],{

                    duration:500

                });

            }

        );

    });



    /* ==========================
       Smooth Scroll
    ========================== */

    document.querySelectorAll(

        'a[href^="#"]'

    ).forEach(anchor=>{

        anchor.addEventListener(

            "click",

            function(e){

                e.preventDefault();

                const target=

                document.querySelector(

                    this.getAttribute("href")

                );

                if(target){

                    target.scrollIntoView({

                        behavior:"smooth"

                    });

                }

            }

        );

    });

});


(function () {
  const nameEl = document.getElementById('typewriter-name');
  const roleEl = document.getElementById('role-text');

  const fullName = 'Pushprajsinh\nUpendrasinh Rathod';
  const roles = [
    'Cybersecurity Enthusiast',
    'Web Developer (Flask & JS)',
    'GTU Diploma IT · 5th Semester',
    'Ethical Hacking Learner',
    'Python Developer',
    'Future Penetration Tester',
  ];

  let charIndex = 0, roleIndex = 0, deleting = false;

  function renderName(text) {
    nameEl.innerHTML = text.split('\n').join('<br>') + '<span class="tw-cursor"></span>';
  }

  function typeName() {
    charIndex++;  // increment FIRST so we never render empty string with cursor
    renderName(fullName.slice(0, charIndex));
    if (charIndex < fullName.length) {
      setTimeout(typeName, 55);
    } else {
      nameEl.innerHTML = fullName.replace('\n', '<br>');
      charIndex = 0;
      setTimeout(typeRole, 500);
    }
  }

  function typeRole() {
    const current = roles[roleIndex];
    if (!deleting) {
      roleEl.textContent = current.slice(0, charIndex++);
      if (charIndex > current.length) { deleting = true; setTimeout(typeRole, 1800); return; }
      setTimeout(typeRole, 60);
    } else {
      roleEl.textContent = current.slice(0, charIndex--);
      if (charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
        setTimeout(typeRole, 350);
        return;
      }
      setTimeout(typeRole, 30);
    }
  }

  setTimeout(typeName, 400);
})();

(function () {
  const el = document.getElementById('aw-typewriter');
  const sub = document.getElementById('aw-sub-text');

  if (!el) return; // only runs on awareness page

  const lines = [
    { text: 'Know the Threats.', red: false },
    { text: 'Stay Protected.', red: true },
  ];

  let lineIndex = 0, charIndex = 0;

  // Hide h1 completely before we start
  el.innerHTML = '';

  function render(l1, l2) {
    el.innerHTML =
      (l1 || '') +
      (l2 !== undefined ? '<br><span class="aw-hero-red">' + l2 + '</span>' : '') +
      '<span class="tw-cursor"></span>';
  }

  function typeLine() {
    charIndex++; // increment FIRST — same fix as name
    const current = lines[lineIndex].text;
    if (lineIndex === 0) {
      render(current.slice(0, charIndex));
    } else {
      render(lines[0].text, current.slice(0, charIndex));
    }
    if (charIndex < current.length) {
      setTimeout(typeLine, 60);
    } else if (lineIndex < lines.length - 1) {
      lineIndex++;
      charIndex = 0;
      setTimeout(typeLine, 400);
    } else {
      el.innerHTML =
        lines[0].text +
        '<br><span class="aw-hero-red">' + lines[1].text + '</span>';
      if (sub) sub.style.opacity = '1';
    }
  }

  setTimeout(typeLine, 400);
})();


const builtCards = document.querySelectorAll('.cs-built-card');
const builtObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), entry.target.dataset.i * 100);
      builtObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
builtCards.forEach((el, i) => { el.dataset.i = i; builtObs.observe(el); });

const pillarCards = document.querySelectorAll('.pillar-card');
const pillarObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), entry.target.dataset.i * 100);
      pillarObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
pillarCards.forEach((el, i) => { el.dataset.i = i; pillarObs.observe(el); });
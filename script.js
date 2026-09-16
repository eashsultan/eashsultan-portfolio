/* ==========================================================================
   Typewriter Effect
   ========================================================================== */
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        let typeSpeed = 80;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 400;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

/* ==========================================================================
   Interactive Particle Background Canvas
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    // Added a few more vibrant colors to match the premium vibe
    const colors = ['#00f2fe', '#4facfe', '#ffffff', '#a855f7', '#38ef7d'];

    // Track mouse for interaction
    let mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', function() {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 4 + 1.2;
            this.baseX = this.x;
            this.baseY = this.y;
            this.speedX = Math.random() * 1.5 - 0.75;
            this.speedY = Math.random() * 1.5 - 0.75;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Mouse interaction: Repel and Parallax
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    // Stronger repel force closer to the mouse
                    const force = (mouse.radius - distance) / mouse.radius;
                    const repelStrength = 4;

                    this.x -= forceDirectionX * force * repelStrength;
                    this.y -= forceDirectionY * force * repelStrength;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function setup() {
        particles = [];
        // Increased particle density
        const numberOfParticles = Math.min((canvas.width * canvas.height) / 4500, 220);
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let a = 0; a < particles.length; a++) {
            // Connect to mouse
            if (mouse.x != null && mouse.y != null) {
                const distMouse = Math.hypot(particles[a].x - mouse.x, particles[a].y - mouse.y);
                if (distMouse < mouse.radius - 30) {
                    ctx.save();
                    ctx.globalAlpha = (1 - distMouse / (mouse.radius - 30)) * 0.4;
                    ctx.strokeStyle = particles[a].color;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Connect to other particles
            for (let b = a + 1; b < particles.length; b++) {
                const dist = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y);
                if (dist < 110) {
                    ctx.save();
                    ctx.globalAlpha = (1 - dist / 110) * 0.15;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    setup();
    animate();
}

/* ==========================================================================
   Scroll Progress Indicator
   ========================================================================== */
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

/* ==========================================================================
   Custom Cursor Logic
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.custom-cursor-dot');
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function tick() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;

        dotX += (mouseX - dotX) * 0.3;
        dotY += (mouseY - dotY) * 0.3;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;

        requestAnimationFrame(tick);
    }
    tick();

    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea, .theme-btn');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        target.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

/* ==========================================================================
   3D Tilt & Light Reflection Tracker
   ========================================================================== */
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .about-card, .skill-category');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            if (card.classList.contains('tilt')) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('tilt')) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
            }
        });
    });
}

/* ==========================================================================
   Scroll Reveal Animations
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   Theme Switcher Customizer
   ========================================================================== */
function initThemeSwitcher() {
    const buttons = document.querySelectorAll('.theme-btn');
    const themes = Array.from(buttons).map(btn => btn.getAttribute('data-theme'));
    let activeIndex = 0;
    let cycleInterval;

    function applyTheme(index) {
        buttons.forEach((b, i) => {
            if (i === index) b.classList.add('active');
            else b.classList.remove('active');
        });
        document.body.className = '';
        document.body.classList.add(themes[index]);
        activeIndex = index;
    }

    function startCycle() {
        cycleInterval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % themes.length;
            applyTheme(nextIndex);
        }, 8000);
    }

    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            clearInterval(cycleInterval);
            applyTheme(index);
        });
    });

    startCycle();
}

/* ==========================================================================
   Interactive Sandbox: AI App Alchemist
   ========================================================================== */
function initPipelineSandbox() {
    const runBtn = document.getElementById('run-pipeline-btn');
    const terminal = document.getElementById('pipeline-terminal');
    const ideaInput = document.getElementById('app-idea-input');
    if (!runBtn || !terminal) return;

    let isRunning = false;

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function append(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
        return div;
    }

    const cap = w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '';

    const STOP_WORDS = new Set(['the','a','an','of','for','and','with','my','your','our','to','i','we','me','make','build','create','using','that','this','app','site','website','web','online']);

    const RULES = [
        { re: /(website|site|pages?|web|portfolio|landing)/, cat: 'Web', feats: ['custom landing & info pages'] },
        { re: /(bakery|caf[eé]|restaurant|food|menu|meal|recipe)/, cat: 'Food & Ordering', feats: ['menu & online orders'] },
        { re: /(shop|store|cart|product|market|e-?commerce|sell)/, cat: 'Commerce', feats: ['product catalog & checkout'] },
        { re: /(donat|giving|tithe|fund)/, cat: 'Payments', feats: ['donation & contribution tracking'] },
        { re: /(chat|whatsapp|message|notif|sms|alert|slack|email)/, cat: 'Messaging', feats: ['WhatsApp/SMS notifications'] },
        { re: /(book|reserve|schedule|appointment|slot|booking)/, cat: 'Bookings', feats: ['appointments & calendar'] },
        { re: /(track|report|dashboard|metric|analytics|stat)/, cat: 'Analytics', feats: ['live analytics dashboard'] },
        { re: /(pay|money|invoice|wallet|subscri|checkout|billing)/, cat: 'Payments', feats: ['payments & invoicing'] },
        { re: /(health|hospital|clinic|doctor|patient|medical|lab)/, cat: 'Healthcare', feats: ['patient records & triage'] },
        { re: /(school|student|class|learn|course|teacher|mentor|tutor)/, cat: 'Education', feats: ['courses & learner progress'] },
        { re: /(event|ticket|conference|festival|seminar)/, cat: 'Events', feats: ['event ticketing & RSVP'] },
    ];

    const PAGE_MAP = {
        'Web': ['About', 'Contact'],
        'Food & Ordering': ['Menu', 'Order'],
        'Commerce': ['Catalog', 'Cart', 'Checkout'],
        'Payments': ['Invoices', 'Donate'],
        'Messaging': ['Inbox'],
        'Bookings': ['Calendar', 'Book Now'],
        'Analytics': ['Reports'],
        'Healthcare': ['Patients', 'Appointments'],
        'Education': ['Courses', 'Progress'],
        'Events': ['Tickets']
    };

    function analyzeIdea(idea) {
        const t = idea.toLowerCase();
        const cats = [];
        const feats = [];

        for (const r of RULES) {
            if (r.re.test(t)) {
                if (!cats.includes(r.cat)) cats.push(r.cat);
                r.feats.forEach(f => { if (!feats.includes(f)) feats.push(f); });
            }
        }
        if (cats.length === 0) cats.push('General');
        feats.unshift('authentication & user accounts');
        if (feats.length > 5) feats.length = 5;

        const words = t.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
                       .filter(w => w.length > 1 && !STOP_WORDS.has(w));
        const name = words.slice(0, 2).map(cap).join(' ') || 'My App';

        const pages = ['Home', 'Dashboard'];
        (PAGE_MAP[cats[0]] || []).forEach(p => { if (!pages.includes(p)) pages.push(p); });
        if (!pages.includes('Login')) pages.push('Login');

        return { cats, feats, name, slug: (words[0] || 'app') + '-app', pages };
    }

    function buildPreview(gen) {
        const links = gen.pages.slice(0, 3).map(escapeHtml).join(' · ');
        const cards = gen.feats.slice(0, 3).map((f, i) =>
            `<div class="site-card"><span class="sc-num">0${i + 1}</span><div class="sc-text">${escapeHtml(f)}</div></div>`
        ).join('');

        return `<div class="app-preview">
            <div class="browser-bar">
                <span class="browser-dots"><i></i><i></i><i></i></span>
                <span class="browser-url">https://app.alphaspark.dev/${escapeHtml(gen.slug)}</span>
            </div>
            <div class="app-screen">
                <div class="site-nav">
                    <span class="site-logo">&#9670; ${escapeHtml(gen.name)}</span>
                    <span class="site-links">${links}</span>
                </div>
                <div class="site-hero">
                    <span class="site-badge">&#10024; AI-Generated</span>
                    <h3 class="site-title"><span class="grad">${escapeHtml(gen.name)}</span></h3>
                    <p class="site-tagline">A ${escapeHtml(gen.cats[0])} experience, generated from your prompt in seconds.</p>
                    <div class="site-cta"><span class="cta-primary">Get Started</span><span class="cta-ghost">Live Demo</span></div>
                </div>
                <div class="site-cards">${cards}</div>
                <div class="site-footer">&copy; 2026 ${escapeHtml(gen.name)} &middot; Crafted by AI Alchemist</div>
            </div>
        </div>`;
    }

    runBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        runBtn.disabled = true;

        const idea = (ideaInput && ideaInput.value.trim()) || 'a website for my initiative';
        const gen = analyzeIdea(idea);

        terminal.innerHTML = '<span class="terminal-prompt">$</span> alpha build ' + escapeHtml(idea) + '\n';

        const reveal = (html, ms) => setTimeout(() => append(html), ms);

        reveal(`✦ <span class="term-accent">Reading your prompt...</span>`, 350);
        reveal(`🔮 Detected: <span class="term-accent">${escapeHtml(gen.cats.join(' · '))}</span> — rendering your app`, 950);
        reveal(buildPreview(gen), 1600);
        reveal(`✨ <span class="term-magic">Your app is ready! Try another prompt.</span> ✨<br><span class="terminal-prompt">$</span> _`, 2600);
        setTimeout(() => { isRunning = false; runBtn.disabled = false; }, 2600);
    });
}

/* ==========================================================================
   Contact Form Validation
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = contactForm.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        
        button.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = 'Transmission Received! <i class="fa-solid fa-check"></i>';
            button.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
            contactForm.reset();
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                button.style.background = '';
            }, 3000);
        }, 1500);
    });
}

/* ==========================================================================
   Interactive About Section Tabs
   ========================================================================== */
function initAboutTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${tabId}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   Scroll Motion Image Sequence Canvas Hero
   ========================================================================== */
const frameCount = 224;
const images = [];
let targetFrame = 0;
let animatedFrame = 0;
let isHeroActive = true;

const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
};

const currentFrame = index => `images/ezgif-frame-${pad(index + 1, 3)}.jpg`;

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function drawImageProp(ctx, img) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const r = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    let newWidth = imgWidth * r;
    let newHeight = imgHeight * r;
    let ar = 1;

    if (newWidth < canvasWidth) ar = canvasWidth / newWidth;
    if (Math.abs(ar - 1) < 1e-14 && newHeight < canvasHeight) ar = canvasHeight / newHeight;
    
    newWidth *= ar;
    newHeight *= ar;

    const sourceWidth = imgWidth / (newWidth / canvasWidth);
    const sourceHeight = imgHeight / (newHeight / canvasHeight);

    const sourceX = (imgWidth - sourceWidth) * 0.5;
    const sourceY = (imgHeight - sourceHeight) * 0.5;

    ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(imgWidth, sourceWidth),
        Math.min(imgHeight, sourceHeight),
        0,
        0,
        canvasWidth,
        canvasHeight
    );
}

function initScrollMotionCanvas() {
    const canvas = document.getElementById("motion-canvas");
    if (!canvas) return Promise.resolve();
    const context = canvas.getContext("2d");

    const loader = document.getElementById("loader");
    const loaderBar = document.getElementById("loader-bar");
    const loaderText = document.getElementById("loader-text");

    const heroContainer = document.getElementById("hero-container");
    const slide1 = document.getElementById("slide-1");
    const slide2 = document.getElementById("slide-2");
    const slide3 = document.getElementById("slide-3");

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const currentIdx = Math.min(frameCount - 1, Math.max(0, Math.round(animatedFrame)));
        if (images[currentIdx]) {
            drawImageProp(context, images[currentIdx]);
        }
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function updateScrollVal() {
        const scrollTop = window.scrollY;
        const maxScroll = heroContainer.scrollHeight - window.innerHeight;
        
        // Check if canvas is in view to save rendering/processing cycles
        isHeroActive = (scrollTop <= heroContainer.scrollHeight);

        const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));
        targetFrame = progress * (frameCount - 1);

        // Slide fades
        updateSlideOpacity(slide1, progress, 0.0, 0.25);
        updateSlideOpacity(slide2, progress, 0.35, 0.60);
        updateSlideOpacity(slide3, progress, 0.70, 0.95);
    }

    function updateSlideOpacity(slide, progress, start, end) {
        if (!slide) return;
        const peakStart = start + (end - start) * 0.25;
        const peakEnd = end - (end - start) * 0.25;

        let opacity = 0;
        let translate = 20;

        if (progress >= start && progress <= end) {
            if (progress < peakStart) {
                const p = (progress - start) / (peakStart - start);
                opacity = lerp(0, 1, p);
                translate = lerp(20, 0, p);
            } else if (progress > peakEnd) {
                const p = (progress - peakEnd) / (end - peakEnd);
                opacity = lerp(1, 0, p);
                translate = lerp(0, -20, p);
            } else {
                opacity = 1;
                translate = 0;
            }
        } else if (progress > end) {
            opacity = 0;
            translate = -20;
        }

        slide.style.opacity = opacity;
        slide.style.transform = `translateY(${translate}px)`;
        if (opacity > 0.1) {
            slide.classList.add("active");
        } else {
            slide.classList.remove("active");
        }
    }

    function render() {
        if (isHeroActive) {
            animatedFrame = lerp(animatedFrame, targetFrame, 0.08);
            if (Math.abs(animatedFrame - targetFrame) < 0.01) {
                animatedFrame = targetFrame;
            }

            const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(animatedFrame)));
            if (images[frameIndex]) {
                drawImageProp(context, images[frameIndex]);
            }
        }
        requestAnimationFrame(render);
    }

    // Preload loop
    return new Promise((resolve) => {
        let loadedCount = 0;
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                const progress = Math.floor((loadedCount / frameCount) * 100);
                if (loaderBar) loaderBar.style.width = `${progress}%`;
                if (loaderText) loaderText.textContent = `Initializing Systems ${progress}%`;
                
                if (loadedCount === frameCount) {
                    setTimeout(() => {
                        if (loader) {
                            loader.style.opacity = 0;
                            setTimeout(() => {
                                loader.style.display = "none";
                            }, 800);
                        }
                    }, 500);
                    resolve();
                }
            };
            img.onerror = () => {
                loadedCount++;
                if (loadedCount === frameCount) resolve();
            };
            img.src = currentFrame(i);
            images.push(img);
        }

        // Start listeners
        window.addEventListener("scroll", updateScrollVal);
        updateScrollVal();
        requestAnimationFrame(render);
    });
}

/* ==========================================================================
   Initialize Everything on Load
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise Scroll Motion Canvas first so it sets up preloading and loader updates
    initScrollMotionCanvas().then(() => {
        // 2. Initialise other interactive components once loading finishes
        initScrollProgress();
        initAboutTabs();
        initParticles();
        initCustomCursor();
        initTiltEffect();
        initScrollReveal();
        initThemeSwitcher();
        initPipelineSandbox();
        initContactForm();

        // 3. Typewriter initialization
        const txtElement = document.querySelector('.typewriter');
        if (txtElement) {
            const words = JSON.parse(txtElement.getAttribute('data-words'));
            new TypeWriter(txtElement, words, 2500);
        }
    });
});

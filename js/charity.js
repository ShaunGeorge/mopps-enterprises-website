/**
 * charity.js — Mopps Heart page interactivity
 * - Drag/swipe/click carousel with momentum
 * - Fade-in scroll observer
 * - Nav hide/show on scroll
 */

document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // 1. FADE-IN ON SCROLL (reuses .fade-in / .visible pattern
    //    from the main site, but re-initialises for this page)
    // ============================================================
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                e.target.classList.add('visible');
                io.unobserve(e.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        fadeEls.forEach(el => io.observe(el));
    }

    // ============================================================
    // 2. NAV HIDE/SHOW ON SCROLL
    // ============================================================
    const nav = document.getElementById('main-nav') || document.querySelector('nav');
    let lastY = 0;
    if (nav) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y > lastY && y > 120) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
            lastY = y;
            nav.style.boxShadow = y > 50
                ? '0 2px 14px rgba(0,0,0,0.12)'
                : '0 2px 12px rgba(0,0,0,0.08)';
        }, { passive: true });
    }

    // ============================================================
    // 3. CAROUSEL — drag, swipe, click arrows, dot nav
    // ============================================================

    /**
     * Initialise a single carousel element.
     */
    function initCarousel(carouselEl) {
        const track     = carouselEl.querySelector('.carousel-track');
        const viewport  = carouselEl.querySelector('.carousel-viewport');
        const slides    = Array.from(carouselEl.querySelectorAll('.carousel-slide'));
        const dots      = Array.from(carouselEl.querySelectorAll('.c-dot'));
        const prevBtn   = carouselEl.querySelector('.c-prev');
        const nextBtn   = carouselEl.querySelector('.c-next');
        const curEl     = carouselEl.closest('.drive-gallery')
                            ? carouselEl.closest('.drive-gallery').querySelector('.c-cur')
                            : null;
        const totEl     = carouselEl.closest('.drive-gallery')
                            ? carouselEl.closest('.drive-gallery').querySelector('.c-tot')
                            : null;

        const total = slides.length;

        // ---- Single image — disable everything ----
        if (total <= 1) {
            carouselEl.classList.add('single-image');
            return;
        }

        let current = 0;
        let isDragging = false;
        let startX = 0;
        let dragOffset = 0;

        if (totEl) totEl.textContent = total;

        // ---- Go to slide ----
        function goTo(idx, animate = true) {
            // clamp
            idx = Math.max(0, Math.min(total - 1, idx));
            current = idx;

            const offset = -current * 100;
            track.style.transition = animate
                ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                : 'none';
            track.style.transform = `translateX(${offset}%)`;

            dots.forEach((d, i) => d.classList.toggle('active', i === current));
            if (curEl) curEl.textContent = current + 1;
        }

        // ---- Arrow buttons ----
        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

        // ---- Dot buttons ----
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => goTo(i));
        });

        // ---- Keyboard (when focused) ----
        carouselEl.setAttribute('tabindex', '0');
        carouselEl.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
        });

        // ---- Drag (mouse) ----
        viewport.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.clientX;
            dragOffset = 0;
            track.style.transition = 'none';
            viewport.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            dragOffset = e.clientX - startX;
            const basePct = -current * 100;
            const dragPct = (dragOffset / viewport.offsetWidth) * 100;
            track.style.transform = `translateX(${basePct + dragPct}%)`;
        });

        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            viewport.style.cursor = 'grab';

            const threshold = viewport.offsetWidth * 0.2;
            if (dragOffset < -threshold) {
                goTo(current + 1);
            } else if (dragOffset > threshold) {
                goTo(current - 1);
            } else {
                goTo(current); // snap back
            }
        });

        // ---- Touch (mobile swipe) ----
        let touchStartX = 0;

        viewport.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            track.style.transition = 'none';
        }, { passive: true });

        viewport.addEventListener('touchmove', e => {
            const delta = e.touches[0].clientX - touchStartX;
            const basePct = -current * 100;
            const dragPct = (delta / viewport.offsetWidth) * 100;
            track.style.transform = `translateX(${basePct + dragPct}%)`;
        }, { passive: true });

        viewport.addEventListener('touchend', e => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            const threshold = viewport.offsetWidth * 0.2;
            if (delta < -threshold) {
                goTo(current + 1);
            } else if (delta > threshold) {
                goTo(current - 1);
            } else {
                goTo(current);
            }
        });

        // Prevent link/image drag interfering
        viewport.addEventListener('dragstart', e => e.preventDefault());

        // Initialise at first slide
        goTo(0, false);
    }

    // Find all carousels and initialise each
    document.querySelectorAll('.carousel').forEach(el => initCarousel(el));

    // ============================================================
    // 4. SMOOTH SCROLL for in-page anchor links
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

});
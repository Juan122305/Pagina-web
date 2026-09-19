import { animate, stagger } from "motion";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Hero entrance: content is visible by default in CSS; this only adds a
// one-time animated intro on load, so a slow/blocked script never hides it.
const heroTargets = document.querySelectorAll("[data-hero-reveal]");
if (heroTargets.length && !prefersReducedMotion) {
  animate(
    heroTargets,
    { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0)"] },
    { duration: 0.6, delay: stagger(0.1), ease: "easeOut" },
  );
}

// Scroll reveal: progressive enhancement only. Elements are fully visible by
// CSS default; we pre-hide (via .reveal-pending) only the ones currently
// below the fold, then reveal them as they scroll into view. A timeout
// safety net guarantees nothing stays hidden if the observer misbehaves.
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  try {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    const viewportHeight = window.innerHeight;
    const pending = items.filter(
      (el) => el.getBoundingClientRect().top > viewportHeight * 0.85,
    );

    pending.forEach((el) => el.classList.add("reveal-pending"));

    const reveal = (el) => el.classList.remove("reveal-pending");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    pending.forEach((el) => observer.observe(el));

    window.setTimeout(() => {
      pending.forEach(reveal);
      observer.disconnect();
    }, 4000);
  } catch {
    // If anything above fails, elements remain visible (CSS default).
  }
}

// Stat counters ("+50", "4.6"): count up once, the first time each one
// scrolls into view. Falls back to showing the final value immediately.
const counters = Array.from(document.querySelectorAll("[data-counter]"));
if (counters.length) {
  const renderCounter = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || "";
    el.textContent = prefix + value.toFixed(decimals);
  };

  const runCounter = (el) => {
    const target = Number(el.dataset.countTo);
    if (Number.isNaN(target)) return;
    if (prefersReducedMotion) {
      renderCounter(el, target);
      return;
    }
    animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => renderCounter(el, latest),
    });
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => renderCounter(el, Number(el.dataset.countTo)));
  }
}

// Header: subtle shadow once the page has scrolled past the hero padding.
const header = document.getElementById("site-header");
if (header) {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

// Scrollspy: highlight the nav link matching the section in view.
const navLinks = Array.from(document.querySelectorAll(".nav-link[data-section]"));
if (navLinks.length && "IntersectionObserver" in window) {
  const linkBySection = new Map(navLinks.map((link) => [link.dataset.section, link]));
  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkBySection.get(entry.target.id);
        if (!link) return;
        link.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { rootMargin: "-40% 0px -50% 0px" },
  );

  sections.forEach((section) => spy.observe(section));
}

// Hero image: gentle parallax drift tied to scroll position.
const parallaxEl = document.querySelector("[data-parallax]");
if (parallaxEl && !prefersReducedMotion) {
  let ticking = false;
  const maxShift = 24;

  const updateParallax = () => {
    ticking = false;
    const rect = parallaxEl.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const elementCenter = rect.top + rect.height / 2;
    const distance = (elementCenter - viewportCenter) / viewportCenter;
    const shift = Math.max(-1, Math.min(1, distance)) * maxShift;
    parallaxEl.style.transform = `translateY(${shift.toFixed(1)}px)`;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    },
    { passive: true },
  );
  updateParallax();
}

// Lightbox: open a larger view of a product photo.
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
let lightboxTrigger = null;

function openLightbox(trigger) {
  lightboxTrigger = trigger;
  lightboxImage.src = trigger.dataset.lightboxSrc;
  lightboxImage.alt = trigger.dataset.lightboxAlt || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxTrigger?.focus();
}

if (lightbox && lightboxImage && lightboxClose) {
  document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

// Mobile nav
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navToggleIcon = document.getElementById("nav-toggle-icon");
const navToggleIconUse = navToggleIcon?.querySelector("use");

function setNavOpen(isOpen) {
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  navToggleIconUse?.setAttribute("href", isOpen ? "#icon-close" : "#icon-menu");

  if (isOpen) {
    navMenu.classList.remove("hidden");
    navMenu.classList.add("flex");
    if (!prefersReducedMotion) {
      animate(
        navMenu,
        { opacity: [0, 1], transform: ["translateY(-8px)", "translateY(0)"] },
        { duration: 0.2, ease: "easeOut" },
      );
    }
    return;
  }

  if (prefersReducedMotion) {
    navMenu.classList.add("hidden");
    navMenu.classList.remove("flex");
    return;
  }

  animate(
    navMenu,
    { opacity: [1, 0], transform: ["translateY(0)", "translateY(-8px)"] },
    { duration: 0.15, ease: "easeIn" },
  ).finished.then(() => {
    navMenu.classList.add("hidden");
    navMenu.classList.remove("flex");
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    setNavOpen(navMenu.classList.contains("hidden"));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

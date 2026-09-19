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
    { duration: 0.6, delay: stagger(0.1), easing: "ease-out" },
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

const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navToggleIcon = document.getElementById("nav-toggle-icon");
const navToggleIconUse = navToggleIcon?.querySelector("use");

function setNavOpen(isOpen) {
  navMenu.classList.toggle("hidden", !isOpen);
  navMenu.classList.toggle("flex", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  navToggleIconUse?.setAttribute("href", isOpen ? "#icon-close" : "#icon-menu");
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

import { renderComponentCatalog } from "./components.js";

renderComponentCatalog(document.querySelector("[data-primitives]"), document.querySelector("[data-domain]"));

const links = [...document.querySelectorAll("[data-catalog-nav]")];
const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  links.forEach(link => link.setAttribute("aria-current", String(link.hash === `#${visible.target.id}`)));
}, { rootMargin: "-20% 0px -65%", threshold: [0, .5, 1] });
sections.forEach(section => observer.observe(section));

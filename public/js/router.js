// Minimal hash router: #/route → page module render.

const routes = new Map();
let mount = null;

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

export function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return hash || "overview";
}

export function navigate() {
  const name = routes.has(currentRoute()) ? currentRoute() : "overview";
  const render = routes.get(name);

  document.querySelectorAll("[data-route]").forEach((link) => {
    if (link.dataset.route === name) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  mount.innerHTML = "";
  render(mount);
  mount.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

export function startRouter(mountNode) {
  mount = mountNode;
  window.addEventListener("hashchange", navigate);
  navigate();
}

import { icon } from "../ui.js";

export function renderResources(mount) {
  mount.innerHTML = `
    <section class="page-header"><div><p class="page-kicker">Reference</p><h2>Resources</h2><p>Operational references and quick access tools for both campuses.</p></div></section>

    <section class="widget span-12">
      <div class="widget-head"><div><p class="widget-kicker">Interactive reference</p><h3>Gates &amp; Fences</h3></div><a class="btn btn-quiet btn-small" href="https://phsgates.netlify.app/" target="_blank" rel="noopener">${icon("external")} Open full site</a></div>
      <div class="embed-body"><iframe class="site-embed" src="https://phsgates.netlify.app/" title="PHS Gates and Fences reference" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="embed-fallback">The embedded reference may be opened in a separate tab using the button above.</p></div>
    </section>

    <div class="section-heading"><div><p class="widget-kicker">Quick reference</p><h3>Operational guidance</h3></div></div>
    <section class="resource-grid">
      <article class="resource-card"><span class="resource-icon">${icon("checklist")}</span><h3>Post Orders</h3><p>Use current assignment-specific post orders for opening, driveline, patrol, event, and closing responsibilities.</p><ul><li>Confirm radio channel and call sign.</li><li>Review assigned campus, post, and relief time.</li><li>Document exceptions through the appropriate report workflow.</li></ul></article>
      <article class="resource-card"><span class="resource-icon">${icon("alert")}</span><h3>Emergency Procedures</h3><p>Follow the current PHS emergency procedure and the direction of the incident lead.</p><ul><li>Use plain, concise radio traffic.</li><li>Prioritize life safety and accurate location information.</li><li>Document significant actions after the situation is stable.</li></ul></article>
      <article class="resource-card"><span class="resource-icon">${icon("user")}</span><h3>Contacts &amp; Escalation</h3><p>Use the current security contact directory and escalation process for urgent operational needs.</p><ul><li>Use 911 for immediate life-safety emergencies.</li><li>Notify the Security Director or designated supervisor as required.</li><li>Protect student, employee, and security-sensitive information.</li></ul></article>
    </section>

    <div class="section-heading"><div><p class="widget-kicker">Officer reminders</p><h3>Document with purpose</h3></div></div>
    <section class="panel"><div class="content-grid"><div class="span-4"><strong>Use the right workflow</strong><p class="muted">Daily Activity is for routine work. Incident Report is for events requiring formal review or follow-up.</p></div><div class="span-4"><strong>Write what you know</strong><p class="muted">Use factual observations, direct statements, clear times, and actions taken. Separate facts from assumptions.</p></div><div class="span-4"><strong>Protect information</strong><p class="muted">Include only the personal and operational details needed for the report and approved follow-up.</p></div></div></section>`;
}

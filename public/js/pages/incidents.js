import { store, refreshHubData } from "../store.js";
import { escapeHtml, options, bindSubmit, toast, fileField, wireFileField, uploadFiles, locationField, wireLocationField, wireRememberedInput, icon } from "../ui.js";
import { submitAction } from "../api.js";

export function renderIncidents(mount) {
  const meta = store.metadata || {};
  mount.innerHTML = `
    <section class="page-header">
      <div><p class="page-kicker">Officer Reporting</p><h2>Choose a reporting workflow</h2></div>
      <span class="badge badge-private">Private uploads</span>
    </section>

    <section class="report-mode-grid" aria-label="Report type">
      <button class="report-mode-card daily" type="button" id="modeDaily" aria-pressed="true">
        <span class="report-mode-icon">${icon("activity")}</span><span><strong>Daily Activity</strong><small>Quick officer log for routine activity, patrol checks, assists, unlocks, traffic, and events.</small></span>
      </button>
      <button class="report-mode-card" type="button" id="modeIncident" aria-pressed="false">
        <span class="report-mode-icon">${icon("alert")}</span><span><strong>Incident Report</strong><small>Formal report for events needing review, follow-up, documentation, or administrative attention.</small></span>
      </button>
    </section>

    <div class="report-layout">
      <section class="panel report-panel panel-daily" id="panelDaily">
        <div class="report-panel-header"><span class="report-mode-icon">${icon("activity")}</span><div><h3>Daily Activity</h3><p>Fast, factual entries for routine security work.</p></div></div>
        <div class="report-panel-body">
          <p class="required-note">Fields marked * are required.</p>
          <form id="dailyForm" novalidate><div class="form-grid">
            <div class="field"><label for="daDate">Activity date</label><input id="daDate" name="activityDate" type="date" required /></div>
            <div class="field"><label for="daStartTime">Start time</label><select id="daStartTime" name="activityStartTime" required>${timeOptions()}</select></div>
            <div class="field"><label for="daEndTime">End time</label><select id="daEndTime" name="activityEndTime" required>${timeOptions()}</select></div>
            <input id="daTime" name="activityTime" type="hidden" />
            <div class="field"><label for="daType">Activity type</label><select id="daType" name="activityType" required>${options(meta.dailyActivityTypes)}</select></div>
            <div class="field"><label for="daOfficer">Officer</label><input id="daOfficer" name="officer" required autocomplete="name" /></div>
            <div class="field"><label for="daCampus">Campus</label><select id="daCampus" name="campus" required>${options(meta.campuses)}</select></div>
            ${locationField("da")}
            <div class="field full"><label for="daNotes">Activity details</label><textarea id="daNotes" name="notes" required spellcheck="true" placeholder="Briefly document what was checked, observed, completed, or communicated."></textarea></div>
            ${fileField("da")}
          </div><div class="form-actions"><button type="submit" class="btn btn-primary">${icon("activity")} Log activity</button><p class="form-note">Saved with an automatically assigned DA number.</p></div></form>
        </div>
      </section>

      <section class="panel report-panel panel-incident" id="panelIncident" hidden>
        <div class="report-panel-header"><span class="report-mode-icon">${icon("alert")}</span><div><h3>Incident Report</h3><p>Formal documentation routed through supervisor approval.</p></div></div>
        <div class="report-panel-body">
          <p class="required-note">Fields marked * are required.</p>
          <form id="incidentForm" novalidate><div class="form-grid">
            <div class="field"><label for="irDate">Incident date</label><input id="irDate" name="incidentDate" type="date" required /></div>
            <div class="field"><label for="irStartTime">Start time</label><select id="irStartTime" name="incidentStartTime" required>${timeOptions()}</select></div>
            <div class="field"><label for="irEndTime">End time</label><select id="irEndTime" name="incidentEndTime" required>${timeOptions()}</select></div>
            <input id="irTime" name="incidentTime" type="hidden" />
            <div class="field"><label for="irType">Incident type</label><select id="irType" name="reportType" required>${options(meta.incidentTypes)}</select><p class="hint" id="irTypeHint"></p></div>
            <div class="field"><label for="irPriority">Priority</label><select id="irPriority" name="priority" required>${options(meta.priorityOptions)}</select></div>
            <div class="field"><label for="irOfficer">Submitted by</label><input id="irOfficer" name="submittedBy" required autocomplete="name" /></div>
            <div class="field"><label for="irCampus">Campus</label><select id="irCampus" name="campus" required>${options(meta.campuses)}</select></div>
            ${locationField("ir")}
            <fieldset class="field full"><legend><strong>People involved? *</strong></legend><div class="choice-group">
              <label class="choice-option"><input type="radio" name="peopleInvolvedChoice" value="Yes" required /> Yes</label>
              <label class="choice-option"><input type="radio" name="peopleInvolvedChoice" value="No" required /> No</label>
            </div></fieldset>
            <div class="field full people-section" id="peopleSection" hidden>
              <div class="people-toolbar"><div><strong>People Involved</strong><p class="hint">Add each person and select the role that best fits the report.</p></div><button type="button" class="btn btn-quiet btn-small" id="addPersonBtn">${icon("plus")} Add person</button></div>
              <div id="peopleList"></div>
            </div>
            <div class="field full"><label for="irSummary">Narrative</label><textarea id="irSummary" name="summary" required spellcheck="true" placeholder="Document who, what, when, where, actions taken, and who was notified. Keep the narrative factual and chronological."></textarea><p class="hint">For medical events, document brief factual observations and security actions without unnecessary medical details.</p></div>
            ${fileField("ir")}
          </div><div class="form-actions"><button type="submit" class="btn btn-primary">${icon("report")} File incident report</button><p class="form-note">Assigned an IR number and routed to Supervisor Review as Pending Approval.</p></div></form>
        </div>
      </section>

      <aside class="panel guidance-panel" id="reportGuidance"><p class="guidance-label">Report guidance</p><h3 id="guidanceTitle">Daily Activity</h3><div id="guidanceBody"></div></aside>
    </div>`;

  const typeSelect=document.getElementById("irType"), hint=document.getElementById("irTypeHint");
  const described=new Map((meta.incidentTypes||[]).map((item)=>[typeof item==="string"?item:item.value,typeof item==="string"?"":item.description]));
  typeSelect.addEventListener("change",()=>{hint.textContent=described.get(typeSelect.value)||""});
  wireRememberedInput(document.getElementById("daOfficer"),"phsHub.officerName");
  wireRememberedInput(document.getElementById("irOfficer"),"phsHub.officerName");
  setCurrentDateTime("daDate","daStartTime","daEndTime","daTime"); setCurrentDateTime("irDate","irStartTime","irEndTime","irTime");
  syncLegacyTime("daStartTime","daTime"); syncLegacyTime("irStartTime","irTime");

  const daFiles=wireFileField("da"), irFiles=wireFileField("ir");
  const daLocation=wireLocationField("da",document.getElementById("daCampus"),meta.locationGroups);
  const irLocation=wireLocationField("ir",document.getElementById("irCampus"),meta.locationGroups);
  wireModes(); wirePeople();

  bindSubmit(document.getElementById("dailyForm"),async(data)=>{
    const attachments=await uploadFiles(daFiles.input,"DailyActivity",submitAction);
    const result=await submitAction("submitReport",{...data,reportType:"daily_activity",location:daLocation.value(),attachments});
    toast(`${result.message||"Entry logged."} ${result.entryId||""}`.trim()); daFiles.clear(); refreshHubData();
    setTimeout(()=>{daLocation.reset();setCurrentDateTime("daDate","daStartTime","daEndTime","daTime")},0);
  });

  bindSubmit(document.getElementById("incidentForm"),async(data)=>{
    const people=collectPeople();
    if(data.peopleInvolvedChoice==="Yes"&&!people.length) throw new Error("Add at least one person involved.");
    const attachments=await uploadFiles(irFiles.input,"IncidentReports",submitAction);
    const result=await submitAction("submitReport",{...data,location:irLocation.value(),peopleInvolved:people,attachments});
    toast(`${result.message||"Report filed."} ${result.reportId||""}`.trim()); irFiles.clear(); refreshHubData();
    setTimeout(()=>{irLocation.reset();setCurrentDateTime("irDate","irStartTime","irEndTime","irTime");resetPeople()},0);
  });
}

function wireModes(){
  const daily=document.getElementById("modeDaily"), incident=document.getElementById("modeIncident"), dailyPanel=document.getElementById("panelDaily"), incidentPanel=document.getElementById("panelIncident");
  function select(mode,updateHash=true){const isDaily=mode==="daily";daily.setAttribute("aria-pressed",String(isDaily));incident.setAttribute("aria-pressed",String(!isDaily));dailyPanel.hidden=!isDaily;incidentPanel.hidden=isDaily;paintGuidance(mode);if(updateHash)history.replaceState(null,"",`#/incidents?mode=${mode}`)}
  daily.addEventListener("click",()=>select("daily")); incident.addEventListener("click",()=>select("incident"));
  const mode=new URLSearchParams(location.hash.split("?")[1]||"").get("mode")==="incident"?"incident":"daily"; select(mode,false);
}
function paintGuidance(mode){
  const title=document.getElementById("guidanceTitle"),body=document.getElementById("guidanceBody");
  if(mode==="incident"){title.textContent="Incident Report";body.innerHTML="<p>Use this when the event needs review, follow-up, notification, or formal documentation.</p><ul><li>Use the actual date and time the incident occurred.</li><li>Identify every involved person and select the appropriate role.</li><li>Write a factual, chronological narrative.</li><li>Attach relevant photos or PDFs when available.</li></ul>"}
  else{title.textContent="Daily Activity";body.innerHTML="<p>Use this for routine shift activity that does not require a formal incident report.</p><ul><li>Keep the entry short and factual.</li><li>Record the actual time of the activity.</li><li>State what was checked, observed, completed, or communicated.</li><li>Use Incident Report when follow-up or formal review is needed.</li></ul>"}
}
function wirePeople(){
  const section=document.getElementById("peopleSection"),list=document.getElementById("peopleList");
  document.querySelectorAll('input[name="peopleInvolvedChoice"]').forEach((radio)=>radio.addEventListener("change",()=>{
    if (!radio.checked) return;
    const show = radio.value === "Yes";
    section.hidden = !show;
    list.querySelectorAll("input, select, button").forEach((control) => { control.disabled = !show; });
    if (show && !list.children.length) addPerson();
  }));
  document.getElementById("addPersonBtn").addEventListener("click",addPerson);
  list.addEventListener("click",(event)=>{const btn=event.target.closest("[data-remove-person]");if(btn)btn.closest(".person-card")?.remove()});
}
function addPerson(){
  const list=document.getElementById("peopleList"),index=list.children.length+1,card=document.createElement("div");card.className="person-card";card.innerHTML=`<div class="person-card-head"><strong>Person ${index}</strong><button type="button" class="btn btn-quiet btn-small remove-person-btn" data-remove-person>${icon("close")} Remove</button></div><div class="form-grid"><div class="field"><label>Name</label><input data-person="name" required autocomplete="name" /></div><div class="field"><label>Role</label><select data-person="role" required>${options(["Witness","Victim","Person of Interest","Other"])}</select></div><div class="field"><label>Student?</label><select data-person="student" required>${options(["Yes","No"])}</select></div><div class="field"><label>Date of birth (optional)</label><input data-person="dob" type="date" /></div><div class="field full"><label>Phone (optional)</label><input data-person="phone" type="tel" autocomplete="tel" /></div></div>`;list.appendChild(card);
}
function collectPeople(){return [...document.querySelectorAll(".person-card")].map((card)=>({name:card.querySelector('[data-person="name"]').value.trim(),role:card.querySelector('[data-person="role"]').value,student:card.querySelector('[data-person="student"]').value,dob:card.querySelector('[data-person="dob"]').value,phone:card.querySelector('[data-person="phone"]').value.trim()})).filter((person)=>person.name||person.role||person.student||person.dob||person.phone)}
function resetPeople(){document.getElementById("peopleList").innerHTML="";document.getElementById("peopleSection").hidden=true}
function timeOptions(){
  const items=[];
  for(let minutes=0;minutes<24*60;minutes+=15){
    const h=Math.floor(minutes/60),m=minutes%60,value=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    const hour12=h%12||12,ampm=h<12?"AM":"PM",label=`${hour12}:${String(m).padStart(2,"0")} ${ampm}`;
    items.push({value,label});
  }
  return options(items);
}
function setCurrentDateTime(dateId,startId,endId,legacyId){
  const now=new Date(),local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
  const date=document.getElementById(dateId),start=document.getElementById(startId),end=document.getElementById(endId),legacy=document.getElementById(legacyId);
  const roundedMinutes=Math.floor((local.getHours()*60+local.getMinutes())/15)*15;
  const startValue=minutesToTime(roundedMinutes);
  const endValue=minutesToTime(Math.min(roundedMinutes+15,24*60-15));
  if(date)date.value=local.toISOString().slice(0,10);
  if(start)start.value=startValue;
  if(end)end.value=endValue;
  if(legacy)legacy.value=startValue;
}
function syncLegacyTime(startId,legacyId){
  const start=document.getElementById(startId),legacy=document.getElementById(legacyId);
  if(!start||!legacy)return;
  const update=()=>{legacy.value=start.value||""};
  start.addEventListener("change",update);
  update();
}
function minutesToTime(minutes){
  const bounded=Math.max(0,Math.min(minutes,24*60-15));
  return `${String(Math.floor(bounded/60)).padStart(2,"0")}:${String(bounded%60).padStart(2,"0")}`;
}

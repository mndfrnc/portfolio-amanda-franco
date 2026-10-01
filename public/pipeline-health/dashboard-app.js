let previousSnapshot=null, mobileHasRendered=false;
const endpoint = document.querySelector("main")?.dataset.dashboardEndpoint;
const number = new Intl.NumberFormat("pt-BR");
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const state = { data: null, filtered: [], visible: 15 };
const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function fillSelect(id, values) {
  const select = byId(id);
  values.forEach((value) => select.add(new Option(value, value)));
}

function renderFindings(findings) {
  const target = byId("finding-grid");
  if (!target) return;
  target.innerHTML = findings.map((finding) => `
    <article class="finding-card">
      <span>${escapeHtml(finding.title)}</span>
      <strong>${escapeHtml(finding.value)}</strong>
      <p>${escapeHtml(finding.detail)}</p>
    </article>`).join("");
}

function renderHeadlineKpis(kpis) {
  byId("kpi-source").textContent = number.format(kpis.source_opportunities);
  byId("kpi-revenue").textContent = currency.format(kpis.revenue);
  byId("kpi-win-rate").textContent = percent.format(kpis.win_rate);
  byId("kpi-cycle").textContent = `${number.format(kpis.median_cycle_days)} dias`;
}

function renderMonthly(rows) {
  const width = 900;
  const height = 240;
  const pad = { top: 22, right: 28, bottom: 38, left: 52 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const maxRevenue = Math.max(...rows.map((row) => row.revenue));
  const slot = innerWidth / rows.length;
  const barWidth = Math.min(48, slot * .58);
  const points = rows.map((row, index) => {
    const x = pad.left + slot * index + slot / 2;
    const y = pad.top + innerHeight * (1 - row.win_rate);
    return `${x},${y}`;
  }).join(" ");
  const grid = [0, .25, .5, .75, 1].map((value) => {
    const y = pad.top + innerHeight * (1 - value);
    return `<line class="chart-grid" x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}"/><text class="chart-label" x="4" y="${y + 4}">${Math.round(value * 100)}%</text>`;
  }).join("");
  const bars = rows.map((row, index) => {
    const x = pad.left + slot * index + (slot - barWidth) / 2;
    const barHeight = (row.revenue / maxRevenue) * innerHeight;
    return `<rect class="chart-revenue" x="${x}" y="${pad.top + innerHeight - barHeight}" width="${barWidth}" height="${barHeight}" rx="5"/><text class="chart-label" text-anchor="middle" x="${x + barWidth / 2}" y="${height - 12}">${row.month.slice(5)}</text>`;
  }).join("");
  const dots = rows.map((row, index) => {
    const x = pad.left + slot * index + slot / 2;
    const y = pad.top + innerHeight * (1 - row.win_rate);
    return `<circle class="chart-dot" cx="${x}" cy="${y}" r="4"><title>${row.month}: ${percent.format(row.win_rate)} · ${currency.format(row.revenue)}</title></circle>`;
  }).join("");
  byId("monthly-chart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${grid}${bars}<polyline class="chart-rate" points="${points}"/>${dots}</svg>`;
}

function renderProducts(rows) {
  byId("product-table").innerHTML = rows.map((row) => `<tr>
    <td><strong>${escapeHtml(row.product)}</strong></td>
    <td>${number.format(row.closed_deals)}</td>
    <td>${percent.format(row.win_rate)}</td>
    <td>${currency.format(row.revenue)}</td>
    <td>${percent.format(row.avg_price_realization)}</td>
  </tr>`).join("");
}

function ageBucket(age) {
  if (age < 30) return "0–29";
  if (age < 60) return "30–59";
  if (age < 90) return "60–89";
  if (age < 180) return "90–179";
  return "180+";
}

function renderAgeChart(rows) {
  const labels = ["0–29", "30–59", "60–89", "90–179", "180+"];
  const counts = Object.fromEntries(labels.map((label) => [label, 0]));
  rows.forEach((row) => counts[ageBucket(row.open_age_days)] += 1);
  const max = Math.max(...Object.values(counts), 1);
  byId("age-chart").innerHTML = labels.map((label) => `<div class="bar-row ${label === "90–179" || label === "180+" ? "is-aged" : ""}">
    <span>${label} dias</span><div class="bar-track"><div class="bar-fill" style="width:${(counts[label] / max) * 100}%"></div></div><strong>${number.format(counts[label])}</strong>
  </div>`).join("");
}

function renderActionSummary(rows) {
  byId("action-count").textContent = number.format(rows.length);
  byId("action-aged").textContent = number.format(rows.filter((row) => row.open_age_days >= 90).length);
  byId("action-missing").textContent = number.format(rows.filter((row) => row.account === "Conta não informada").length);
  byId("action-value").textContent = currency.format(rows.reduce((sum, row) => sum + row.sales_price, 0));
}

function priorityClass(priority) {
  return priority === "Crítica" ? "critical" : priority === "Alta" ? "high" : "monitor";
}

function renderQueue() {
  const rows = state.filtered.slice(0, state.visible);
  byId("queue-table").innerHTML = rows.map((row) => `<tr>
    <td><span class="priority priority--${priorityClass(row.priority)}">${escapeHtml(row.priority)}</span></td>
    <td>${escapeHtml(row.opportunity_id)}</td>
    <td>${escapeHtml(row.sales_agent)}</td>
    <td>${escapeHtml(row.regional_office)}</td>
    <td>${escapeHtml(row.product)}</td>
    <td>${escapeHtml(row.account)}</td>
    <td>${number.format(row.open_age_days)} dias</td>
    <td>${escapeHtml(row.action_reason)}</td>
  </tr>`).join("");
  byId("queue-status").textContent = `${number.format(state.filtered.length)} oportunidades encontradas · exibindo ${number.format(rows.length)}`;
  byId("load-more").hidden = state.visible >= state.filtered.length;
}

function applyFilters() {
 previousSnapshot = mobileHasRendered ? snapshot(state.filtered) : null;
  const filters = {
    regional_office: byId("filter-region").value,
    manager: byId("filter-manager").value,
    sales_agent: byId("filter-agent").value,
    product: byId("filter-product").value,
    priority: byId("filter-priority").value,
  };
  state.filtered = state.data.priority_queue.filter((row) => Object.entries(filters).every(([field, value]) => !value || row[field] === value));
  state.visible = 15;
  renderAgeChart(state.filtered);
  renderActionSummary(state.filtered);
  renderQueue();
  updateFilterSummary();
  renderMobileComparison();
}

async function init() {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Não foi possível carregar os dados (${response.status}).`);
  state.data = await response.json();
  state.filtered = state.data.priority_queue;
  renderFindings(state.data.findings);
  renderHeadlineKpis(state.data.kpis);
  renderMonthly(state.data.monthly);
  renderProducts(state.data.products);
  fillSelect("filter-region", state.data.filters.regions);
  fillSelect("filter-manager", state.data.filters.managers);
  fillSelect("filter-agent", state.data.filters.agents);
  fillSelect("filter-product", state.data.filters.products);
  fillSelect("filter-priority", state.data.filters.priorities);
  document.querySelectorAll(".dashboard__filters select").forEach((select) => select.addEventListener("change", applyFilters));
  byId("clear-filters").addEventListener("click", () => {
    document.querySelectorAll(".dashboard__filters select").forEach((select) => select.value = "");
    applyFilters();
  });
  byId("load-more").addEventListener("click", () => { state.visible += 15; renderQueue(); });
  applyFilters();
}

init().catch((error) => {
  byId("queue-status").textContent = error.message;
  console.error(error);
});

function updateFilterSummary() {
 const selects=[...document.querySelectorAll('.dashboard__filters select')];
 const active=selects.filter(s=>s.value);
 byId('filter-count').textContent=number.format(state.filtered.length);
 byId('active-filters').replaceChildren();
 if(!active.length) {const span=document.createElement('span');span.className='all-chip';span.textContent='Todos os recortes';byId('active-filters').append(span);}
 for(const select of active) {
  const b=document.createElement('button'); b.type='button';b.className='filter-chip';
  const label=select.parentElement.firstChild.textContent.trim();
  b.textContent=label+': '+select.value+' ×';b.setAttribute('aria-label','Remover filtro '+label+': '+select.value);
  b.addEventListener('click',()=>{select.value='';applyFilters();select.focus();});byId('active-filters').append(b);
 }
 byId('filter-scope').textContent=active.length?active.length+' filtro'+(active.length>1?'s':'')+' ativo'+(active.length>1?'s':'')+' · aplicado'+(active.length>1?'s':'')+' somente ao backlog':'Nenhum filtro ativo · backlog completo';
 byId('clear-filters').disabled=!active.length;
}

function snapshot(rows) {return [rows.length,rows.filter(r=>r.open_age_days>=90).length,rows.filter(r=>r.account==='Conta não informada').length];}
function renderMobileComparison() {
 const current=snapshot(state.filtered),labels=['Oportunidades','90+ dias','Conta ausente'];
 byId('mobile-metrics').replaceChildren();
 current.forEach((value,i)=>{const el=document.createElement('div');const span=document.createElement('span');span.textContent=labels[i];const strong=document.createElement('strong');strong.textContent=number.format(value);const small=document.createElement('small');
 if(previousSnapshot){const delta=value-previousSnapshot[i];small.textContent=(delta>0?'+':'')+number.format(delta)+' vs. anterior';}else small.textContent='base inicial';
 el.append(span,strong,small);byId('mobile-metrics').append(el);});
 const active=[...document.querySelectorAll('.dashboard__filters select')].filter(s=>s.value);byId('mobile-selection').textContent=active.length?active.map(s=>s.value).join(' · '):'Todos os recortes';
 byId('comparison-label').textContent=previousSnapshot?'Diferença para o recorte anterior':'Sem comparação anterior';byId('mobile-reset').disabled=!active.length;mobileHasRendered=true;
}
const dialog=byId('mobile-filter-dialog');
byId('open-mobile-filters').addEventListener('click',()=>{
 const box=byId('mobile-draft-filters');box.replaceChildren();
 document.querySelectorAll('.dashboard__filters select').forEach(original=>{const label=document.createElement('label');label.textContent=original.parentElement.firstChild.textContent.trim();const draft=original.cloneNode(true);draft.id='draft-'+original.id;draft.value=original.value;label.append(draft);box.append(label);});dialog.showModal();
});
byId('mobile-draft-clear').addEventListener('click',()=>dialog.querySelectorAll('select').forEach(s=>s.value=''));
byId('mobile-apply').addEventListener('click',()=>{dialog.querySelectorAll('select').forEach(s=>byId(s.id.replace('draft-','')).value=s.value);applyFilters();dialog.close();});
byId('mobile-reset').addEventListener('click',()=>{document.querySelectorAll('.dashboard__filters select').forEach(s=>s.value='');applyFilters();});

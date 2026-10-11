const state = { authMode: 'login', maps: {} };

const featureData = [
  ['01','Risk-aware route review','Review route conditions and important risk signals in one workspace.'],
  ['02','Fleet visibility','Keep vehicles, drivers and active journeys organized for dispatch teams.'],
  ['03','Incident reporting','Record operational events and keep affected journeys easy to review.'],
  ['04','Route alternatives','Compare route options and choose the journey that fits the operation.'],
  ['05','Operational alerts','Keep important events visible so teams can respond quickly.'],
  ['06','Reports','Bring route and fleet activity together for clearer operational review.']
];
const howData = [
  ['01','Enter a journey','Provide origin, destination and journey details.'],
  ['02','Review conditions','Bring traffic, weather, incidents and road conditions into the route review.'],
  ['03','Review the route','The dashboard can display risk factors, alternatives and operational context.'],
  ['04','Take action','Dispatch teams can respond using connected fleet and incident data.']
];

const $ = id => document.getElementById(id);

function renderPublicSections(){
  $('featureGrid').innerHTML = featureData.map(([n,t,p]) => `<div class="col-md-6 col-lg-4"><article class="feature-card"><div class="feature-number">${n}</div><h5>${t}</h5><p>${p}</p></article></div>`).join('');
  $('howGrid').innerHTML = howData.map(([n,t,p]) => `<div class="col-md-6 col-lg-3"><article class="how-step"><div class="step-no">${n}</div><h5>${t}</h5><p>${p}</p></article></div>`).join('');
}

function openAuth(mode='login'){
  state.authMode = mode;
  const signup = mode === 'signup';
  $('authTitle').textContent = signup ? 'Create your account' : 'Sign in';
  $('authSubtitle').textContent = signup ? 'Create your RouteGuard workspace.' : 'Access your RouteGuard workspace.';
  $('authSubmit').textContent = signup ? 'Create account' : 'Log in';
  $('signupNameWrap').classList.toggle('d-none', !signup);
  $('authRoleWrap').classList.toggle('d-none', !signup);
  $('authSwitch').innerHTML = signup
    ? `Already have an account? <button type="button" onclick="openAuth('login')">Log in</button>`
    : `Don't have an account? <button type="button" onclick="openAuth('signup')">Create one</button>`;
  bootstrap.Modal.getOrCreateInstance($('authModal')).show();
}

function initPublicMap(){
  if (state.maps.public || !$('publicMap')) return;
  state.maps.public = L.map('publicMap',{zoomControl:false,scrollWheelZoom:false,dragging:false}).setView([23.35,77.65],8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(state.maps.public);
}

function initDashboardMap(){
  if (state.maps.dashboard || !$('dashboardMap')) return;
  state.maps.dashboard = L.map('dashboardMap').setView([23.35,77.65],8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(state.maps.dashboard);
}

function initRouteMap(){
  if (state.maps.route){ state.maps.route.invalidateSize(); return; }
  state.maps.route = L.map('routeMap').setView([23.35,77.65],8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(state.maps.route);
}

function showPage(page){
  document.querySelectorAll('.side-link[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  const target = $(`page-${page}`);
  if(target) target.classList.add('active');
  const labels = {overview:'Overview',route:'Route analysis',routes:'My routes',fleet:'Fleet',incidents:'Incidents',alerts:'Alerts',reports:'Reports',settings:'Settings'};
  $('pageTitle').textContent = labels[page] || 'Overview';
  if(page === 'overview') setTimeout(() => { initDashboardMap(); state.maps.dashboard?.invalidateSize(); },80);
 if (page === 'route') {
  setTimeout(() => state.maps.route?.invalidateSize(), 80);
}
  if(window.innerWidth < 992) $('sidebar').classList.remove('open');
}

function toggleSidebar(){ $('sidebar').classList.toggle('open'); }

function enterFrontendDashboard(){
  $('publicApp').classList.add('d-none');
  $('dashboardApp').classList.remove('d-none');
  showPage('overview');
  setTimeout(() => { initDashboardMap(); state.maps.dashboard?.invalidateSize(); },80);
}

$('authForm').addEventListener('submit', e => e.preventDefault());
$('publicRouteForm').addEventListener('submit', e => e.preventDefault());
$('routeForm').addEventListener('submit', async e => {
  e.preventDefault();

  const origin = $('routeOrigin').value.trim();
  const destination = $('routeDestination').value.trim();
  const button = $('routeForm').querySelector('button[type="submit"]');

  if (!origin || !destination) return;

  button.disabled = true;
  button.textContent = 'Analyzing...';

  try {
    const response = await fetch(
      'http://127.0.0.1:5000/api/routes/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ origin, destination })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to analyze route.');
    }

    // Show the result panel before initializing the map.
    $('routeResult').classList.remove('d-none');

    // Initialize the map now that its container is visible.
    initRouteMap();

    const map = state.maps.route;

    // Remove the previous route when analyzing a new journey.
    if (state.routeLayer) {
      map.removeLayer(state.routeLayer);
    }

    // Draw the road route returned by OSRM.
    state.routeLayer = L.geoJSON(data.geometry, {
      style: {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85
      }
    }).addTo(map);

    // Fit the map around the entire route.
    map.fitBounds(state.routeLayer.getBounds(), {
      padding: [30, 30]
    });

    map.invalidateSize();

    $('resultRouteTitle').textContent =
      `${origin} → ${destination}`;

    $('riskBadge').textContent = 'Risk pending';
    $('riskScore').textContent = '—';

    $('riskSummary').textContent =
      `Road distance: ${data.distance_km} km. ` +
      `Estimated driving time: ${data.duration_minutes} minutes. ` +
      'Risk assessment is not connected yet.';

  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Analyze route';
  }
});
$('incidentForm').addEventListener('submit', e => e.preventDefault());
$('profileForm').addEventListener('submit', e => e.preventDefault());

document.querySelectorAll('.side-link[data-page]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));

function renderEmptyFrontendState(){
  $('overviewAlerts').innerHTML = '<div class="empty-state"><strong>No alerts yet.</strong><span>There are no operational alerts to review.</span></div>';
  $('recentRoutes').innerHTML = '<div class="empty-state"><strong>No route checks yet.</strong><span>Route history will appear here when records are available.</span></div>';
  $('fleetTable').innerHTML = '<tr><td colspan="5"><div class="empty-state"><strong>No fleet data yet.</strong><span>Vehicle information will appear here when records are available.</span></div></td></tr>';
  $('incidentGrid').innerHTML = '<div class="col-12"><div class="empty-state"><strong>No incidents yet.</strong><span>Incident records will appear here when records are available.</span></div></div>';
  $('alertList').innerHTML = '<div class="empty-state"><strong>No alerts yet.</strong><span>Operational alerts will appear here when records are available.</span></div>';
  $('savedRoutesList').innerHTML = '<div class="empty-state"><strong>No saved routes yet.</strong><span>Saved journeys will appear here when records are available.</span></div>';
  $('barChart').innerHTML = '<div class="empty-state"><strong>No report data yet.</strong><span>Charts and metrics will appear here when records are available.</span></div>';
  if ($('riskDistribution')) $('riskDistribution').innerHTML = '<strong>No risk data yet.</strong><span>Risk distribution will appear here when records are available.</span>';
}

renderPublicSections();
initPublicMap();
renderEmptyFrontendState();

if (window.location.hash === '#dashboard') enterFrontendDashboard();

// Initialisation de la connexion Supabase
const SUPABASE_URL = "https://dicuiejxstwgcktmafrq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pDa2WjyKlV7f1ax6rgsoSg_Oa41pWpk";

const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DICTIONNAIRE DES RAPPORTS POWER BI ---
const reports = {
    commercial: {
        title: "Domaine Commercial",
        desc: "Analyse des ventes, du chiffre d'affaires et du portefeuille client.",
        url: "https://app.powerbi.com/reportEmbed?reportId=7f441fbb-1240-495d-8ac8-c9971ec316e7&autoAuth=true",
        filterType: "Region"
    },
    technique: {
        title: "Domaine Technique",
        desc: "Suivi des infrastructures, interventions et exploitation.",
        url: "https://app.powerbi.com/reportEmbed?reportId=d6921fde-f934-4933-9db0-b069592d4284&autoAuth=true",
        filterType: "Region"
    },
    facturation: {
        title: "Domaine Facturation",
        desc: "Suivi des abonnés facturés, du CA et des créances.",
        url: "https://app.powerbi.com/reportEmbed?reportId=7f441fbb-1240-495d-8ac8-c9971ec316e7&autoAuth=true",
        filterType: "Departement"
    },
    branchement: {
        title: "Domaine Branchement",
        desc: "Gestion des nouvelles demandes de branchements et délais.",
        url: "https://app.powerbi.com/reportEmbed?reportId=dd5d2d5e-e0a9-460b-8086-1ef623f62a21&autoAuth=true",
        filterType: "Departement"
    },
    reclamation: {
        title: "Domaine Réclamation",
        desc: "Suivi de la satisfaction client, tickets et litiges.",
        url: "https://app.powerbi.com/reportEmbed?reportId=919b48ef-66c1-4acc-980c-7cc3f57699b5&autoAuth=true",
        filterType: "Region"
    },
    recouvrement: {
        title: "Domaine Recouvrement",
        desc: "Suivi du recouvrement, factures émises et créances.",
        url: "https://app.powerbi.com/reportEmbed?reportId=9bb00ff3-e23f-480c-a793-e38a10142b7a&autoAuth=true",
        filterType: "Departement"
    }
};

let currentUserSession = null;

// --- GESTION DE LA NAVIGATION & CONNEXION ---

// 1. Afficher la page de connexion
function toggleAuth() {
    document.getElementById("landing-page").style.display = "none";
    document.getElementById("login-section").style.display = "flex";
}

// 2. Revenir à l'accueil public
function showLandingPage() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("landing-page").style.display = "block";
}

// 3. Authentification Supabase
async function handleLogin(event) {
    event.preventDefault();
    
    const orgInput = document.getElementById("org-input").value.trim().toUpperCase();
    const pwdInput = document.getElementById("password-input").value.trim();
    const errorMsg = document.getElementById("error-message");

    if (errorMsg) {
        errorMsg.style.color = "#2563eb";
        errorMsg.textContent = "Vérification des accès en cours...";
    }

    try {
        const { data: users, error } = await sbClient
            .from('users_agency')
            .select('*')
            .eq('username', orgInput)
            .eq('password_hash', pwdInput);

        if (error) throw error;

        if (users && users.length > 0) {
            currentUserSession = users[0];
            
            // Masquer la mire de connexion
            document.getElementById("login-section").style.display = "none";

            // Mise à jour de l'en-tête
            document.getElementById("auth-btn").style.display = "none";
            const logoutBtn = document.getElementById("btn-logout-agency");
            const logoutNameElem = document.getElementById("logout-agency-name");
            
            if (logoutBtn) logoutBtn.style.display = "inline-block";
            if (logoutNameElem) logoutNameElem.textContent = `(${currentUserSession.username})`;

            // Afficher le Dashboard
            document.getElementById("dashboard-layout").style.display = "flex";
            
            // Mettre à jour la fiche d'identité de l'agence
            updateAgencyDashboard(currentUserSession);

        } else {
            if (errorMsg) {
                errorMsg.style.color = "#dc2626";
                errorMsg.textContent = "Nom d'agence ou mot de passe incorrect.";
            }
        }

    } catch (err) {
        console.error("Erreur Supabase :", err);
        if (errorMsg) {
            errorMsg.style.color = "#dc2626";
            errorMsg.textContent = "Erreur de connexion au serveur.";
        }
    }
}

// Mettre à jour les informations d'agence
function updateAgencyDashboard(user) {
    const titleElem = document.getElementById("agency-title-display");
    const panelName = document.getElementById("panel-agency-name");
    const panelRegion = document.getElementById("panel-region-name");
    const sidebarTitle = document.getElementById("sidebar-agency-title");

    if (titleElem) titleElem.textContent = `Bienvenue - Agence de ${user.username}`;
    if (panelName) panelName.textContent = `Agence ${user.username}`;
    if (panelRegion) panelRegion.textContent = user.region_filter || "Toutes Régions";
    if (sidebarTitle) sidebarTitle.textContent = user.username;
}

// Revenir à la vue d'accueil Agence
function goToAgencyHome() {
    const agencyPage = document.getElementById("agency-welcome-page");
    const homeGrid = document.getElementById("dashboard-home-grid");
    const reportHeader = document.getElementById("report-header-block");
    const wrapperElem = document.querySelector(".powerbi-wrapper");

    if (agencyPage) agencyPage.style.display = "flex";
    if (homeGrid) homeGrid.style.display = "none";
    if (reportHeader) reportHeader.style.display = "none";
    if (wrapperElem) wrapperElem.style.display = "none";
}

// Ouverture de la grille des domaines
function openDomainsView() {
    const sidebar = document.getElementById("main-sidebar");
    const agencyPage = document.getElementById("agency-welcome-page");
    const homeGrid = document.getElementById("dashboard-home-grid");

    if (agencyPage) agencyPage.style.display = "none";
    if (sidebar) sidebar.style.display = "block";
    if (homeGrid) homeGrid.style.setProperty('display', 'grid', 'important');
}

// Chargement d'un rapport Power BI
function loadReport(domainKey) {
    const agencyPage = document.getElementById("agency-welcome-page");
    const homeGrid = document.getElementById("dashboard-home-grid");
    const reportHeader = document.getElementById("report-header-block");
    const frameElem = document.getElementById("powerbi-frame");
    const wrapperElem = document.querySelector(".powerbi-wrapper");

    const titleElem = document.getElementById("report-title");
    const descElem = document.getElementById("report-description");

    const selectedReport = reports[domainKey];
    if (!selectedReport) return;

    if (agencyPage) agencyPage.style.display = "none";
    if (homeGrid) homeGrid.style.setProperty('display', 'none', 'important');

    if (reportHeader) reportHeader.style.display = "block";
    if (titleElem) titleElem.textContent = selectedReport.title;
    if (descElem) descElem.textContent = selectedReport.desc;

    if (wrapperElem) wrapperElem.style.display = "block";
    if (frameElem) frameElem.style.display = "block";

    let targetUrl = selectedReport.url;
    if (currentUserSession) {
        let tableAndColumn = (selectedReport.filterType === "Departement") ? "Agence/Departement" : "Agence/Region";
        let filterValue = (selectedReport.filterType === "Departement") ? currentUserSession.dept_filter : currentUserSession.region_filter;

        if (filterValue && filterValue !== "TOUT") {
            const separator = targetUrl.includes('?') ? '&' : '?';
            targetUrl += `${separator}$filter=${tableAndColumn} eq '${filterValue}'`;
        }
    }

    if (frameElem) frameElem.src = targetUrl;

    const menuItems = document.querySelectorAll(".sidebar-menu li");
    menuItems.forEach(item => item.classList.remove("active"));
    const activeItem = document.getElementById("menu-" + domainKey);
    if (activeItem) activeItem.classList.add("active");
}

// Déconnexion
function logout() {
    currentUserSession = null;

    document.getElementById("auth-btn").style.display = "inline-block";
    document.getElementById("btn-logout-agency").style.display = "none";

    document.getElementById("dashboard-layout").style.display = "none";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("landing-page").style.display = "block";
}

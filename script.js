// --- BASE DE DONNÉES UTILISATEURS ET AGENCES ---
const USERS_DATABASE = [
    {
        username: "FLEXEAU",
        password: "Nfn@26",
        role: "DIRECTION",
        regionFilter: "TOUT",
        deptFilter: "TOUT",
        displayName: "Direction Générale"
    },
    {
        username: "KAFFRINE",
        password: "Nfn@26",
        role: "AGENT",
        regionFilter: "Kaffrine",
        deptFilter: "Kaffrine",
        displayName: "Agence de Kaffrine"
    },
    {
        username: "KAOLACK",
        password: "Nfn@26",
        role: "AGENT",
        regionFilter: "Kaolack",
        deptFilter: "Kaolack",
        displayName: "Agence de Kaolack"
    },
    {
        username: "NIORO",
        password: "Nfn@26",
        role: "AGENT",
        regionFilter: "Nioro",
        deptFilter: "Nioro",
        displayName: "Agence de Nioro du Rip"
    },
    {
        username: "KOUNGHEUL",
        password: "Nfn@26",
        role: "AGENT",
        regionFilter: "Koungheul",
        deptFilter: "Koungheul",
        displayName: "Agence de Koungheul"
    }
];

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
let isLoggedIn = false;

// --- GESTION DE LA CONNEXION ---
function toggleAuth() {
    if (isLoggedIn) {
        // Déconnexion
        isLoggedIn = false;
        currentUserSession = null;
        document.getElementById("auth-btn").textContent = "Se connecter";
        document.getElementById("dashboard-layout").style.display = "none";
        document.getElementById("login-section").style.display = "none";
        document.getElementById("landing-page").style.display = "block";
    } else {
        // Ouvrir la page de connexion
        document.getElementById("landing-page").style.display = "none";
        document.getElementById("login-section").style.display = "flex";
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const orgInput = document.getElementById("org-input").value.trim().toUpperCase();
    const pwdInput = document.getElementById("password-input").value;
    const errorMsg = document.getElementById("error-message");

    const user = USERS_DATABASE.find(u => u.username === orgInput && u.password === pwdInput);

    if (user) {
        currentUserSession = user;
        isLoggedIn = true;

        // 1. Masquer la landing page et la connexion
        document.getElementById("landing-page").style.display = "none";
        document.getElementById("login-section").style.display = "none";

        // 2. Basculer l'affichage des boutons dans le header
        document.getElementById("auth-btn").style.display = "none";
        
        const logoutBtn = document.getElementById("btn-logout-agency");
        const logoutNameElem = document.getElementById("logout-agency-name");
        
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (logoutNameElem) logoutNameElem.textContent = `(${user.username})`;

        // 3. Afficher le dashboard et charger la vue d'accueil
        document.getElementById("dashboard-layout").style.display = "flex";
        
        const titleElem = document.getElementById("agency-title-display");
        const perimeterElem = document.getElementById("agency-perimeter-display");
        if (titleElem) titleElem.textContent = `Agence de ${user.username}`;
        if (perimeterElem) perimeterElem.textContent = user.regionFilter;

        goToAgencyHome();

    } else {
        if (errorMsg) errorMsg.textContent = "Identifiants incorrects.";
    }
}

// Fonction de déconnexion
function logout() {
    isLoggedIn = false;
    currentUserSession = null;

    // Réafficher le bouton "Se connecter" et cacher le bouton de déconnexion
    document.getElementById("auth-btn").style.display = "inline-block";
    document.getElementById("btn-logout-agency").style.display = "none";

    // Revenir à la page d'accueil publique
    document.getElementById("dashboard-layout").style.display = "none";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("landing-page").style.display = "block";
}
// --- ÉTAPE 2 : OUVERTURE DE LA VUE DOMAINES (AVEC SIDEBAR) ---
function openDomainsView() {
    const sidebar = document.getElementById("main-sidebar");
    const agencyPage = document.getElementById("agency-welcome-page");
    const homeGrid = document.getElementById("dashboard-home-grid");

    if (agencyPage) agencyPage.style.display = "none";
    if (sidebar) sidebar.style.display = "block";
    if (homeGrid) homeGrid.style.setProperty('display', 'grid', 'important');
}

// --- ÉTAPE 3 : CHARGEMENT D'UN RAPPORT POWER BI ---
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

    // Masquer les accueils
    if (agencyPage) agencyPage.style.display = "none";
    if (homeGrid) homeGrid.style.setProperty('display', 'none', 'important');

    // Mettre à jour le titre
    if (reportHeader) reportHeader.style.display = "block";
    if (titleElem) titleElem.textContent = selectedReport.title;
    if (descElem) descElem.textContent = selectedReport.desc;

    // Afficher la zone iframe
    if (wrapperElem) wrapperElem.style.display = "block";
    if (frameElem) frameElem.style.display = "block";

    // Générer l'URL filtrée
    let targetUrl = selectedReport.url;
    if (currentUserSession && currentUserSession.role === "AGENT") {
        let tableAndColumn = (selectedReport.filterType === "Departement") ? "Agence/Departement" : "Agence/Region";
        let filterValue = (selectedReport.filterType === "Departement") ? currentUserSession.deptFilter : currentUserSession.regionFilter;

        if (filterValue && filterValue !== "TOUT") {
            const separator = targetUrl.includes('?') ? '&' : '?';
            targetUrl += `${separator}$filter=${tableAndColumn} eq '${filterValue}'`;
        }
    }

    if (frameElem) frameElem.src = targetUrl;

    // Menu actif
    const menuItems = document.querySelectorAll(".sidebar-menu li");
    menuItems.forEach(item => item.classList.remove("active"));
    const activeItem = document.getElementById("menu-" + domainKey);
    if (activeItem) activeItem.classList.add("active");
}
function updateAgencyDashboard(agencyName) {
    // 1. Mise à jour du bouton de déconnexion personnalisé
    const logoutNameElem = document.getElementById("logout-agency-name");
    if (logoutNameElem) {
        logoutNameElem.textContent = `(${agencyName})`;
    }

    // 2. Mise à jour des titres et perimètres de la page
    const titleElem = document.getElementById("agency-title-display");
    const perimeterElem = document.getElementById("agency-perimeter-display");

    if (titleElem) titleElem.textContent = `Agence de ${agencyName}`;
    if (perimeterElem) perimeterElem.textContent = agencyName;
}

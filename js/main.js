/* ==========================================
   TRACKTIME V2
   MAIN.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    highlightNavigation();
    smoothScrolling();
    setupScrollAnimations();
    setupNavbar();
    updateCopyright();

});

/* ==========================================
   NAVIGATION
========================================== */

function highlightNavigation() {

    const currentPage = location.pathname.split("/").pop();

    document.querySelectorAll(".buttons a").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        }

    });

}

/* ==========================================
   SMOOTH SCROLL
========================================== */

function smoothScrolling() {

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

    });

}

/* ==========================================
   SCROLL ANIMATION
========================================== */

function setupScrollAnimations() {

    const elements = document.querySelectorAll(

        ".card, .feature, .stream-card, .chart-box, .member-card"

    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold: .15

    });

    elements.forEach(element => {

        element.classList.add("hidden-card");

        observer.observe(element);

    });

}

/* ==========================================
   NAVBAR EFFECT
========================================== */

function setupNavbar() {

    const navbar = document.querySelector(".topbar");

    if (!navbar) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 20) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    });

}

/* ==========================================
   COPYRIGHT
========================================== */

function updateCopyright() {

    const element = document.getElementById("copyright");

    if (!element) return;

    element.textContent =
        `© ${new Date().getFullYear()} TrackTime`;

}

/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(date) {

    return new Date(date).toLocaleDateString("de-DE", {

        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"

    });

}

/* ==========================================
   TIME FORMAT
========================================== */

function formatTime(time) {

    return time.slice(0, 5);

}

/* ==========================================
   COUNTDOWN
========================================== */

function getCountdown(date, time) {

    const target = new Date(`${date}T${time}`);

    const now = new Date();

    const diff = target - now;

    if (diff <= 0) {

        return "LIVE";

    }

    const days = Math.floor(diff / 86400000);

    const hours = Math.floor(diff % 86400000 / 3600000);

    const minutes = Math.floor(diff % 3600000 / 60000);

    return `${days}d ${hours}h ${minutes}m`;

}

/* ==========================================
   TOAST
========================================== */

function showToast(message, success = true) {

    let toast = document.createElement("div");

    toast.className = "toast";

    if (!success) {

        toast.classList.add("error");

    }

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 10);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/* ==========================================
   LOADING
========================================== */

function showLoading(button) {

    button.disabled = true;

    button.dataset.oldText = button.innerHTML;

    button.innerHTML = "Lädt...";

}

function hideLoading(button) {

    button.disabled = false;

    button.innerHTML = button.dataset.oldText;

}

/* ==========================
   SCROLL ANIMATION
========================== */

.hidden-card{

    opacity:0;

    transform:translateY(35px);

    transition:.6s;

}

.show{

    opacity:1;

    transform:translateY(0);

}

/* ==========================
   NAVBAR
========================== */

.topbar.scrolled{

    background:rgba(5,5,5,.92);

    box-shadow:0 0 25px rgba(225,6,0,.18);

}

/* ==========================
   ACTIVE NAVIGATION
========================== */

.buttons a.active{

    background:#e10600;

    border-color:#e10600;

}

/* ==========================
   TOAST
========================== */

.toast{

    position:fixed;

    right:20px;

    bottom:20px;

    background:#1d1d1d;

    color:white;

    padding:14px 20px;

    border-left:4px solid #00c853;

    border-radius:12px;

    opacity:0;

    transform:translateY(30px);

    transition:.3s;

    z-index:9999;

}

.toast.show{

    opacity:1;

    transform:translateY(0);

}

.toast.error{

    border-left-color:#e10600;

}
const CACHE_NAME = "mobile-flex-v1";
const urlsToCache = [
  "/", // main entry point
  "/index.html",
  "/apple-touch-icon.png",

  // Attachments
  "/attachments/2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/2025-04_Versailles_Tickets.pdf",
  "/attachments/202504_MyBankInsurance.pdf",
  "/attachments/activiti_tickets/2025-04_Versailles_Tickets_Garam.pdf",
  "/attachments/activiti_tickets/2025-04_Versailles_Tickets_Hoin.pdf",
  "/attachments/activiti_tickets/2025-04_Versailles_Tickets_Jisu.pdf",
  "/attachments/activiti_tickets/2025-04_Versailles_Tickets_Misoon.pdf",
  "/attachments/activiti_tickets/garam_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activiti_tickets/garam_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activiti_tickets/hoin_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activiti_tickets/hoin_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activiti_tickets/jisu_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activiti_tickets/jisu_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activiti_tickets/Louvre-tickets_Garam_V25078574340.pdf",
  "/attachments/activiti_tickets/Louvre-tickets_Hoin_V25078574340.pdf",
  "/attachments/activiti_tickets/Louvre-tickets_Jisu_V25078574340.pdf",
  "/attachments/activiti_tickets/Louvre-tickets_Misoon_V25078574340.pdf",
  "/attachments/activiti_tickets/misoon_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activiti_tickets/misoon_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",

  // Add more paths here as needed for your app (images, CSS, JS, JSON, etc.)
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
});

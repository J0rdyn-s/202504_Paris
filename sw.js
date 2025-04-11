const CACHE_NAME = "202504_Paris";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/apple-touch-icon.png",

  // CSS
  "/css/cruise_route.css",
  "/css/detail.css",
  "/css/main_style.css",
  "/css/menu_detail.css",
  "/css/style.css",
  "/css/ticket_detail.css",
  "/css/wishlist.css",

  // JS
  "/js/lang-switch.js",
  "/js/script.js",
  "/js/ticket_loader.js",
  "/js/wishlist.js",

  // JSON
  "/json/json creater.txt",
  "/json/page_meta.json",
  "/json/tickets.json",
  "/json/wishlist.json",

  // Lang
  "/lang/properties_en.properties",
  "/lang/properties_kr.properties",

  // Main
  "/main/main.html",
  "/main/main_script.js",
  "/main/travel_info_en.json",
  "/main/travel_info_kr.json",

  // HTML pages
  "/html/wishlist.html",

  // More Info Pages
  "/more_info/ceremony_order_en.html",
  "/more_info/ceremony_order_kr.html",
  "/more_info/cruise_bateaux_parisiens_en.html",
  "/more_info/cruise_bateaux_parisiens_kr.html",
  "/more_info/detail_template.html",
  "/more_info/reception_menu_choices_kr.html",

  // Tickets HTML
  "/tickets_html/ticket_20250421_arex.html",
  "/tickets_html/ticket_Louvre-Museum.html",
  "/tickets_html/ticket_Musee_de_l'Orangerie.html",
  "/tickets_html/ticket_Palace_of_Versailles.html",
  "/tickets_html/ticket_Sainte-Chapelle.html",

  // Daily Schedules
  "/daily_schedule/20250411_Schedule.json",
  "/daily_schedule/20250412_Schedule.json",
  "/daily_schedule/20250413_Schedule.json",
  "/daily_schedule/20250414_Schedule.json",
  "/daily_schedule/20250415_Schedule.json",
  "/daily_schedule/20250416_Schedule.json",
  "/daily_schedule/20250417_Schedule.json",
  "/daily_schedule/20250418_Schedule.json",
  "/daily_schedule/20250419_Schedule.json",
  "/daily_schedule/20250420_Schedule.json",
  "/daily_schedule/20250421_Schedule.json",

  // Attachments (Main)
  "/attachments/2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/2025-04_Versailles_Tickets.pdf",
  "/attachments/202504_MyBankInsurance.pdf",
  "/attachments/AsianaAirlines_Booking_Confirmation.pdf",
  "/attachments/citizenM_NSDUZSFU.pdf",
  "/attachments/DCNOEOOH_SNZXOIRO.pdf",
  "/attachments/E-ticket_9882487732798_(HWANG_MISOON_MS).pdf",
  "/attachments/E-ticket_9882487732799_(SONG_JISU_MS).pdf",
  "/attachments/E-ticket_9882487732800_(SONG_GARAM_MS).pdf",
  "/attachments/E-ticket_9882487732801_(SONG_HOIN_MR).pdf",
  "/attachments/ERFSAVIH.pdf",
  "/attachments/ERFSAVIH_1688888387704641_E-receipt.pdf",
  "/attachments/ERFSAVIH_English_Check-in_Voucher_(For_Visa Application).pdf",
  "/attachments/ERFSAVIH_Trip.com_hotel_Confirmation_1688888387704641.pdf",
  "/attachments/FKYZODBS.pdf",
  "/attachments/FKYZODBS_1688888387653103_E-receipt.pdf",
  "/attachments/FKYZODBS_English_Check-in_Voucher_(For_Visa Application).pdf",
  "/attachments/FKYZODBS_Trip.com_hotel_Confirmation_1688888387653103.pdf",
  "/attachments/insurance.pdf",
  "/attachments/Louvre-tickets_V25078574340.pdf",
  "/attachments/Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/파리-전도_가로.pdf",

  // Attachments - activity_tickets
  "/attachments/2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/2025-04_Versailles_Tickets.pdf",
  "/attachments/202504_MyBankInsurance.pdf",
  "/attachments/activity_tickets/2025-04_Versailles_Tickets_Garam.pdf",
  "/attachments/activity_tickets/2025-04_Versailles_Tickets_Hoin.pdf",
  "/attachments/activity_tickets/2025-04_Versailles_Tickets_Jisu.pdf",
  "/attachments/activity_tickets/2025-04_Versailles_Tickets_Misoon.pdf",
  "/attachments/activity_tickets/garam_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activity_tickets/garam_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activity_tickets/hoin_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activity_tickets/hoin_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activity_tickets/jisu_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activity_tickets/jisu_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/activity_tickets/Louvre-tickets_Garam_V25078574340.pdf",
  "/attachments/activity_tickets/Louvre-tickets_Hoin_V25078574340.pdf",
  "/attachments/activity_tickets/Louvre-tickets_Jisu_V25078574340.pdf",
  "/attachments/activity_tickets/Louvre-tickets_Misoon_V25078574340.pdf",
  "/attachments/activity_tickets/misoon_2025-04_Sainte-Chapelle_Tickets.pdf",
  "/attachments/activity_tickets/misoon_Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/attachments/Musee_de_l'Orangerie_Tickets_2506919687500400568.pdf",
  "/tickets_html/ticket_Musee_de_l'Orangerie.html",

  // Attachments - ect
  "/attachments/ect/hoin_esim.PNG",
  "/attachments/ect/misoon_esim.PNG",

  // Attachments - transportation_tickets
  "/attachments/transportation_tickets/20250421_arex_1.jpg",
  "/attachments/transportation_tickets/20250421_arex_2.jpg",
  "/attachments/transportation_tickets/20250421_arex_3.jpg",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Intercepting:", event.request.url); // ✅ Add this line
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed with status ${response.status}`);
          await cache.put(url, response.clone());
        } catch (err) {
          console.warn(`[SW] Skipping ${url}: ${err.message}`);
        }
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
});

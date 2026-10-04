import type { ProfileCareer } from "./data";

/** Where each Top 3 card crops its career photo (object-position), keyed by
 *  photo path so two careers sharing a poster share a crop.
 *
 *  Why (Joshua, 4 Oct 2026): some Top 3 cards cut the person's head off, or
 *  showed mostly body, because every photo used one shared "50% 25%" crop.
 *  The posters are portrait (about 2:3) and the card shows a 16:10 window,
 *  so less than half the height is visible and where it lands matters.
 *
 *  How: each photo's face was found with Apple's Vision face detector, then
 *  the window was placed so the face centre sits about 38% down the crop
 *  (head in the top half) while keeping the crown in frame, clamped to the
 *  image. Every crop was then checked by eye on a contact sheet. Only the
 *  16:10 card uses this map; Home and Connect's own tiles keep
 *  `photoFocus` (data.ts), which is tuned for their own shapes.
 *
 *  A photo not listed here uses "50% 25%" (no readable face, or that
 *  default was already right). Re-run the check when a new poster joins
 *  the catalog. Hand overrides: fashion-buyer and pediatric-surgeon pin to
 *  the top (no face the detector can read, head at the very top);
 *  auto-mechanic is set by eye (the face is larger than the window). */
const TOP3_PHOTO_FOCUS: Record<string, string> = {
  "/images/app/poster-investment-banking-v3.webp": "50% 36%", // investment-banking
  "/images/app/poster-airline-pilot-alt.webp": "50% 63%", // airline-pilot
  "/images/app/poster-private-equity.webp": "50% 22%", // private-equity
  "/images/app/poster-software-engineer.webp": "50% 12%", // software-engineer
  "/images/app/poster-registered-nurse.webp": "50% 8%", // registered-nurse
  "/images/app/poster-asset-management.webp": "50% 57%", // asset-management
  "/images/app/poster-food-scientist.webp": "50% 12%", // food-scientist
  "/images/app/poster-data-scientist.webp": "50% 54%", // data-scientist
  "/images/app/poster-fashion-buyer.webp": "50% 0%", // fashion-buyer
  "/images/app/poster-game-designer.webp": "50% 54%", // game-designer
  "/images/app/poster-accountant.webp": "50% 13%", // accountant
  "/images/app/poster-uiux-designer.webp": "50% 42%", // ui-ux-designer
  "/images/app/poster-video-game-designer.webp": "50% 53%", // video-game-designer
  "/images/app/poster-cyber-security.webp": "50% 30%", // cyber-security
  "/images/app/poster-farm-ranch-manager.webp": "50% 5%", // farm-and-ranch-manager
  "/images/app/poster-agricultural-technician.webp": "50% 31%", // agricultural-technician
  "/images/app/poster-electrician.webp": "50% 30%", // electrician
  "/images/app/poster-roofer.webp": "50% 16%", // roofer
  "/images/app/poster-truck-driver.webp": "50% 12%", // truck-driver
  "/images/app/poster-school-counselor.webp": "50% 27%", // school-counselor
  "/images/app/poster-air-traffic-controller.webp": "50% 63%", // air-traffic-controller
  "/images/app/poster-sports-medicine-doctor.webp": "50% 0%", // sports-medicine-doctor
  "/images/app/poster-animator.webp": "50% 0%", // animator
  "/images/app/poster-hr-manager.webp": "50% 36%", // hr-manager
  "/images/app/poster-quant.webp": "50% 82%", // quant
  "/images/app/poster-management-analyst.webp": "50% 22%", // management-analyst
  "/images/app/poster-administrative-assistant.webp": "50% 20%", // administrative-assistant
  "/images/app/poster-art-director.webp": "50% 0%", // art-director
  "/images/app/poster-film-director.webp": "50% 0%", // film-director
  "/images/app/poster-journalist.webp": "50% 0%", // journalist
  "/images/app/poster-sound-engineering-technician.webp": "50% 26%", // sound-engineering-technician
  "/images/app/poster-lighting-technician.webp": "50% 42%", // lighting-technician
  "/images/app/poster-forestry-technician.webp": "50% 53%", // forestry-technician
  "/images/app/poster-sheet-metal-worker.webp": "50% 21%", // sheet-metal-worker
  "/images/app/poster-forklift-operator.webp": "50% 31%", // forklift-operator
  "/images/app/poster-hairstylist.webp": "50% 23%", // hairstylist
  "/images/app/poster-emergency-medicine-doctor.webp": "50% 0%", // emergency-medicine-doctor
  "/images/app/poster-nurse-anesthetist.webp": "50% 9%", // nurse-anesthetist
  "/images/app/poster-lawyer.webp": "50% 19%", // lawyer
  "/images/app/poster-therapist.webp": "50% 18%", // therapist
  "/images/app/poster-database-architect.webp": "50% 67%", // database-architect
  "/images/app/poster-drone-pilot.webp": "50% 26%", // drone-pilot
  "/images/app/poster-jewelry-designer.webp": "50% 19%", // jewelry-designer
  "/images/app/browse/mental-health-social-worker.webp": "50% 24%", // mental-health-social-worker
  "/images/app/browse/urban-planner.webp": "50% 38%", // urban-planner
  "/images/app/browse/judicial-law-clerk.webp": "50% 1%", // judicial-law-clerk
  "/images/app/browse/environment-scientist.webp": "50% 34%", // environmental-scientist
  "/images/app/browse/principal.webp": "50% 18%", // principal
  "/images/app/browse/community-program-manager.webp": "50% 14%", // community-program-manager
  "/images/app/browse/detective.webp": "50% 16%", // detective
  "/images/app/poster-pediatric-surgeon.webp": "50% 0%", // pediatric-surgeon
  "/images/app/poster-purchasing-manager.webp": "50% 8%", // purchasing-manager
  "/images/app/poster-cardiologist.webp": "50% 60%", // cardiologist
  "/images/app/poster-public-relations-manager.webp": "50% 0%", // public-relations-manager
  "/images/app/poster-veterinarian.webp": "50% 10%", // veterinarian
  "/images/app/browse/actor.webp": "50% 6%", // actor
  "/images/app/browse/audio-and-video-technician.webp": "50% 6%", // audio-and-video-technician
  "/images/app/browse/broadcast-technician.webp": "50% 11%", // broadcast-technician
  "/images/app/browse/choreographer.webp": "50% 2%", // choreographer
  "/images/app/browse/coach-or-scout.webp": "50% 41%", // coach-or-scout
  "/images/app/browse/court-reporter-or-captioner.webp": "50% 20%", // court-reporter-or-captioner
  "/images/app/browse/dancer.webp": "50% 21%", // dancer
  "/images/app/browse/fashion-designer.webp": "50% 47%", // fashion-designer
  "/images/app/browse/floral-designer.webp": "50% 52%", // floral-designer
  "/images/app/browse/game-producer.webp": "50% 0%", // game-producer
  "/images/app/browse/graphic-designer.webp": "50% 27%", // graphic-designer
  "/images/app/browse/interior-designer.webp": "50% 26%", // interior-designer
  "/images/app/browse/interpreter-or-translator.webp": "50% 33%", // interpreter-or-translator
  "/images/app/browse/musician-or-singer.webp": "50% 8%", // musician-or-singer
  "/images/app/browse/public-relations-specialist.webp": "50% 14%", // public-relations-specialist
  "/images/app/browse/set-designer.webp": "50% 27%", // set-designer
  "/images/app/browse/writer-or-copywriter.webp": "50% 47%", // writer-or-copywriter
  "/images/app/browse/bricklayer.webp": "50% 15%", // bricklayer
  "/images/app/browse/building-inspector.webp": "50% 18%", // building-inspector
  "/images/app/browse/carpenter.webp": "50% 30%", // carpenter
  "/images/app/browse/concrete-finisher.webp": "50% 0%", // concrete-finisher
  "/images/app/browse/construction-foreman.webp": "50% 23%", // construction-foreman
  "/images/app/browse/construction-laborer.webp": "50% 37%", // construction-laborer
  "/images/app/browse/construction-manager.webp": "50% 23%", // construction-manager
  "/images/app/browse/drywall-installer.webp": "50% 32%", // drywall-installer
  "/images/app/browse/elevator-technician.webp": "50% 43%", // elevator-technician
  "/images/app/browse/glazier.webp": "50% 13%", // glazier
  "/images/app/browse/hazardous-materials-worker.webp": "50% 36%", // hazardous-materials-worker
  "/images/app/browse/heavy-equipment-operator.webp": "50% 29%", // heavy-equipment-operator
  "/images/app/browse/highway-maintenance-worker.webp": "50% 4%", // highway-maintenance-worker
  "/images/app/browse/iron-worker.webp": "50% 49%", // iron-worker
  "/images/app/browse/painter.webp": "50% 8%", // painter
  "/images/app/browse/pest-control-technician.webp": "50% 8%", // pest-control-technician
  "/images/app/browse/plumber.webp": "50% 19%", // plumber
  "/images/app/browse/solar-panel-installer.webp": "50% 23%", // solar-panel-installer
  "/images/app/browse/bank-teller.webp": "50% 35%", // bank-teller
  "/images/app/browse/claims-adjuster.webp": "50% 30%", // claims-adjuster
  "/images/app/browse/customer-service-representative.webp": "50% 4%", // customer-service-representative
  "/images/app/browse/entrepreneur.webp": "50% 29%", // entrepreneur
  "/images/app/browse/event-director.webp": "50% 22%", // event-director
  "/images/app/browse/event-marketing-manager.webp": "50% 5%", // event-marketing-manager
  "/images/app/browse/event-operations-manager.webp": "50% 45%", // event-operations-manager
  "/images/app/browse/fashion-e-commerce-manager.webp": "50% 18%", // fashion-e-commerce-manager
  "/images/app/browse/fashion-merchandiser.webp": "50% 29%", // fashion-merchandiser
  "/images/app/browse/financial-advisor.webp": "50% 38%", // financial-advisor
  "/images/app/browse/insurance-agent.webp": "50% 11%", // insurance-agent
  "/images/app/browse/management-consultant.webp": "50% 27%", // management-consultant
  "/images/app/browse/market-research-analyst.webp": "50% 6%", // market-research-analyst
  "/images/app/browse/medical-office-assistant.webp": "50% 31%", // medical-office-assistant
  "/images/app/browse/office-clerk.webp": "50% 18%", // office-clerk
  "/images/app/browse/operations-manager.webp": "50% 35%", // operations-manager
  "/images/app/browse/project-manager.webp": "50% 3%", // project-manager
  "/images/app/browse/real-estate-agent.webp": "50% 13%", // real-estate-agent
  "/images/app/browse/receptionist.webp": "50% 19%", // receptionist
  "/images/app/browse/recruiter.webp": "50% 35%", // recruiter
  "/images/app/browse/retail-sales-associate.webp": "50% 26%", // retail-sales-associate
  "/images/app/browse/retail-store-supervisor.webp": "50% 17%", // retail-store-supervisor
  "/images/app/browse/stockbroker.webp": "50% 40%", // stockbroker
  "/images/app/browse/ambulance-driver-and-attendant.webp": "50% 30%", // ambulance-driver-and-attendant
  "/images/app/browse/cargo-handling-supervisor.webp": "50% 11%", // cargo-handling-supervisor
  "/images/app/browse/commercial-pilot.webp": "50% 53%", // commercial-pilot
  "/images/app/browse/delivery-driver.webp": "50% 34%", // delivery-driver
  "/images/app/browse/demand-planner.webp": "50% 0%", // demand-planner
  "/images/app/browse/driver-and-sales-worker.webp": "50% 17%", // driver-and-sales-worker
  "/images/app/browse/flight-attendant.webp": "50% 16%", // flight-attendant
  "/images/app/browse/hand-packer.webp": "50% 0%", // hand-packer
  "/images/app/browse/parking-attendant.webp": "50% 13%", // parking-attendant
  "/images/app/browse/railroad-conductor.webp": "50% 35%", // railroad-conductor
  "/images/app/browse/sanitation-worker.webp": "50% 11%", // sanitation-worker
  "/images/app/browse/ship-captain-or-mate.webp": "50% 4%", // ship-captain-or-mate
  "/images/app/browse/shuttle-driver-or-chauffeur.webp": "50% 10%", // shuttle-driver-or-chauffeur
  "/images/app/browse/stocker-and-order-picker.webp": "50% 24%", // stocker-and-order-picker
  "/images/app/browse/supply-chain-manager.webp": "50% 45%", // supply-chain-manager
  "/images/app/browse/transit-bus-driver.webp": "50% 15%", // transit-bus-driver
  "/images/app/browse/vehicle-cleaner.webp": "50% 17%", // vehicle-cleaner
  "/images/app/browse/warehouse-worker.webp": "50% 13%", // warehouse-worker
  "/images/app/browse/auto-body-technician.webp": "50% 30%", // auto-body-technician
  "/images/app/browse/auto-mechanic.webp": "50% 22%", // auto-mechanic
  "/images/app/browse/aviation-maintenance-technician.webp": "50% 8%", // aviation-maintenance-technician
  "/images/app/browse/avionics-technician.webp": "50% 19%", // avionics-technician
  "/images/app/browse/biomedical-equipment-technician.webp": "50% 5%", // biomedical-equipment-technician
  "/images/app/browse/diesel-mechanic.webp": "50% 14%", // diesel-mechanic
  "/images/app/browse/heavy-equipment-mechanic.webp": "50% 36%", // heavy-equipment-mechanic
  "/images/app/browse/hvac-technician.webp": "50% 48%", // hvac-technician
  "/images/app/browse/industrial-maintenance-technician.webp": "50% 22%", // industrial-maintenance-technician
  "/images/app/browse/locksmith.webp": "50% 4%", // locksmith
  "/images/app/browse/millwright.webp": "50% 37%", // millwright
  "/images/app/browse/motorcycle-mechanic.webp": "50% 30%", // motorcycle-mechanic
  "/images/app/browse/office-equipment-technician.webp": "50% 36%", // office-equipment-technician
  "/images/app/browse/power-line-technician.webp": "50% 30%", // power-line-technician
  "/images/app/browse/telecom-technician.webp": "50% 20%", // telecom-technician
  "/images/app/browse/wind-turbine-technician.webp": "50% 43%", // wind-turbine-technician
  "/images/app/browse/architectural-and-engineering-manager.webp": "50% 3%", // architectural-and-engineering-manager
  "/images/app/browse/civil-engineering-technician.webp": "50% 31%", // civil-engineering-technician
  "/images/app/browse/drafter.webp": "50% 22%", // drafter
  "/images/app/browse/electronics-engineering-technician.webp": "50% 12%", // electronics-engineering-technician
  "/images/app/browse/industrial-engineering-technician.webp": "50% 61%", // industrial-engineering-technician
  "/images/app/browse/robotics-technician.webp": "50% 15%", // robotics-technician
};

export function top3PhotoFocus(career: Pick<ProfileCareer, "photo">): string {
  return TOP3_PHOTO_FOCUS[career.photo] ?? "50% 25%";
}

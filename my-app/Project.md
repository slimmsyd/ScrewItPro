




Screw It Pro
Integrated Assembly & Logistics Platform


            November 26, 2025 


TABLE OF CONTENTS


1. Executive Summary
2. Project Goals & Objectives
3. Scope of Work (MVP)
4.Phase 2 & Beyond
5. Timeline & Milestones
6. Investment & Payment Schedule
7. Maintenance & Support
8. Client Responsibilities & Assumptions




Screw It Pro
Integrated Assembly & Logistics Platform
Product Development Proposal
Prepared by: OnCode Software Solutions
Date: November 26, 2025

1. Executive Summary
Screw It Pro aims to transform the frustrating, time-consuming experience of assembling flat-pack furniture into  white glove service for everyday customers.
The vision is clear:
Customers order furniture from their favorite retailers
Furniture is shipped to a central Screw It Pro hub
Your team unboxes, assembles, inspects, and prepares each piece
Fully assembled items are delivered and placed in the customer’s home
To support this model, Screw It Pro needs a modern, scalable software platform that:
Lets customers book services, pay, and track orders
Gives your team a control center to manage orders, technicians, and deliveries
Provides technicians and drivers with simple mobile tools to do their jobs
Uses an AI-powered, mascot-based chatbot to answer customer questions and reduce support load
This proposal outlines the scope, features, timeline, and investment to design, develop, and launch the Screw It Pro MVP platform — including the landing page — with a tentative operational date around May 2026..
Estimated Development Duration
The complete build-out of the MVP (planning, development, testing, and refinement) is projected to take 14–18 weeks of development time once work begins.
Total build investment: $10,000
Ongoing maintenance: from $200/month (negotiable)
2. Project Goals & Objectives
Primary Goals
Launch a functional MVP that supports a hub-based assembly and white glove delivery model in at least one metro area.
Give customers a frictionless online experience to book services, pay, and track order status.
Equip your operations team with tools to coordinate inbound boxes, assembly work, and deliveries from a single dashboard.
Introduce an AI-powered, mascot-based chatbot that can handle common questions and reduce manual support.
Lay a clean, scalable technical foundation that can support future features such as memberships, rewards, and third-party integrations.

3. Scope of Work (MVP)
The MVP will be built with Next.js, Supabase, Stripe, and an AI assistant layer, and will include the following core components.
3.1. Public Landing Page
A landing page that clearly explains the Screw It Pro value proposition and collects leads.
Key elements:
Hero section with clear “Never assemble furniture again” message
“How It Works” overview (Shop → Ship to Hub → We Assemble → We Deliver)
Service area / city focus (initial launch region)
Clear call-to-action: “Book Now” or “Get Started”
Basic SEO setup and analytics tracking

3.2. Customer Web Application (Portal)
A simple, intuitive web experience for customers to manage everything in one place.
Features:
Customer Registration & Login
Email-based account creation and secure sign-in
Online Booking & Scheduling
Submit new assembly requests (furniture details, retailer links, notes)
Select preferred service type: Hub Assembly + Delivery
Choose from available delivery windows (based on admin-defined slots)
Order Overview & Tracking
View current and past orders
See clear status labels:
Awaiting Arrival → Boxes Received → In Assembly → Assembly Completed → Out for Delivery → Delivered
View assembly photos once items are completed at the hub
Secure Payments
Pay deposits or full charges through Stripe checkout (Or other preferred payment gateway method)
See payment status (Paid / Pending)
Notifications & Updates
Receive email updates as order status changes (order created, assembly completed, out for delivery, delivered)
Access to AI Support
Integrated AI chatbot to answer service questions and guide bookings

3.3. AI-Powered Mascot Chatbot & FAQ
An on-site AI assistant that embodies the Screw It Pro brand and reduces support workload.
Features:
Mascot-Based Chat Interface
Chat bubble with a branded character representing Screw It Pro
Friendly, conversational tone aligned with your brand
Natural Language Q&A
Answers common questions about:
How the service works
Pricing ranges
What customers need to prepare
Service areas
Expected timelines
AI-Driven FAQ & Self-Service
Uses a curated FAQ/help content set as its knowledge base
Helps customers resolve common inquiries without human intervention
Conversation Logging
Stores customer questions and AI responses in the database
Enables quality review and content refinement over time
This AI layer will be intentionally lightweight and focused on customer education and guidance — not on making binding operational decisions.

3.4. Operations & Admin Dashboard
A web-based control center for your internal team to manage daily operations.
Key capabilities:
Order Management
View all orders with filters by status, date, and service type
See customer details, notes, and payment status
Order Status Control
Step through the full lifecycle:
Awaiting Inbound → Boxes Received → In Assembly → Assembly Completed → Ready for Delivery → Out for Delivery → Delivered → Refused
Hub Assembly Workflow
Mark boxes as received at the hub
Attach inbound photos (damaged boxes, missing parts, etc.)
Assign jobs to specific technicians
Upload final assembled photos before delivery
Delivery Scheduling
Define time slots (e.g., 8–10am, 10–12pm, etc.)
See how many orders are assigned to each slot
Assign drivers to each delivery
Technician & Driver Assignment
Assign or reassign technicians to assembly jobs
Assign drivers and delivery slots to ready orders
Payment & Invoice Tracking
Set the price for each job
Trigger Stripe payment links/invoices(Or other preferred payment gateway method)
View whether orders are paid or unpaid
Inbound Tracking (“Expected Inbound”)
Admins can log tracking numbers or retailer confirmations when a customer submits a new order.
Each tracking number is connected to a specific customer order so that incoming boxes are never “mystery packages” on the warehouse floor.


Box Receiving & Matching
When boxes arrive at the hub, staff can scan or manually confirm shipping labels and mark them as “Boxes Received.”
The system automatically matches each box to the correct customer order and updates the order status (e.g., “Awaiting Arrival → Boxes Received”).
Damage & RMA Documentation
Staff can upload inbound photos (e.g., crushed box, torn packaging) directly onto the order.
If damage is visible at intake, the order can be flagged for review before assembly begins.
Assembly Job Assignment
Once all expected boxes for an order are received, the admin can assign the assembly job to a specific technician.
Jobs appear in the technician portal with all relevant item details and notes.
Final Assembly & QA Photos
After assembly, staff upload clear “before delivery” photos from the hub for internal QA and customer reassurance.
Orders are then marked “Assembly Completed” and moved into the delivery scheduling flow.

3.5. Technician Portal (Mobile-Friendly Web)
A simplified, mobile-optimized view for technicians working in the hub.
Features:
Daily Job List
View all assigned jobs for the day
See item details and any special notes
Assembly Workflow
Open job details and mark “Start Assembly” and “Assembly Complete”
Photo Capture & Upload
Upload unboxing photos (to document pre-existing damage)
Upload completed assembly photos for QA and customer reassurance
Quality Checklist
Check off key QC steps before marking a job as completed

3.6. Driver Portal (Mobile-Friendly Web)
A lightweight delivery tool for drivers.
Features:
Daily Delivery List
See all deliveries assigned for the day
Includes customer address, notes, and time window
Navigation
One-tap open in Google Maps for each stop
Proof of Delivery (POD)
Upload delivery photos
Capture customer signature (simple on-screen signing)
Mark items as Delivered or Refused
Real-Time Status Updates
Update delivery status, which reflects back in the admin dashboard and customer portal

3.7. Infrastructure & Technical Foundation
The platform will be built using standard, battle-tested tools:
Frontend: Next.js (React)
Backend: Next.js API routes / server components
Database & Auth: Supabase
File Storage: Supabase Storage for photos and documents
Payments: Stripe (one-time payments and invoices for MVP) (Or other preferred payment gateway method)
Email: Transactional email service for notifications
3.8. Hub Workflow Overview (End-to-End System Flow)
To support the hub-based model, the MVP platform will guide each order through a clear four-step flow:
Inbound — The “Digital Handshake”
Customer action: After purchasing furniture (e.g., from Wayfair or IKEA), the customer submits the order details and tracking number through the Screw It Pro portal.
System action: The system creates an “Expected Inbound” record that links the tracking number to a specific customer order.
Hub action: When the box arrives at the hub, staff scan or confirm the shipping label. The system instantly matches the package to the correct order and updates the status to “Boxes Received.”
Processing — The Assembly Line
Job assignment: Orders with all boxes received are assigned to a specific technician via the admin dashboard.
Technician view: On their mobile portal, technicians see the job details (item name, notes, estimated time) and mark when assembly begins and ends.
Exceptions: If a broken part or defect is discovered, the technician logs a damage report, uploads photos, and sets the order to “On Hold – Damage Reported.” The system alerts the admin so they can coordinate with the customer or retailer for next steps.


Outbound — White Glove Dispatch
Customer scheduling: Once assembly is completed and QA photos are uploaded, the customer is notified to select a delivery window.
Admin scheduling: The operations team assigns orders to a driver and delivery slot, taking into account that assembled furniture takes more physical space than flat boxes. The system ensures truck capacity is used efficiently for bulky items.
Delivery — The Last Yard
Driver tools: Drivers see their daily route, customer addresses, notes, and time windows in a dedicated mobile-friendly view, with one-tap navigation.
Proof of Delivery: At the customer’s location, the driver captures photos of the assembled item in the room and collects a simple signature. This provides clear proof that the item arrived in good condition and was placed as requested.
Final status: Orders are marked as “Delivered” (or “Refused” if applicable), updating both the admin dashboard and the customer portal in real time.
The architecture will be designed to support future growth, including:
Membership tiers & loyalty rewards
Deeper billing integrations (Stripe Billing or more advanced models)
CRM and payroll integrations
Multi-hub operations across multiple cities
Native mobile apps

4. Phase 2 & Beyond
To keep the MVP investment at $10,000 and meet the April 2026 tentative timeline, the following features are explicitly Phase 2+:
Memberships & Rewards System
Subscription tiers, family plans, and loyalty points
Full CRM & Payroll Integrations
Direct integration with tools like HubSpot, Salesforce, ADP, Gusto, QuickBooks, etc.
Advanced Route Optimization Engine
Automated route planning beyond basic manual scheduling
Complex Subscription Billing
Auto-renewal, prorations, dunning, etc.
Multi-Hub / Multi-City Operations
Cross-location routing, capacity planning, etc.
The MVP will be architected so these can be added later without a full rebuild.

5. Timeline & Milestones
The timeline below aligns with your expectations:
Landing page live by end of 2025
Core platform online by projected date of May 2026
Phase 1 — Landing Page & Foundation
Timeline: Projected November–December 2025
Refine and finalize the public landing page
Connect basic analytics and lead capture
Confirm branding, messaging, and initial copy
Prepare initial FAQ content for AI support
Target Completion: by December 31, 2025

Phase 2 — Architecture & UX Design
Timeline: Projected January 2026
Define database models and system architecture (Supabase + Next.js)
Map user journeys (Customer, Admin, Technician, Driver)
Create wireframes for core screens
Confirm MVP feature priority and edge cases
Deliverable: System blueprint + wireframes

Phase 3 — Core MVP Development
Timeline: Projected February–March 2026
Build customer portal (booking, payments, tracking)
Build admin dashboard (orders, status, assignments, scheduling)
Build technician and driver mobile-friendly portals
Implement AI chatbot layer and FAQ integration
Email notifications and status updates
Internal testing and iteration

Phase 4 — QA, Pilot & Launch
Timeline: Projected Late March–May 2026
End-to-end testing with test cases and sample jobs
Fix bugs and refine UX
Support initial live pilot in one hub/city
Final adjustments before “open for customers” launch
Target MVP Go-Live: May 2026

6. Investment & Payment Schedule
Total Project Investment (MVP Build)
$10,000 (USD)
This includes:
Landing page refinement & integration
Customer web application
Admin operations dashboard
Technician portal (mobile web)
Driver portal (mobile web)
AI-powered mascot chatbot (FAQ-driven)
Core infrastructure setup and deployment

Payment Schedule
Payment is split across key milestones to align with progress:
30% – Project Initiation
$3,000
Due upon signing the agreement and kicking off planning and architecture work.
35% – Core Development Progress
$3,500
Due upon completion of main application modules (Customer Portal + Admin Dashboard) and internal demo.
25% – MVP Beta Release
$2,500
Due when the full MVP (including technician/driver views and AI chatbot) is ready for internal pilot testing.
10% – Final Launch & Handover
$1,000
Due upon successful deployment, basic training, and handover of credentials and documentation.

7. Maintenance & Support
After launch, we recommend a Maintenance & Support plan to keep the platform healthy and evolving.
Base Maintenance Plan
Starting at: $200/month (negotiable)
Includes:
Uptime monitoring and basic performance oversight
Security patches and library updates
Minor bug fixes and small UX refinements
Database health checks
Ongoing AI FAQ/content refinement
Monthly check-in/report with recommendations
Optionally, a higher-tier support plan can include:
Priority response for critical issues
Quarterly roadmap sessions
Maintenance terms can be finalized closer to launch, tailored to how actively you plan to iterate after MVP.

8. Client Responsibilities & Assumptions
To ensure a smooth, on-time delivery, we assume:
Screw It Pro will provide:
Branding assets (logo, colors, fonts)
Initial marketing copy and value proposition statements
Initial FAQ/help content for AI training
Any specific legal or policy content (ToS, Privacy, etc.)
Decision makers will be available for timely feedback on designs, flows, and key milestones.
Scope changes or major feature additions beyond what is defined in this document may require a separate change order and budget adjustment.




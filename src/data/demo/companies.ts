import { daysFromNow } from '../../domain/dates';
import type { Startup } from '../../domain/types';

/**
 * Demo companies.
 *
 * Every company here is FICTIONAL. Names, logos and descriptions are original
 * and are not modelled on any real brand, so nothing can be mistaken for a
 * real employer's vacancy. All carry isDemo: true and show a "Demo" label.
 */

type Extra = Pick<Startup, 'kind' | 'logo' | 'workplace' | 'benefits' | 'process'>;

const PROCESS = {
  startup: [
    'Apply on My Mate Gut with your profile and resume',
    'Short video call with the founder or team lead (about 20 minutes)',
    'Small practical task or a chat about your past work',
    'Decision within about two weeks',
  ],
  growing: [
    'Apply on My Mate Gut with your profile and resume',
    'The hiring team reviews applications each week',
    'Interview with your future supervisor',
    'Offer and internship agreement',
  ],
  established: [
    'Apply on My Mate Gut with your profile and resume',
    'HR screens applications',
    'Interview with the hiring manager',
    'Second interview or short assessment',
    'Offer letter and university internship documents',
  ],
};

/** Profile details for the original twelve demo companies (defined in seed.ts). */
export const COMPANY_EXTRAS: Record<string, Extra> = {
  st_kradan: {
    kind: 'startup',
    logo: { shape: 'square', bg: '#0F766E', fg: '#FFFFFF', mark: 'book', kind: 'icon' },
    workplace: 'Open-plan office near Sam Yan MRT. Squads of four to five people, a planning session every Monday and a demo every second Friday.',
    benefits: ['Monthly allowance', 'Named mentor for the whole internship', 'Internship certificate', 'Flexible hours during exam weeks'],
    process: PROCESS.startup,
  },
  st_greenloop: {
    kind: 'startup',
    logo: { shape: 'circle', bg: '#15803D', fg: '#FFFFFF', mark: 'leaf', kind: 'icon' },
    workplace: 'Small team that splits time between a Thonglor office and refill stations across Bangkok. Expect to be out on site once or twice a week.',
    benefits: ['Monthly allowance', 'Travel allowance for station visits', 'Work directly with the founders', 'Internship certificate'],
    process: PROCESS.startup,
  },
  st_paysabai: {
    kind: 'growing',
    logo: { shape: 'pill', bg: '#4338CA', fg: '#FFFFFF', mark: 'PS', kind: 'letters' },
    workplace: 'Office in Sathorn with a quiet, focused culture. Finance and data teams sit together and share a weekly numbers review.',
    benefits: ['Monthly allowance', 'Laptop provided', 'Training on accounting software', 'Letter of recommendation on completion'],
    process: PROCESS.growing,
  },
  st_framehaus: {
    kind: 'startup',
    logo: { shape: 'tab', bg: '#B91C1C', fg: '#FFFFFF', mark: 'Fh', kind: 'letters', font: 'serif' },
    workplace: 'Creative studio space in Ratchathewi with a small filming room. Shoots happen mid-week and the team is relaxed but deadline-driven.',
    benefits: ['Monthly allowance', 'Access to studio equipment', 'Portfolio credits on published videos', 'Flexible hours'],
    process: PROCESS.startup,
  },
  st_stackwell: {
    kind: 'growing',
    logo: { shape: 'square', bg: '#1E293B', fg: '#38BDF8', mark: 'layers', kind: 'icon' },
    workplace: 'Engineering-led company near Asok. Two product teams, written code review for every change and pairing sessions twice a week.',
    benefits: ['Monthly allowance', 'Laptop provided', 'Mentor from the engineering team', 'Hybrid working after the first month'],
    process: PROCESS.growing,
  },
  st_tukroute: {
    kind: 'growing',
    logo: { shape: 'diamond', bg: '#EA580C', fg: '#FFFFFF', mark: 'route', kind: 'icon' },
    workplace: 'Busy operations floor in Lat Phrao where the team monitors live deliveries. Practical, fast and very hands-on.',
    benefits: ['Monthly allowance', 'Lunch provided on office days', 'Internship certificate', 'Exposure to senior management meetings'],
    process: PROCESS.growing,
  },
  st_klinikloop: {
    kind: 'startup',
    logo: { shape: 'circle', bg: '#0369A1', fg: '#FFFFFF', mark: 'pulse', kind: 'icon' },
    workplace: 'Product team based in Phaya Thai that spends time inside partner clinics. Research findings are shared every Friday.',
    benefits: ['Monthly allowance', 'Training in user research methods', 'Named mentor', 'Internship certificate'],
    process: PROCESS.startup,
  },
  st_lumen: {
    kind: 'startup',
    logo: { shape: 'hex', bg: '#CA8A04', fg: '#FFFFFF', mark: 'LK', kind: 'letters' },
    workplace: 'Early-stage team in Ari. Small and informal, with lots of time spent visiting partner kitchens.',
    benefits: ['Monthly allowance', 'Free meals from partner kitchens on visit days', 'Work directly with the founders'],
    process: PROCESS.startup,
  },
  st_baanly: {
    kind: 'startup',
    logo: { shape: 'tab', bg: '#7C3AED', fg: '#FFFFFF', mark: 'home', kind: 'icon' },
    workplace: 'Cross-functional team in Ekkamai with one designer, three engineers and a growth team close to student communities.',
    benefits: ['Monthly allowance', 'Design critique with a senior designer', 'Flexible hours', 'Internship certificate'],
    process: PROCESS.startup,
  },
  st_wanderlane: {
    kind: 'startup',
    logo: { shape: 'pill', bg: '#0E7490', fg: '#FFFFFF', mark: 'compass', kind: 'icon' },
    workplace: 'Six-person team in Silom. Some weekend work joining experiences with guests.',
    benefits: ['Monthly allowance', 'Free places on local experiences', 'Weekday time off after weekend shifts'],
    process: PROCESS.startup,
  },
  st_mintpot: {
    kind: 'startup',
    logo: { shape: 'circle', bg: '#65A30D', fg: '#FFFFFF', mark: 'sprout', kind: 'icon' },
    workplace: 'Home-based shop with a small packing space in Chatuchak. Details not confirmed.',
    benefits: ['Not stated by the company'],
    process: ['Apply on My Mate Gut', 'The owner contacts shortlisted students'],
  },
  st_orbit: {
    kind: 'startup',
    logo: { shape: 'circle', bg: '#64748B', fg: '#FFFFFF', mark: 'OT', kind: 'letters', font: 'mono' },
    workplace: 'Not provided by the company.',
    benefits: ['Not stated by the company'],
    process: ['Apply on My Mate Gut', 'Not described by the company'],
  },
};

interface NewCompany extends Extra {
  id: string;
  name: string;
  industry: Startup['industry'];
  district: string;
  tagline: string;
  about: string;
  stage: string;
  teamSize: string;
  foundedYear: number;
  contactName: string;
  contactRole: string;
}

const c = (x: NewCompany): Startup => ({
  ...x,
  hue: 0,
  website: '',
  createdAt: daysFromNow(-120),
  isDemo: true,
});

/** Eighteen further fictional companies: a mix of startups, growing firms and established businesses. */
export const NEW_COMPANIES: Startup[] = [
  c({
    id: 'st_siamweave', name: 'Siam Weave Apparel', industry: 'retail', district: 'Pathum Wan', kind: 'established',
    tagline: 'Everyday clothing made in Thailand, sold in 40 stores and online.',
    about: 'Siam Weave Apparel designs and sells casual clothing for students and young professionals. It runs 40 stores in Bangkok malls and a growing online shop. Interns join the head office marketing, finance or e-commerce teams.',
    stage: 'Established retailer', teamSize: 'About 900 people', foundedYear: 2006, contactName: 'Khun Pranee T.', contactRole: 'HR Manager',
    logo: { shape: 'square', bg: '#111827', fg: '#F9FAFB', mark: 'SW', kind: 'letters', font: 'serif', accent: '#F59E0B' },
    workplace: 'Head office above the Pathum Wan flagship store. Structured teams, clear weekly targets and regular store visits.',
    benefits: ['Monthly allowance', 'Staff discount', 'Structured internship programme with training sessions', 'Internship certificate'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_chaophraya', name: 'Chao Phraya Advisory', industry: 'consulting', district: 'Sathorn', kind: 'growing',
    tagline: 'Business advice for family companies and SMEs growing beyond Bangkok.',
    about: 'Chao Phraya Advisory helps family-owned businesses plan expansion, improve operations and prepare for investment. Projects are short and practical, and interns support consultants with research and analysis.',
    stage: 'Growing firm', teamSize: '35 people', foundedYear: 2017, contactName: 'Khun Somsak R.', contactRole: 'Partner',
    logo: { shape: 'diamond', bg: '#1E3A8A', fg: '#FFFFFF', mark: 'CA', kind: 'letters', font: 'serif' },
    workplace: 'Quiet office in Sathorn. Interns are assigned to one client project and sit with the project team.',
    benefits: ['Monthly allowance', 'Mentor from the consulting team', 'Client meeting experience', 'Letter of recommendation on completion'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_northpeak', name: 'Northpeak Consulting', industry: 'consulting', district: 'Silom', kind: 'established',
    tagline: 'Strategy and operations consulting for companies across Southeast Asia.',
    about: 'Northpeak Consulting advises large companies on strategy, cost and digital change. The Bangkok office runs a structured internship programme each term with training in research, analysis and presentation.',
    stage: 'Established firm', teamSize: 'About 220 people in Bangkok', foundedYear: 2001, contactName: 'Khun Anchalee P.', contactRole: 'Recruiting Lead',
    logo: { shape: 'tab', bg: '#0F172A', fg: '#FFFFFF', mark: 'mountain', kind: 'icon', accent: '#38BDF8' },
    workplace: 'High-rise office in Silom with project rooms. Fast pace, high standards and a clear training programme for interns.',
    benefits: ['Monthly allowance', 'Formal training programme', 'Buddy and project mentor', 'Internship certificate'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_rattana', name: 'Rattana Foods', industry: 'fmcg', district: 'Bang Na', kind: 'established',
    tagline: 'Thai sauces and snacks sold in supermarkets across the country.',
    about: 'Rattana Foods produces sauces, chilli pastes and snacks for supermarkets and export. The Bang Na head office handles brand, finance and procurement, with the factory nearby.',
    stage: 'Family-owned manufacturer', teamSize: 'About 600 people', foundedYear: 1994, contactName: 'Khun Wipa S.', contactRole: 'HR Business Partner',
    logo: { shape: 'circle', bg: '#B45309', fg: '#FFFFFF', mark: 'chili', kind: 'icon', accent: '#FDE68A' },
    workplace: 'Head office next to the factory in Bang Na. Friendly, traditional culture with a staff canteen and shuttle from BTS Bang Na.',
    benefits: ['Monthly allowance', 'Lunch in the staff canteen', 'Shuttle from BTS Bang Na', 'Factory tour and product training'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_kinnaree', name: 'Kinnaree Hotels Group', industry: 'hospitality', district: 'Sukhumvit', kind: 'established',
    tagline: 'Five city hotels in Bangkok and two resorts on the coast.',
    about: 'Kinnaree Hotels Group runs business hotels in Bangkok and beach resorts in Hua Hin and Krabi. The corporate office offers internships in people, finance, communications and events.',
    stage: 'Established hotel group', teamSize: 'About 1,400 people', foundedYear: 1998, contactName: 'Khun Nattaya K.', contactRole: 'Learning and Development Manager',
    logo: { shape: 'hex', bg: '#831843', fg: '#FDF2F8', mark: 'K', kind: 'letters', font: 'serif', accent: '#F9A8D4' },
    workplace: 'Corporate office inside the Sukhumvit hotel. Professional dress code and a structured rotation for interns.',
    benefits: ['Monthly allowance', 'Staff meals', 'Hotel stay discount for family', 'Internship certificate'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_saeng', name: 'Saeng Digital', industry: 'agency', district: 'Ari', kind: 'growing',
    tagline: 'Performance and social media agency for Thai consumer brands.',
    about: 'Saeng Digital plans and runs online advertising and social media for food, beauty and lifestyle brands. Interns join account teams and work on live campaigns from the first week.',
    stage: 'Growing agency', teamSize: '48 people', foundedYear: 2016, contactName: 'Khun Ploypailin M.', contactRole: 'Head of People',
    logo: { shape: 'square', bg: '#FACC15', fg: '#111827', mark: 'sun', kind: 'icon' },
    workplace: 'Lively agency office in Ari. Teams work in two-week campaign cycles with regular client check-ins.',
    benefits: ['Monthly allowance', 'Google Ads and Meta ads training', 'Portfolio of real campaigns', 'Flexible Fridays'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_pulse', name: 'Pulse Mobile', industry: 'telecom', district: 'Huai Khwang', kind: 'growing',
    tagline: 'Prepaid mobile plans sold online and through convenience stores.',
    about: 'Pulse Mobile is a mobile service brand that rents network capacity and sells simple prepaid plans to students and workers. Interns join the data and sales teams.',
    stage: 'Growing company', teamSize: '120 people', foundedYear: 2018, contactName: 'Khun Tawan J.', contactRole: 'Talent Acquisition',
    logo: { shape: 'pill', bg: '#DB2777', fg: '#FFFFFF', mark: 'signal', kind: 'icon' },
    workplace: 'Office near MRT Huai Khwang. Target-driven sales team and a small analytics team.',
    benefits: ['Monthly allowance', 'Free mobile plan during the internship', 'Sales training', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_tidewater', name: 'Tidewater Logistics', industry: 'logistics', district: 'Lat Krabang', kind: 'established',
    tagline: 'Warehousing and freight for importers and exporters near Suvarnabhumi.',
    about: 'Tidewater Logistics operates warehouses and freight forwarding for companies moving goods through Bangkok. Interns join supply chain planning or HR at the Lat Krabang head office.',
    stage: 'Established company', teamSize: 'About 750 people', foundedYear: 2003, contactName: 'Khun Chaiwat B.', contactRole: 'HR Manager',
    logo: { shape: 'square', bg: '#0C4A6E', fg: '#FFFFFF', mark: 'waves', kind: 'icon', accent: '#7DD3FC' },
    workplace: 'Head office beside the main warehouse. Practical, process-focused culture with safety training on day one.',
    benefits: ['Monthly allowance', 'Shuttle from Airport Rail Link', 'Lunch provided', 'Safety and operations training'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_bloombeam', name: 'Bloom & Beam PR', industry: 'agency', district: 'Thonglor', kind: 'growing',
    tagline: 'Public relations and brand storytelling for lifestyle brands.',
    about: 'Bloom & Beam PR runs media relations, launches and brand content for fashion, beauty and hospitality clients. Interns write, design and help run press events.',
    stage: 'Growing agency', teamSize: '26 people', foundedYear: 2015, contactName: 'Khun Mayuree S.', contactRole: 'Managing Director',
    logo: { shape: 'circle', bg: '#F43F5E', fg: '#FFFFFF', mark: 'flower', kind: 'icon' },
    workplace: 'Bright studio office in Thonglor. Busy around launches, quieter between campaigns.',
    benefits: ['Monthly allowance', 'Invitations to client events', 'Writing feedback from senior staff', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_stagecraft', name: 'Stagecraft Events', industry: 'events', district: 'Ratchadaphisek', kind: 'growing',
    tagline: 'Conferences, product launches and concerts across Bangkok.',
    about: 'Stagecraft Events plans and produces corporate conferences, product launches and music events. Interns support planning in the office and help run events on the day.',
    stage: 'Growing company', teamSize: '40 people', foundedYear: 2013, contactName: 'Khun Krit A.', contactRole: 'Head of Production',
    logo: { shape: 'diamond', bg: '#7E22CE', fg: '#FFFFFF', mark: 'ticket', kind: 'icon' },
    workplace: 'Office and storage space in Ratchada. Office days plus some evening and weekend event days.',
    benefits: ['Monthly allowance', 'Overtime allowance on event days', 'Backstage experience', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_nimbus', name: 'Nimbus Commerce', industry: 'ecommerce', district: 'Rama 9', kind: 'growing',
    tagline: 'Software and services that help Thai brands sell on online marketplaces.',
    about: 'Nimbus Commerce builds tools that let brands manage stock, prices and orders across several online marketplaces, and runs online stores for some clients. Interns join engineering, product or seller success.',
    stage: 'Series A', teamSize: '85 people', foundedYear: 2019, contactName: 'Khun Ekkachai P.', contactRole: 'Engineering Manager',
    logo: { shape: 'pill', bg: '#2563EB', fg: '#FFFFFF', mark: 'cloud', kind: 'icon', accent: '#BFDBFE' },
    workplace: 'Modern office near MRT Phra Ram 9. Product teams with weekly planning and a hybrid schedule.',
    benefits: ['Monthly allowance', 'Laptop provided', 'Hybrid working', 'Mentor assigned'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_ledgerline', name: 'Ledgerline Accounting', industry: 'accounting', district: 'Sathorn', kind: 'growing',
    tagline: 'Bookkeeping, tax and audit support for small and medium businesses.',
    about: 'Ledgerline Accounting keeps the books and prepares tax filings for around 300 SMEs. Interns learn the monthly bookkeeping cycle and support audit preparation.',
    stage: 'Growing firm', teamSize: '60 people', foundedYear: 2011, contactName: 'Khun Suda W.', contactRole: 'Audit Manager',
    logo: { shape: 'square', bg: '#065F46', fg: '#ECFDF5', mark: 'LA', kind: 'letters', font: 'mono' },
    workplace: 'Calm office near BTS Chong Nonsi. Busy in tax season, with clear checklists for every task.',
    benefits: ['Monthly allowance', 'Training on accounting software', 'Hours that count towards professional requirements, where applicable', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_talentree', name: 'Talentree', industry: 'hrtech', district: 'Phrom Phong', kind: 'startup',
    tagline: 'HR software that helps small companies hire and onboard staff.',
    about: 'Talentree makes a simple applicant tracking and onboarding tool for companies with 10 to 200 staff. Interns help with the company’s own hiring and with product research.',
    stage: 'Seed', teamSize: '18 people', foundedYear: 2022, contactName: 'Khun Benjamas L.', contactRole: 'Co-founder',
    logo: { shape: 'circle', bg: '#16A34A', fg: '#FFFFFF', mark: 'tree', kind: 'icon' },
    workplace: 'Shared co-working space in Phrom Phong. Small team, flexible hours and weekly one-to-ones with your mentor.',
    benefits: ['Monthly allowance', 'Flexible hours', 'Weekly one-to-one with a mentor', 'Co-working space perks'],
    process: PROCESS.startup,
  }),
  c({
    id: 'st_pixelpestle', name: 'Pixel & Pestle', industry: 'design_studio', district: 'Charoen Krung', kind: 'startup',
    tagline: 'Branding and digital design studio for cafés, hotels and Thai brands.',
    about: 'Pixel & Pestle creates brand identities, packaging and websites. The studio is small, so interns work on real client projects with direct feedback from the creative director.',
    stage: 'Independent studio', teamSize: '9 people', foundedYear: 2020, contactName: 'Khun Arisa N.', contactRole: 'Creative Director',
    logo: { shape: 'tab', bg: '#F97316', fg: '#FFFFFF', mark: 'P&P', kind: 'letters', font: 'serif' },
    workplace: 'Shophouse studio in Charoen Krung. Relaxed, with design critiques twice a week.',
    benefits: ['Monthly allowance', 'Portfolio credits on client work', 'Adobe and Figma licences provided', 'Flexible hours'],
    process: PROCESS.startup,
  }),
  c({
    id: 'st_datawise', name: 'Datawise Analytics', industry: 'analytics', district: 'Rama 9', kind: 'growing',
    tagline: 'Dashboards and data analysis for retailers and banks.',
    about: 'Datawise Analytics builds reporting dashboards and runs customer analysis for retail and financial clients. Interns clean data, build reports and present findings with an analyst.',
    stage: 'Growing consultancy', teamSize: '55 people', foundedYear: 2016, contactName: 'Khun Pakorn D.', contactRole: 'Analytics Lead',
    logo: { shape: 'hex', bg: '#0891B2', fg: '#FFFFFF', mark: 'chart', kind: 'icon' },
    workplace: 'Office near MRT Phra Ram 9. Analysts work in pairs and share a weekly show-and-tell.',
    benefits: ['Monthly allowance', 'Power BI and SQL training', 'Laptop provided', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_chanthra', name: 'Chanthra Financial Group', industry: 'financial_services', district: 'Silom', kind: 'established',
    tagline: 'Insurance and wealth management for Thai families.',
    about: 'Chanthra Financial Group offers life insurance, savings plans and investment advice. The Silom head office runs a finance internship each term in planning and analysis.',
    stage: 'Established company', teamSize: 'About 2,000 people', foundedYear: 1989, contactName: 'Khun Rungnapa C.', contactRole: 'Graduate Programme Manager',
    logo: { shape: 'circle', bg: '#1E40AF', fg: '#FDE68A', mark: 'moon', kind: 'icon' },
    workplace: 'Corporate headquarters in Silom. Formal dress code, structured hours and an intern cohort of around 15 students.',
    benefits: ['Monthly allowance', 'Intern cohort and training days', 'Health check', 'Internship certificate'],
    process: PROCESS.established,
  }),
  c({
    id: 'st_homeful', name: 'Homeful Living', industry: 'retail', district: 'Bang Na', kind: 'growing',
    tagline: 'Affordable furniture and home goods sold online and in two showrooms.',
    about: 'Homeful Living sells furniture and home goods through its own website, online marketplaces and two Bangkok showrooms. Interns join digital marketing, e-commerce, sales or inventory planning.',
    stage: 'Growing retailer', teamSize: '150 people', foundedYear: 2014, contactName: 'Khun Jirapat H.', contactRole: 'HR Manager',
    logo: { shape: 'square', bg: '#A16207', fg: '#FFFFFF', mark: 'sofa', kind: 'icon' },
    workplace: 'Head office above the Bang Na showroom. Friendly team with weekly sales and stock meetings.',
    benefits: ['Monthly allowance', 'Staff discount', 'Lunch allowance', 'Internship certificate'],
    process: PROCESS.growing,
  }),
  c({
    id: 'st_chargeway', name: 'Chargeway', industry: 'mobility', district: 'Bang Kapi', kind: 'startup',
    tagline: 'Electric vehicle charging points for condos and offices.',
    about: 'Chargeway installs and runs EV chargers in condominiums, offices and malls, with an app for payment. Interns help sign up new locations and tell the company’s story.',
    stage: 'Seed', teamSize: '21 people', foundedYear: 2021, contactName: 'Khun Thitipong V.', contactRole: 'Co-founder, Partnerships',
    logo: { shape: 'diamond', bg: '#059669', fg: '#FFFFFF', mark: 'bolt', kind: 'icon' },
    workplace: 'Office in Bang Kapi with frequent site visits. Small, energetic team that moves quickly.',
    benefits: ['Monthly allowance', 'Travel allowance for site visits', 'Work directly with the founders', 'Flexible hours'],
    process: PROCESS.startup,
  }),
];

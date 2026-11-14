import { daysFromNow, nowISO } from '../domain/dates';
import { COMPANY_EXTRAS, NEW_COMPANIES } from './demo/companies';
import { expand, NEW_LISTINGS } from './demo/listings';
import type {
  Application,
  ApplicationEvent,
  Database,
  FieldId,
  IndustryId,
  Listing,
  Startup,
  Student,
  University,
  User,
  VerificationRecord,
  VerificationStatus,
  WorkMode,
} from '../domain/types';

/**
 * Demo data set.
 *
 * Every startup, listing, student and application below is fictional sample
 * content and carries `isDemo: true`, which the UI surfaces as a "Demo" label.
 * No reviews are seeded: reviews can only come from an internship a startup has
 * confirmed as completed, and no real internship has been completed yet.
 * Dates are relative to the day the data is first loaded so deadlines stay current.
 */

export const SCHEMA_VERSION = 5;

export const DEMO_USER_IDS = {
  student: 'u_ploy',
  startup: 'u_kradan',
  university: 'u_bdu',
  admin: 'u_verify',
} as const;

const universities: University[] = [
  { id: 'uni_bdu', name: 'Bangkok Demo University', shortName: 'BDU (sample partner)', partner: true },
  { id: 'uni_chula', name: 'Chulalongkorn University', shortName: 'Chulalongkorn', partner: false },
  { id: 'uni_tu', name: 'Thammasat University', shortName: 'Thammasat', partner: false },
  { id: 'uni_mu', name: 'Mahidol University', shortName: 'Mahidol', partner: false },
  { id: 'uni_ku', name: 'Kasetsart University', shortName: 'Kasetsart', partner: false },
  { id: 'uni_kmutt', name: "King Mongkut's University of Technology Thonburi", shortName: 'KMUTT', partner: false },
  { id: 'uni_kmitl', name: "King Mongkut's Institute of Technology Ladkrabang", shortName: 'KMITL', partner: false },
  { id: 'uni_swu', name: 'Srinakharinwirot University', shortName: 'SWU', partner: false },
  { id: 'uni_bu', name: 'Bangkok University', shortName: 'Bangkok University', partner: false },
  { id: 'uni_au', name: 'Assumption University', shortName: 'Assumption', partner: false },
  { id: 'uni_other', name: 'Another university in Bangkok', shortName: 'Other', partner: false },
];

function startup(
  id: string,
  name: string,
  industry: IndustryId,
  district: string,
  hue: number,
  tagline: string,
  about: string,
  stage: string,
  teamSize: string,
  foundedYear: number,
  contactName: string,
  contactRole: string,
): Startup {
  return {
    ...COMPANY_EXTRAS[id],
    id,
    name,
    industry,
    district,
    hue,
    tagline,
    about,
    stage,
    teamSize,
    foundedYear,
    contactName,
    contactRole,
    website: '',
    createdAt: daysFromNow(-90),
    isDemo: true,
  };
}

const originalStartups: Startup[] = [
  startup(
    'st_kradan', 'Kradan Learning', 'edtech', 'Sam Yan', 160,
    'Exam prep that fits in a phone for Thai high-school students.',
    'Kradan Learning builds a mobile study app with short practice sets and explanations written by university tutors. The team works from a shared office near Sam Yan and ships a new release every two weeks. Interns join one of three squads and own a small, real piece of the product.',
    'Seed', '14 people', 2023, 'Napat W.', 'Co-founder, Product',
  ),
  startup(
    'st_greenloop', 'Greenloop Refill', 'climate', 'Thonglor', 130,
    'Refill stations for household products in condos and campuses.',
    'Greenloop Refill installs and operates refill stations for detergent, shampoo and dish soap. The company runs 40 stations across Bangkok and is expanding to university dormitories. Interns work directly with the two founders.',
    'Pre-seed', '8 people', 2024, 'Sirin K.', 'Co-founder',
  ),
  startup(
    'st_paysabai', 'PaySabai', 'fintech', 'Sathorn', 215,
    'Expense tracking and e-receipts for small Thai businesses.',
    'PaySabai helps shop owners and small teams record expenses, issue e-receipts and prepare monthly summaries for their accountants. The finance and data team is small, so interns see the full reporting cycle from raw transactions to board slides.',
    'Series A', '32 people', 2021, 'Chanon P.', 'Head of Finance',
  ),
  startup(
    'st_framehaus', 'Framehaus', 'creative', 'Ratchathewi', 20,
    'Scheduling and analytics tools for independent video creators.',
    'Framehaus makes a planning tool used by small creator teams to schedule shoots, track uploads and read their channel numbers in one place. The content team also runs the company channels, which interns help produce.',
    'Seed', '11 people', 2023, 'Pim T.', 'Head of Content',
  ),
  startup(
    'st_stackwell', 'Stackwell', 'saas', 'Asok', 245,
    'Inventory software for independent retail shops.',
    'Stackwell is a web and mobile inventory system for shops with one to ten branches. Engineering is organised in two product teams with weekly planning and code review for every change, including changes written by interns.',
    'Seed', '19 people', 2022, 'Kittipong S.', 'Engineering Lead',
  ),
  startup(
    'st_tukroute', 'Tuk Route', 'logistics', 'Lat Phrao', 35,
    'Route planning for same-day delivery fleets.',
    'Tuk Route plans delivery routes for small courier fleets in Bangkok. The operations team monitors live deliveries and works with drivers and merchants every day, which makes it a practical place to learn how a logistics business runs.',
    'Seed', '22 people', 2022, 'Arthit M.', 'Operations Manager',
  ),
  startup(
    'st_klinikloop', 'Klinik Loop', 'healthtech', 'Phaya Thai', 190,
    'Appointment and follow-up software for neighbourhood clinics.',
    'Klinik Loop provides booking, reminders and follow-up messaging for independent clinics. Product decisions start with visits to clinics, so product and design interns spend time talking to front-desk staff and observing real workflows.',
    'Seed', '16 people', 2022, 'Dr. Warisa L.', 'Co-founder, Product',
  ),
  startup(
    'st_lumen', 'Lumen Kitchen', 'foodtech', 'Ari', 5,
    'Order management for cloud kitchens and delivery-only brands.',
    'Lumen Kitchen combines orders from several delivery apps into one screen for kitchen staff. The business team signs up new kitchens and supports them through their first month.',
    'Pre-seed', '9 people', 2024, 'Thanakorn J.', 'Co-founder, Growth',
  ),
  startup(
    'st_baanly', 'Baanly', 'ecommerce', 'Ekkamai', 280,
    'Verified room and apartment rentals near Bangkok universities.',
    'Baanly lists rooms near universities with checked photos and clear contract terms. The team is small and cross-functional: one designer, three engineers and a growth team that works closely with student communities.',
    'Seed', '12 people', 2023, 'Mook R.', 'Design Lead',
  ),
  startup(
    'st_wanderlane', 'Wanderlane', 'ecommerce', 'Silom', 300,
    'Small-group local experiences hosted by Bangkok residents.',
    'Wanderlane is a marketplace for half-day local experiences such as market walks and cooking sessions. The company applied for verification recently and its documents are still being checked.',
    'Pre-seed', '6 people', 2025, 'Jirayu B.', 'Founder',
  ),
  startup(
    'st_mintpot', 'Mintpot', 'ecommerce', 'Chatuchak', 95,
    'Online houseplant shop with care reminders.',
    'Mintpot sells houseplants online and sends care reminders through LINE. This company has not completed verification.',
    'Bootstrapped', '4 people', 2025, 'Fah N.', 'Owner',
  ),
  startup(
    'st_orbit', 'Orbit Tutor', 'edtech', 'Bang Na', 255,
    'One-to-one online tutoring for primary school maths.',
    'Orbit Tutor connects parents with online maths tutors. This company has not completed verification.',
    'Bootstrapped', '3 people', 2025, 'Not provided', 'Not provided',
  ),
];

const startups: Startup[] = [...originalStartups, ...NEW_COMPANIES];

interface ListingInput {
  id: string;
  startupId: string;
  title: string;
  field: FieldId;
  summary: string;
  responsibilities: string[];
  learning: string[];
  requirements: string[];
  skills: string[];
  noExp: boolean;
  minYear: number;
  mode: WorkMode;
  stipend: number | null;
  months: number;
  hours: number;
  deadlineIn: number;
  postedAgo: number;
  openings?: number;
  supervisor?: [string, string];
}

function listing(i: ListingInput): Listing {
  const s = startups.find((x) => x.id === i.startupId)!;
  return {
    id: i.id,
    startupId: i.startupId,
    title: i.title,
    field: i.field,
    summary: i.summary,
    responsibilities: i.responsibilities,
    learning: i.learning,
    requirements: i.requirements,
    skills: i.skills,
    noExperienceRequired: i.noExp,
    minYear: i.minYear,
    workMode: i.mode,
    district: s.district,
    paid: i.stipend !== null,
    stipendMonthly: i.stipend,
    benefits: s.benefits.slice(0, 4),
    durationMonths: i.months,
    hoursPerWeek: i.hours,
    startDate: daysFromNow(i.deadlineIn + 21),
    deadline: daysFromNow(i.deadlineIn, 23),
    openings: i.openings ?? 1,
    supervisorName: i.supervisor?.[0] ?? '',
    supervisorRole: i.supervisor?.[1] ?? '',
    status: 'open',
    postedAt: daysFromNow(-i.postedAgo),
    updatedAt: daysFromNow(-Math.min(i.postedAgo, 3)),
    isDemo: true,
  };
}

const originalListings: Listing[] = [
  listing({
    id: 'l_kradan_mkt', startupId: 'st_kradan', title: 'Marketing & Community Intern', field: 'marketing',
    summary: 'Help grow the student community around the Kradan study app, from planning weekly content to talking with users in LINE groups.',
    responsibilities: [
      'Plan and publish three social posts a week with the content lead',
      'Moderate two student LINE OpenChat groups and collect common questions',
      'Run one small campaign of your own and report the results',
      'Join the weekly growth review and present what you learned',
    ],
    learning: ['How a seed-stage startup measures growth', 'Writing for a student audience', 'Reading campaign numbers and deciding what to try next'],
    requirements: ['Currently enrolled in a Bangkok university', 'Comfortable writing in Thai', 'Available at least three days a week'],
    skills: ['communication', 'social_media', 'writing', 'canva'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 9000, months: 3, hours: 24, deadlineIn: 5, postedAgo: 9, openings: 2,
    supervisor: ['Napat W.', 'Co-founder, Product'],
  }),
  listing({
    id: 'l_kradan_fe', startupId: 'st_kradan', title: 'Frontend Engineering Intern', field: 'engineering',
    summary: 'Build and ship screens in the Kradan web app alongside two full-time engineers, with code review on every change.',
    responsibilities: [
      'Implement interface components from Figma designs in React',
      'Fix reported interface bugs and write a short note on each cause',
      'Add tests for the components you build',
      'Take part in sprint planning and the Friday demo',
    ],
    learning: ['Working in a real codebase with code review', 'Component design and accessibility basics', 'How product, design and engineering plan a release'],
    requirements: ['At least one web project you can show, from a course or on your own', 'Basic Git', 'Year 2 or above'],
    skills: ['javascript', 'react', 'html_css', 'problem_solving'],
    noExp: true, minYear: 2, mode: 'hybrid', stipend: 12000, months: 4, hours: 32, deadlineIn: 12, postedAgo: 4,
    supervisor: ['Kan S.', 'Senior Engineer'],
  }),
  listing({
    id: 'l_kradan_content', startupId: 'st_kradan', title: 'Learning Content Intern', field: 'content',
    summary: 'Write and check practice questions and short explanations for the Thai and English sections of the app.',
    responsibilities: [
      'Draft 20 practice questions a week using the content guidelines',
      'Review explanations written by tutors for clarity',
      'Tag questions by topic and difficulty in the content system',
    ],
    learning: ['Editorial process and quality checks', 'Writing clear explanations', 'Using data on wrong answers to improve content'],
    requirements: ['Strong written Thai and English', 'Attention to detail'],
    skills: ['writing', 'english', 'communication'],
    noExp: true, minYear: 1, mode: 'remote', stipend: 7000, months: 3, hours: 16, deadlineIn: 19, postedAgo: 2,
    supervisor: ['Ornicha D.', 'Content Lead'],
  }),
  listing({
    id: 'l_green_social', startupId: 'st_greenloop', title: 'Social Content Intern', field: 'content',
    summary: 'Create short videos and posts that show how refill stations work, and help launch stations in two university dormitories.',
    responsibilities: [
      'Film and edit two short videos a week at refill stations',
      'Write captions and schedule posts on Instagram and TikTok',
      'Help run launch-day booths at two dormitories',
      'Track views and saves in a weekly sheet',
    ],
    learning: ['Planning a content calendar', 'Basic video editing workflow', 'Explaining a new habit to first-time users'],
    requirements: ['Own a phone that can record video', 'Able to travel to stations in central Bangkok'],
    skills: ['content_creation', 'social_media', 'video_editing', 'canva'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 8000, months: 3, hours: 20, deadlineIn: 3, postedAgo: 16,
    supervisor: ['Sirin K.', 'Co-founder'],
  }),
  listing({
    id: 'l_green_ops', startupId: 'st_greenloop', title: 'Operations Intern, Station Network', field: 'operations',
    summary: 'Keep 40 refill stations stocked and working by planning refill rounds and checking station data every morning.',
    responsibilities: [
      'Check the station dashboard each morning and flag low stock',
      'Plan weekly refill rounds with the operations lead',
      'Visit stations once a week to check condition and signage',
      'Keep the station log up to date',
    ],
    learning: ['How physical operations are planned and measured', 'Working with spreadsheets on real data', 'Coordinating with building managers'],
    requirements: ['Comfortable with spreadsheets', 'Able to visit stations by public transport'],
    skills: ['excel', 'project_coordination', 'problem_solving', 'communication'],
    noExp: true, minYear: 2, mode: 'onsite', stipend: 9000, months: 4, hours: 30, deadlineIn: 15, postedAgo: 6,
    supervisor: ['Pond A.', 'Operations Lead'],
  }),
  listing({
    id: 'l_pay_fin', startupId: 'st_paysabai', title: 'Finance & Reporting Intern', field: 'finance',
    summary: 'Support the monthly close and help prepare the management report that goes to the founders and investors.',
    responsibilities: [
      'Reconcile payment records against bank statements each week',
      'Update the monthly revenue and cost model',
      'Prepare charts for the management report',
      'Document one finance process end to end',
    ],
    learning: ['How a startup closes its books each month', 'Building and checking a financial model', 'Presenting numbers to non-finance colleagues'],
    requirements: ['Completed an introductory accounting course', 'Year 3 or above', 'Confident with spreadsheet formulas'],
    skills: ['excel', 'accounting', 'financial_modelling', 'data_analysis'],
    noExp: false, minYear: 3, mode: 'onsite', stipend: 14000, months: 4, hours: 40, deadlineIn: 8, postedAgo: 11,
    supervisor: ['Chanon P.', 'Head of Finance'],
  }),
  listing({
    id: 'l_pay_data', startupId: 'st_paysabai', title: 'Data Analyst Intern', field: 'data',
    summary: 'Answer product questions with data: write queries, build dashboards and explain what the numbers mean.',
    responsibilities: [
      'Write SQL queries for weekly product questions',
      'Maintain two dashboards used by the product team',
      'Check data quality and report gaps',
      'Present one analysis of your own at the end of the internship',
    ],
    learning: ['SQL on a production-scale database', 'Turning a vague question into an analysis', 'Communicating findings clearly'],
    requirements: ['Basic SQL from a course or project', 'Year 2 or above'],
    skills: ['sql', 'data_analysis', 'excel', 'python'],
    noExp: true, minYear: 2, mode: 'hybrid', stipend: 13000, months: 3, hours: 32, deadlineIn: 22, postedAgo: 1,
    supervisor: ['Mint C.', 'Data Lead'],
  }),
  listing({
    id: 'l_frame_content', startupId: 'st_framehaus', title: 'Content Production Intern', field: 'content',
    summary: 'Join the three-person content team that produces tutorials and creator interviews for the Framehaus channels.',
    responsibilities: [
      'Research and outline one tutorial video a week',
      'Assist on shoots and manage footage',
      'Cut short clips for social channels',
      'Write video descriptions and titles',
    ],
    learning: ['The full production cycle from idea to upload', 'Editing to a brief and a deadline', 'Reading channel analytics'],
    requirements: ['A sample of something you have made: a video, a post or an article', 'Available for shoots on Wednesdays'],
    skills: ['content_creation', 'video_editing', 'writing', 'social_media'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 8500, months: 3, hours: 24, deadlineIn: 10, postedAgo: 5,
    supervisor: ['Pim T.', 'Head of Content'],
  }),
  listing({
    id: 'l_frame_growth', startupId: 'st_framehaus', title: 'Growth Marketing Intern', field: 'digital_marketing',
    summary: 'Test new ways to reach creator teams, from partnership outreach to landing page experiments.',
    responsibilities: [
      'Build a list of 100 creator teams and run outreach',
      'Set up and monitor two landing page experiments',
      'Write a weekly summary of what worked',
    ],
    learning: ['Designing and reading a marketing experiment', 'Outreach writing', 'Basic funnel analysis'],
    requirements: ['Previous internship or part-time marketing experience', 'Year 3 or above', 'Professional written English'],
    skills: ['market_research', 'writing', 'seo', 'english', 'data_analysis'],
    noExp: false, minYear: 3, mode: 'remote', stipend: 11000, months: 4, hours: 30, deadlineIn: 27, postedAgo: 3,
    supervisor: ['Pim T.', 'Head of Content'],
  }),
  listing({
    id: 'l_stack_be', startupId: 'st_stackwell', title: 'Software Engineering Intern', field: 'engineering',
    summary: 'Work on the reporting service that shop owners use to see daily sales and stock levels.',
    responsibilities: [
      'Implement API endpoints with tests',
      'Investigate and fix bugs from the support queue',
      'Pair with a mentor twice a week',
      'Write technical notes for the features you ship',
    ],
    learning: ['Backend development in a production system', 'Testing and code review habits', 'Debugging with logs and metrics'],
    requirements: ['Programming coursework in any language', 'A project you can explain in detail', 'Year 3 or above'],
    skills: ['python', 'sql', 'javascript', 'problem_solving'],
    noExp: false, minYear: 3, mode: 'hybrid', stipend: 15000, months: 6, hours: 40, deadlineIn: 17, postedAgo: 8, openings: 2,
    supervisor: ['Kittipong S.', 'Engineering Lead'],
  }),
  listing({
    id: 'l_stack_cs', startupId: 'st_stackwell', title: 'Customer Success Intern', field: 'operations',
    summary: 'Help new shops set up their inventory and learn what makes onboarding easy or hard.',
    responsibilities: [
      'Guide new customers through setup by chat and phone',
      'Write and update help articles',
      'Record common problems and share them with the product team',
    ],
    learning: ['Talking to customers with confidence', 'Turning feedback into product input', 'How a software company supports its users'],
    requirements: ['Friendly, clear communicator in Thai', 'Patient with first-time software users'],
    skills: ['communication', 'customer_support', 'writing', 'problem_solving'],
    noExp: true, minYear: 1, mode: 'onsite', stipend: 9500, months: 3, hours: 30, deadlineIn: 6, postedAgo: 13,
    supervisor: ['Bow N.', 'Customer Success Lead'],
  }),
  listing({
    id: 'l_tuk_ops', startupId: 'st_tukroute', title: 'Operations Analyst Intern', field: 'operations',
    summary: 'Monitor live deliveries, find the causes of late orders and suggest fixes to the routing team.',
    responsibilities: [
      'Review daily delivery performance and list late orders',
      'Call merchants and drivers to understand what went wrong',
      'Maintain the weekly operations report',
      'Propose one process improvement and test it',
    ],
    learning: ['Root-cause analysis on real operations', 'Working with drivers and merchants', 'Reporting to a management team'],
    requirements: ['Comfortable making phone calls in Thai', 'Spreadsheet basics'],
    skills: ['excel', 'data_analysis', 'communication', 'problem_solving'],
    noExp: true, minYear: 2, mode: 'onsite', stipend: 10000, months: 4, hours: 36, deadlineIn: 13, postedAgo: 7,
    supervisor: ['Arthit M.', 'Operations Manager'],
  }),
  listing({
    id: 'l_tuk_bd', startupId: 'st_tukroute', title: 'Business Development Intern', field: 'bizdev',
    summary: 'Find and qualify small courier fleets that could use Tuk Route, and sit in on sales meetings.',
    responsibilities: [
      'Research courier companies and build a lead list',
      'Make first contact by phone and LINE',
      'Prepare meeting notes and follow-up messages',
      'Update the sales pipeline every day',
    ],
    learning: ['How B2B sales works in practice', 'Researching a market', 'Professional follow-up and note-taking'],
    requirements: ['Confident speaking with business owners', 'Organised and reliable'],
    skills: ['sales', 'communication', 'market_research', 'presentation'],
    noExp: true, minYear: 2, mode: 'hybrid', stipend: 9000, months: 3, hours: 24, deadlineIn: 24, postedAgo: 2,
    supervisor: ['Nicha V.', 'Head of Sales'],
  }),
  listing({
    id: 'l_klinik_pm', startupId: 'st_klinikloop', title: 'Product Intern', field: 'product',
    summary: 'Research how clinic staff handle appointments, support product tests and present weekly findings to the team.',
    responsibilities: [
      'Interview clinic front-desk staff and summarise what you hear',
      'Support usability tests of new booking features',
      'Write up weekly findings and present them on Fridays',
      'Keep the feedback board organised',
    ],
    learning: ['User research methods', 'How product decisions are made from evidence', 'Writing a clear product brief'],
    requirements: ['Curious and comfortable talking to strangers', 'Clear written Thai', 'Year 2 or above'],
    skills: ['ux_research', 'communication', 'writing', 'presentation'],
    noExp: true, minYear: 2, mode: 'hybrid', stipend: 10000, months: 4, hours: 28, deadlineIn: 9, postedAgo: 10,
    supervisor: ['Dr. Warisa L.', 'Co-founder, Product'],
  }),
  listing({
    id: 'l_klinik_ux', startupId: 'st_klinikloop', title: 'UX Design Intern', field: 'ux_design',
    summary: 'Design and test improvements to the patient reminder flow with the lead designer.',
    responsibilities: [
      'Produce wireframes and clickable prototypes in Figma',
      'Run five usability sessions and summarise the results',
      'Prepare design files for handoff to engineers',
    ],
    learning: ['An end-to-end design process', 'Testing designs with real users', 'Working with engineers on handoff'],
    requirements: ['A portfolio with at least two projects, coursework is fine', 'Year 2 or above'],
    skills: ['figma', 'ux_research', 'graphic_design', 'presentation'],
    noExp: true, minYear: 2, mode: 'hybrid', stipend: 11000, months: 3, hours: 30, deadlineIn: 4, postedAgo: 14,
    supervisor: ['Ice P.', 'Lead Designer'],
  }),
  listing({
    id: 'l_lumen_bd', startupId: 'st_lumen', title: 'Partnerships Intern', field: 'bizdev',
    summary: 'Help sign up new cloud kitchens and support them through their first month on Lumen Kitchen.',
    responsibilities: [
      'Visit kitchens with the growth lead and take notes',
      'Prepare onboarding materials for new partners',
      'Check in with new kitchens weekly and record issues',
    ],
    learning: ['Selling to and supporting small business owners', 'Preparing clear onboarding material', 'How an early-stage team finds its first customers'],
    requirements: ['Able to travel within Bangkok', 'Clear spoken Thai'],
    skills: ['communication', 'sales', 'presentation', 'project_coordination'],
    noExp: true, minYear: 1, mode: 'onsite', stipend: 8000, months: 3, hours: 24, deadlineIn: 20, postedAgo: 6,
    supervisor: ['Thanakorn J.', 'Co-founder, Growth'],
  }),
  listing({
    id: 'l_lumen_mkt', startupId: 'st_lumen', title: 'Marketing Intern', field: 'marketing',
    summary: 'Write case studies about partner kitchens and manage the Lumen Kitchen social pages.',
    responsibilities: [
      'Interview two partner kitchens a month and write case studies',
      'Schedule posts for Facebook and LINE Official Account',
      'Design simple graphics for announcements',
    ],
    learning: ['Business-to-business marketing basics', 'Interviewing and writing case studies', 'Managing brand channels'],
    requirements: ['Good written Thai', 'Basic graphic design in any tool'],
    skills: ['writing', 'social_media', 'canva', 'communication'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 7500, months: 2, hours: 20, deadlineIn: 29, postedAgo: 1,
    supervisor: ['Thanakorn J.', 'Co-founder, Growth'],
  }),
  listing({
    id: 'l_baanly_design', startupId: 'st_baanly', title: 'Product Design Intern', field: 'ux_design',
    summary: 'Improve the room listing page and search filters used by students looking for housing.',
    responsibilities: [
      'Audit the current listing page and propose changes',
      'Design and prototype two improvements in Figma',
      'Test the prototypes with five students',
      'Support the engineer who builds the final design',
    ],
    learning: ['Designing for a live product with real constraints', 'Running quick usability tests', 'Design critique with a senior designer'],
    requirements: ['Portfolio with interface design work', 'Previous design internship or freelance work', 'Year 3 or above'],
    skills: ['figma', 'ux_research', 'graphic_design'],
    noExp: false, minYear: 3, mode: 'hybrid', stipend: 12000, months: 4, hours: 32, deadlineIn: 16, postedAgo: 9,
    supervisor: ['Mook R.', 'Design Lead'],
  }),
  listing({
    id: 'l_baanly_community', startupId: 'st_baanly', title: 'Campus Community Intern', field: 'social_media',
    summary: 'Represent Baanly on your campus, collect student housing questions and help plan two campus events.',
    responsibilities: [
      'Answer housing questions in student groups',
      'Collect feedback from students who used Baanly',
      'Help plan and run two campus events',
      'Write a short monthly report',
    ],
    learning: ['Community building', 'Event planning on a small budget', 'Collecting and presenting user feedback'],
    requirements: ['Active in at least one student club or community', 'Reliable and responsive on LINE'],
    skills: ['community', 'communication', 'social_media', 'project_coordination'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 6000, months: 3, hours: 12, deadlineIn: 2, postedAgo: 20, openings: 3,
    supervisor: ['Jane L.', 'Growth Lead'],
  }),
  listing({
    id: 'l_wander_ops', startupId: 'st_wanderlane', title: 'Experience Operations Intern', field: 'operations',
    summary: 'Coordinate hosts and guests for weekend experiences and help onboard new hosts.',
    responsibilities: [
      'Confirm bookings with hosts and guests',
      'Join one experience a week and write a quality report',
      'Help new hosts prepare their listing',
    ],
    learning: ['Marketplace operations', 'Quality control for a service business', 'Clear guest communication in English'],
    requirements: ['Conversational English', 'Available on some weekends'],
    skills: ['communication', 'english', 'customer_support', 'project_coordination'],
    noExp: true, minYear: 1, mode: 'hybrid', stipend: 7000, months: 3, hours: 20, deadlineIn: 14, postedAgo: 4,
    supervisor: ['Jirayu B.', 'Founder'],
  }),
  listing({
    id: 'l_mint_mkt', startupId: 'st_mintpot', title: 'Social Media Intern', field: 'social_media',
    summary: 'Create posts and reply to customer messages for an online plant shop.',
    responsibilities: ['Create daily posts', 'Reply to customer messages', 'Help pack orders when needed'],
    learning: ['Running a small shop social account'],
    requirements: ['Interest in plants'],
    skills: ['social_media', 'canva', 'photography'],
    noExp: true, minYear: 1, mode: 'remote', stipend: null, months: 2, hours: 15, deadlineIn: 18, postedAgo: 12,
  }),
  listing({
    id: 'l_orbit_bd', startupId: 'st_orbit', title: 'Sales Intern', field: 'sales',
    summary: 'Contact parents and schedule trial lessons for an online tutoring service.',
    responsibilities: ['Call parents from a contact list', 'Schedule trial lessons'],
    learning: ['Phone sales'],
    requirements: ['Good speaking skills'],
    skills: ['sales', 'communication'],
    noExp: true, minYear: 1, mode: 'remote', stipend: null, months: 3, hours: 20, deadlineIn: 26, postedAgo: 5,
  }),
];

const extraListings: Listing[] = NEW_LISTINGS.map((n) => {
  const company = startups.find((x) => x.id === n.startupId)!;
  return {
    ...expand(n),
    id: n.id,
    startupId: n.startupId,
    title: n.title,
    field: n.field,
    summary: n.summary,
    noExperienceRequired: n.noExp,
    minYear: n.minYear,
    workMode: n.mode,
    district: company.district,
    paid: n.paid ?? n.stipend !== null,
    stipendMonthly: n.stipend,
    benefits: company.benefits.slice(0, 4),
    durationMonths: n.months,
    hoursPerWeek: n.hours,
    startDate: daysFromNow(n.deadlineIn + 21),
    deadline: daysFromNow(n.deadlineIn, 23),
    openings: n.openings ?? 1,
    supervisorName: n.supervisor[0],
    supervisorRole: n.supervisor[1],
    status: 'open',
    postedAt: daysFromNow(-n.postedAgo),
    updatedAt: daysFromNow(-Math.min(n.postedAgo, 3)),
    isDemo: true,
  };
});

const listings: Listing[] = [...originalListings, ...extraListings];

const startupStatus: Record<string, VerificationStatus> = {
  st_wanderlane: 'pending',
  st_mintpot: 'unverified',
  st_orbit: 'unverified',
  st_chargeway: 'pending',
  st_carbonly: 'pending',
};

const listingStatusOverride: Record<string, VerificationStatus> = {
  // Verified company, but this role was edited recently and is waiting for a re-check.
  l_lumen_mkt: 'pending',
};

function verificationRecords(): VerificationRecord[] {
  const records: VerificationRecord[] = [];
  startups.forEach((s, i) => {
    const status = startupStatus[s.id] ?? 'verified';
    const verified = status === 'verified';
    records.push({
      id: `v_${s.id}`,
      subjectType: 'startup',
      subjectId: s.id,
      status,
      checks: verified
        ? { registration: true, contact: true, presence: true, conduct: true }
        : status === 'pending'
          ? { registration: true, contact: true }
          : {},
      verifiedAt: verified ? daysFromNow(-(20 + ((i * 7) % 70))) : null,
      lastCheckedAt: verified ? daysFromNow(-(4 + (i % 5) * 3)) : status === 'pending' ? daysFromNow(-2) : null,
      reviewerNote:
        status === 'pending'
          ? 'Registration document received. Waiting for a call with the founder.'
          : status === 'unverified'
            ? 'No verification documents submitted.'
            : '',
    });
  });
  listings.forEach((l, i) => {
    const companyStatus = startupStatus[l.startupId] ?? 'verified';
    const status = listingStatusOverride[l.id] ?? companyStatus;
    const verified = status === 'verified';
    records.push({
      id: `v_${l.id}`,
      subjectType: 'listing',
      subjectId: l.id,
      status,
      checks: verified ? { responsibilities: true, supervisor: true, terms: true, eligibility: true } : {},
      verifiedAt: verified ? l.postedAt : null,
      lastCheckedAt: verified ? daysFromNow(-(1 + (i % 6))) : null,
      reviewerNote: status === 'pending' ? 'Submitted for review.' : '',
    });
  });
  return records;
}

function student(
  id: string,
  userId: string,
  name: string,
  email: string,
  rest: Partial<Student>,
): Student {
  return {
    id,
    userId,
    name,
    email,
    universityId: 'uni_bdu',
    faculty: '',
    major: null,
    year: null,
    skills: [],
    interests: [],
    industries: [],
    careerGoal: null,
    experience: null,
    experienceNote: '',
    about: '',
    portfolioUrl: '',
    resume: null,
    prefs: { workModes: [], paidOnly: false, maxDurationMonths: null },
    updatedAt: daysFromNow(-6),
    isDemo: true,
    ...rest,
  };
}

const students: Student[] = [
  student('s_ploy', 'u_ploy', 'Ploy S. (demo)', 'ploy@student.example', {
    faculty: 'Faculty of Commerce and Accountancy',
    major: 'marketing',
    year: 2,
    skills: ['communication', 'social_media', 'canva', 'writing', 'content_creation', 'english'],
    interests: ['marketing', 'content'],
    industries: ['edtech', 'creative', 'climate'],
    careerGoal: 'marketing',
    experience: 'none',
    experienceNote: 'Publicity lead for the faculty marketing club. No work experience yet.',
    about: 'Second-year marketing student looking for a first internship where I can learn how a startup grows its community.',
    prefs: { workModes: ['onsite', 'hybrid'], paidOnly: false, maxDurationMonths: 4 },
  }),
  student('s_tan', 'u_tan', 'Tan K. (demo)', 'tan@student.example', {
    faculty: 'Faculty of Engineering',
    major: 'cs',
    year: 3,
    skills: ['javascript', 'react', 'html_css', 'python', 'problem_solving'],
    interests: ['engineering', 'product'],
    industries: ['edtech', 'saas'],
    careerGoal: 'engineering',
    experience: 'projects',
    experienceNote: 'Built a course-planning web app as a class project.',
    about: 'Third-year computer science student who enjoys building interfaces.',
    prefs: { workModes: ['hybrid', 'remote'], paidOnly: true, maxDurationMonths: 6 },
  }),
  student('s_mild', 'u_mild', 'Mild T. (demo)', 'mild@student.example', {
    faculty: 'Faculty of Commerce and Accountancy',
    major: 'finance',
    year: 3,
    skills: ['excel', 'accounting', 'financial_modelling', 'presentation'],
    interests: ['finance', 'data'],
    industries: ['fintech'],
    careerGoal: 'finance',
    experience: 'internship',
    experienceNote: 'Two-month summer internship at an accounting firm.',
    about: 'Finance student interested in how young companies manage money.',
    prefs: { workModes: ['onsite', 'hybrid'], paidOnly: true, maxDurationMonths: 4 },
  }),
  student('s_beam', 'u_beam', 'Beam R. (demo)', 'beam@student.example', {
    faculty: 'Faculty of Communication Arts',
    major: 'commarts',
    year: 2,
    skills: ['writing', 'communication', 'social_media', 'video_editing'],
    interests: ['content', 'marketing'],
    industries: ['edtech', 'creative'],
    careerGoal: 'content',
    experience: 'none',
    experienceNote: '',
    about: 'Communication arts student who writes for the campus magazine.',
    prefs: { workModes: ['hybrid', 'remote'], paidOnly: false, maxDurationMonths: 3 },
  }),
];

const users: User[] = [
  { id: 'u_ploy', role: 'student', name: 'Ploy S. (demo)', email: 'ploy@student.example', studentId: 's_ploy', isDemo: true },
  { id: 'u_tan', role: 'student', name: 'Tan K. (demo)', email: 'tan@student.example', studentId: 's_tan', isDemo: true },
  { id: 'u_mild', role: 'student', name: 'Mild T. (demo)', email: 'mild@student.example', studentId: 's_mild', isDemo: true },
  { id: 'u_beam', role: 'student', name: 'Beam R. (demo)', email: 'beam@student.example', studentId: 's_beam', isDemo: true },
  { id: 'u_kradan', role: 'startup', name: 'Napat W. (demo)', email: 'napat@kradan.example', startupId: 'st_kradan', isDemo: true },
  { id: 'u_paysabai', role: 'startup', name: 'Chanon P. (demo)', email: 'chanon@paysabai.example', startupId: 'st_paysabai', isDemo: true },
  { id: 'u_bdu', role: 'university', name: 'Career Office (demo)', email: 'careers@bdu.example', universityId: 'uni_bdu', isDemo: true },
  { id: 'u_verify', role: 'admin', name: 'Verification Team (demo)', email: 'verify@kaona.example', isDemo: true },
];

function application(
  id: string,
  listingId: string,
  studentId: string,
  motivation: string,
  appliedAgo: number,
  later: ApplicationEvent[],
  extra: Partial<Application> = {},
): Application {
  const l = listings.find((x) => x.id === listingId)!;
  const appliedAt = daysFromNow(-appliedAgo, 14);
  const events: ApplicationEvent[] = [
    { at: appliedAt, status: 'submitted', actor: 'student', message: '' },
    ...later,
  ];
  const last = events[events.length - 1];
  return {
    id,
    listingId,
    startupId: l.startupId,
    studentId,
    status: last.status,
    motivation,
    availableFrom: 'From the listed start date',
    portfolioUrl: '',
    resume: null,
    appliedAt,
    updatedAt: last.at,
    events,
    interview: null,
    ...extra,
  };
}

const applications: Application[] = [
  application(
    'a_ploy_kradan', 'l_kradan_mkt', 's_ploy',
    'I used Kradan when I prepared for my own entrance exams, and I now run the social pages for my faculty marketing club. I would like to learn how a startup plans content with real numbers behind it.',
    6,
    [
      { at: daysFromNow(-4, 11), status: 'in_review', actor: 'startup', message: 'Thanks for applying. We are reading applications this week.' },
      { at: daysFromNow(-1, 16), status: 'interview', actor: 'startup', message: 'We would like to meet you. Please bring one post you made for your club and tell us what you would change about it.' },
    ],
    {
      interview: {
        at: daysFromNow(3, 14),
        mode: 'in_person',
        place: 'Kradan Learning office, Sam Yan (address sent by email)',
        withName: 'Napat W., Co-founder',
        note: 'About 30 minutes. Casual dress is fine.',
      },
    },
  ),
  application(
    'a_ploy_green', 'l_green_social', 's_ploy',
    'I care about reducing plastic on campus and I make short videos for my club. I would like to help explain refill stations to students who have never used one.',
    5,
    [{ at: daysFromNow(-2, 10), status: 'in_review', actor: 'startup', message: '' }],
  ),
  application(
    'a_ploy_frame', 'l_frame_content', 's_ploy',
    'I follow several of the creators who use Framehaus and want to understand the production process behind tutorial videos.',
    1,
    [],
  ),
  application(
    'a_tan_kradan', 'l_kradan_fe', 's_tan',
    'I built a course-planning app in React for a class project and want to learn how a team reviews and ships code.',
    3,
    [{ at: daysFromNow(-1, 9), status: 'in_review', actor: 'startup', message: '' }],
  ),
  application(
    'a_beam_kradan', 'l_kradan_content', 's_beam',
    'I write and edit for the campus magazine and would enjoy writing clear explanations for students.',
    1,
    [],
  ),
  application(
    'a_beam_kradan_mkt', 'l_kradan_mkt', 's_beam',
    'I manage a study-tips Instagram page with friends and would like to help the Kradan community grow.',
    2,
    [],
  ),
  application(
    'a_mild_pay', 'l_pay_fin', 's_mild',
    'My summer internship covered monthly reconciliations, and I want to see the same process in a fast-moving company.',
    9,
    [
      { at: daysFromNow(-7, 10), status: 'in_review', actor: 'startup', message: '' },
      { at: daysFromNow(-4, 15), status: 'interview', actor: 'startup', message: 'Please join a 30-minute video call with our Head of Finance.' },
      { at: daysFromNow(-1, 12), status: 'offer', actor: 'startup', message: 'We would like to offer you the internship. Please reply within five days.' },
    ],
  ),
  {
    id: 'a_ploy_sw_draft',
    listingId: 'l_sw_mkt',
    startupId: 'st_siamweave',
    studentId: 's_ploy',
    status: 'draft',
    motivation: 'I shop at Threadline and I like how each small collection sells out and comes back based on what customers ask for.',
    availableFrom: 'From the listed start date',
    portfolioUrl: '',
    resume: null,
    appliedAt: daysFromNow(-1, 20),
    updatedAt: daysFromNow(-1, 20),
    events: [],
    interview: null,
  }
];

export function createSeed(): Database {
  return {
    schemaVersion: SCHEMA_VERSION,
    seededAt: nowISO(),
    users,
    universities,
    students,
    startups,
    listings,
    verifications: verificationRecords(),
    applications,
    reviews: [],
    saved: [
      { studentId: 's_ploy', listingId: 'l_baanly_community', savedAt: daysFromNow(-2) },
      { studentId: 's_ploy', listingId: 'l_lumen_mkt', savedAt: daysFromNow(-1) },
    ],
    notifications: [
      {
        id: 'n_seed_1',
        userId: 'u_ploy',
        kind: 'application',
        title: 'Interview invitation from Kradan Learning',
        body: 'Marketing & Community Intern. Open the application to see the time and place.',
        link: '/applications/a_ploy_kradan',
        createdAt: daysFromNow(-1, 16),
        read: false,
      },
      {
        id: 'n_seed_2',
        userId: 'u_ploy',
        kind: 'application',
        title: 'Greenloop Refill is reviewing your application',
        body: 'Social Content Intern moved to "In review".',
        link: '/applications/a_ploy_green',
        createdAt: daysFromNow(-2, 10),
        read: true,
      },
      {
        id: 'n_seed_3',
        userId: 'u_kradan',
        kind: 'application',
        title: 'New application: Learning Content Intern',
        body: 'Beam R. (demo) applied.',
        link: '/startup/listings/l_kradan_content/applicants',
        createdAt: daysFromNow(-1, 14),
        read: false,
      },
    ],
    reports: [],
    recentlyViewed: { u_ploy: ['l_kradan_mkt', 'l_green_social', 'l_klinik_pm'] },
    recentCompanies: { u_ploy: ['st_kradan', 'st_greenloop', 'st_saeng'] },
    compare: [],
  };
}

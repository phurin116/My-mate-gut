import type { SkillId } from '../../domain/catalog';
import type { FieldId, WorkMode } from '../../domain/types';

/**
 * Additional demo internships for the fictional companies in companies.ts.
 * Each role starts from a category template (typical tasks, requirements and
 * skills for that kind of internship) and adds its own title and summary.
 * Allowances and deadlines are demo values, not real offers.
 */

interface Template {
  responsibilities: string[];
  requirements: string[];
  skills: SkillId[];
  learning: string[];
}

const T: Record<FieldId, Template> = {
  marketing: {
    responsibilities: ['Help plan monthly marketing campaigns with the brand team', 'Prepare briefs for agencies and in-store teams', 'Track campaign results in a weekly report', 'Research competitors and customer trends', 'Interview three customers a month and summarise what you learn', 'Help prepare the monthly marketing budget tracker'],
    requirements: ['Interest in brands and consumer behaviour', 'Good written Thai and English'],
    skills: ['communication', 'market_research', 'presentation', 'excel'],
    learning: ['How a campaign is planned from brief to results', 'Writing clear briefs', 'Reading marketing numbers'],
  },
  digital_marketing: {
    responsibilities: ['Set up and monitor online ad campaigns with a specialist', 'Prepare weekly performance reports', 'Suggest new ad copy and audiences to test', 'Check landing pages for errors before launch', 'Build audience lists for retargeting with a specialist', 'Run a small A/B test and present the result'],
    requirements: ['Interest in online advertising', 'Comfortable with numbers and spreadsheets'],
    skills: ['google_ads', 'data_analysis', 'copywriting', 'excel'],
    learning: ['How paid search and social ads work', 'Testing and measuring campaigns', 'Presenting results to clients'],
  },
  social_media: {
    responsibilities: ['Draft daily posts and captions for brand accounts', 'Reply to comments and messages using the tone guide', 'Collect ideas from trending content each week', 'Report reach and engagement every Friday', 'Film and edit one short video a week', 'Keep a library of approved photos and clips organised'],
    requirements: ['Active user of Instagram, TikTok or Facebook', 'Clear written Thai'],
    skills: ['social_media', 'copywriting', 'canva', 'content_creation'],
    learning: ['Planning a content calendar', 'Writing in a brand voice', 'Reading social media analytics'],
  },
  content: {
    responsibilities: ['Research and write articles or scripts', 'Edit short videos and graphics for social channels', 'Check facts and spelling before publishing', 'Keep the content calendar up to date', 'Interview team members or customers for stories', 'Repurpose long articles into short social posts'],
    requirements: ['A writing or video sample, coursework is fine', 'Attention to detail'],
    skills: ['writing', 'content_creation', 'video_editing', 'canva'],
    learning: ['An editorial workflow', 'Writing for different audiences', 'Measuring what content works'],
  },
  pr: {
    responsibilities: ['Draft press releases and media pitches', 'Build and update media contact lists', 'Monitor news coverage and prepare clipping reports', 'Help prepare press events and media kits', 'Write short founder profiles and company fact sheets', 'Track journalist requests and reply deadlines'],
    requirements: ['Strong written Thai and English', 'Interest in media and current affairs'],
    skills: ['writing', 'copywriting', 'communication', 'english'],
    learning: ['How media relations works', 'Writing press materials', 'Planning a launch'],
  },
  events: {
    responsibilities: ['Help plan event timelines and run sheets', 'Contact suppliers and venues for quotes', 'Prepare registration lists and signage', 'Support the team on event days', 'Collect feedback after each event and summarise it', 'Keep the event budget tracker up to date'],
    requirements: ['Organised and calm under pressure', 'Available for some evening or weekend events'],
    skills: ['event_planning', 'project_coordination', 'communication', 'excel'],
    learning: ['Running an event from plan to wrap-up', 'Working with suppliers', 'Managing budgets and timelines'],
  },
  sales: {
    responsibilities: ['Research and qualify potential customers', 'Make first contact by phone, email and LINE', 'Prepare quotes and follow-up messages', 'Update the sales pipeline daily', 'Join sales calls and write the summary afterwards', 'Build a list of common customer questions with answers'],
    requirements: ['Confident speaking with customers', 'Organised and reliable'],
    skills: ['sales', 'communication', 'negotiation', 'presentation'],
    learning: ['How a sales pipeline works', 'Handling objections', 'Professional follow-up'],
  },
  bizdev: {
    responsibilities: ['Research potential partner locations and companies', 'Prepare partnership proposals and pitch decks', 'Join meetings with the partnerships lead and take notes', 'Track partner conversations in the CRM', 'Map competitors and potential partners in one market', 'Prepare a monthly partnerships report'],
    requirements: ['Interested in business and partnerships', 'Clear spoken Thai'],
    skills: ['market_research', 'presentation', 'communication', 'negotiation'],
    learning: ['How partnerships are found and closed', 'Building a pitch deck', 'Running a sales process'],
  },
  finance: {
    responsibilities: ['Update monthly budget and forecast files', 'Prepare charts for management reports', 'Reconcile figures between systems', 'Document one finance process step by step', 'Help prepare the monthly investor update numbers', 'Check invoices against purchase records'],
    requirements: ['Finance, accounting or economics student', 'Confident with spreadsheet formulas'],
    skills: ['excel', 'financial_modelling', 'accounting', 'data_analysis'],
    learning: ['Budgeting and forecasting', 'Building a financial model', 'Presenting numbers clearly'],
  },
  accounting: {
    responsibilities: ['Record invoices and receipts in the accounting system', 'Help prepare monthly closing schedules', 'Match bank statements to the ledger', 'Support audit preparation with documents', 'File tax documents and keep the document index tidy', 'Help prepare expense claims for approval'],
    requirements: ['Accounting or finance student', 'Careful with numbers and documents'],
    skills: ['accounting', 'excel', 'problem_solving'],
    learning: ['The monthly bookkeeping cycle', 'How an audit is prepared', 'Thai tax documents in practice'],
  },
  consulting: {
    responsibilities: ['Research industries and competitors for client projects', 'Build analysis in Excel and turn it into slides', 'Take notes in client meetings', 'Check numbers and sources before reviews', 'Interview client staff and summarise the findings', 'Draft one section of the final recommendation'],
    requirements: ['Strong analytical thinking', 'Professional written English'],
    skills: ['market_research', 'excel', 'presentation', 'problem_solving'],
    learning: ['Structuring business problems', 'Building clear slides', 'Working on client projects'],
  },
  hr: {
    responsibilities: ['Screen applications and schedule interviews', 'Update employee records and onboarding checklists', 'Help organise training sessions', 'Draft internal announcements', 'Write job posts and share them on hiring channels', 'Run a short employee feedback survey and summarise results'],
    requirements: ['Interest in people and workplaces', 'Can keep information confidential'],
    skills: ['recruiting', 'communication', 'excel', 'writing'],
    learning: ['How recruitment works', 'Onboarding and training', 'HR policies in practice'],
  },
  graphic_design: {
    responsibilities: ['Design social media graphics and print materials', 'Adapt designs into different sizes and formats', 'Prepare files for printers and the web', 'Present ideas in weekly design reviews', 'Build templates the wider team can reuse', 'Create simple motion graphics for social posts'],
    requirements: ['A portfolio, coursework is fine', 'Basic Adobe Illustrator or Photoshop'],
    skills: ['graphic_design', 'adobe_creative', 'canva', 'presentation'],
    learning: ['Working to a brand guideline', 'Preparing files for production', 'Taking design feedback'],
  },
  ux_design: {
    responsibilities: ['Create wireframes and prototypes in Figma', 'Help run usability tests and write up findings', 'Update components in the design library', 'Prepare designs for engineering handoff', 'Review competitor apps and present what works', 'Write interface text with the product team'],
    requirements: ['A portfolio with at least one interface project', 'Basic Figma'],
    skills: ['figma', 'ux_research', 'graphic_design', 'presentation'],
    learning: ['An end-to-end design process', 'Testing with real users', 'Working with engineers'],
  },
  engineering: {
    responsibilities: ['Build features with a mentor reviewing your code', 'Fix bugs from the support queue', 'Write tests for the code you change', 'Join sprint planning and demos', 'Write a short technical note for each feature you ship', 'Improve one slow or fragile part of the codebase'],
    requirements: ['Programming coursework or a personal project', 'Basic Git'],
    skills: ['javascript', 'react', 'html_css', 'problem_solving'],
    learning: ['Working in a production codebase', 'Code review habits', 'Debugging real issues'],
  },
  data: {
    responsibilities: ['Clean and prepare data for analysis', 'Build and update dashboards', 'Answer weekly business questions with SQL', 'Present one analysis of your own', 'Check data quality and document any gaps', 'Automate one recurring report'],
    requirements: ['Basic SQL or Excel from a course', 'Curious about numbers'],
    skills: ['sql', 'data_analysis', 'power_bi', 'excel'],
    learning: ['SQL on real business data', 'Dashboard design', 'Explaining findings to non-analysts'],
  },
  product: {
    responsibilities: ['Collect and organise customer feedback', 'Write simple product briefs with the product manager', 'Help plan and test new features', 'Track feature usage after release', 'Analyse how a recent feature is being used', 'Write release notes for customers'],
    requirements: ['Curious about how products are built', 'Clear writing'],
    skills: ['ux_research', 'writing', 'data_analysis', 'presentation'],
    learning: ['How product decisions are made', 'Writing product briefs', 'Measuring feature success'],
  },
  ecommerce: {
    responsibilities: ['Update product listings, prices and photos on online stores', 'Monitor orders, stock and customer reviews', 'Help plan marketplace campaigns such as monthly sales days', 'Report weekly online sales', 'Write product descriptions that answer common questions', 'Analyse abandoned carts and suggest fixes'],
    requirements: ['Familiar with online shopping platforms', 'Comfortable with spreadsheets'],
    skills: ['excel', 'data_analysis', 'copywriting', 'customer_support'],
    learning: ['Running an online store day to day', 'Marketplace campaigns', 'Reading sales data'],
  },
  operations: {
    responsibilities: ['Monitor daily operations data and flag problems', 'Update process documents', 'Coordinate with other teams to fix issues', 'Prepare a weekly operations summary', 'Answer escalated customer issues with the team lead', 'Run a small process improvement and measure it'],
    requirements: ['Organised and practical', 'Spreadsheet basics'],
    skills: ['excel', 'project_coordination', 'problem_solving', 'communication'],
    learning: ['How operations are measured', 'Process improvement', 'Cross-team coordination'],
  },
  supply_chain: {
    responsibilities: ['Track purchase orders and supplier deliveries', 'Update stock and demand planning sheets', 'Help compare supplier quotes', 'Prepare a weekly inventory report', 'Visit a supplier or warehouse and write up what you saw', 'Flag slow-moving items and suggest actions'],
    requirements: ['Logistics, engineering or business student', 'Comfortable with spreadsheets'],
    skills: ['supply_planning', 'excel', 'data_analysis', 'negotiation'],
    learning: ['How stock and demand are planned', 'Working with suppliers', 'Inventory reporting'],
  },
};

export interface NewListingInput {
  id: string;
  startupId: string;
  title: string;
  field: FieldId;
  summary: string;
  /** Monthly allowance in THB; null with paid=true means not stated. */
  stipend: number | null;
  paid?: boolean;
  noExp: boolean;
  minYear: number;
  mode: WorkMode;
  months: number;
  hours: number;
  deadlineIn: number;
  postedAgo: number;
  supervisor: [string, string];
  openings?: number;
  /** A responsibility specific to this role at this startup. Listed first. */
  extraResponsibility?: string;
  skills?: SkillId[];
}

/** Stable number from an id, so each listing always draws the same items from its category pool. */
function seedOf(id: string): number {
  let n = 0;
  for (const ch of id) n = (n * 31 + ch.charCodeAt(0)) % 9973;
  return n;
}

/**
 * Builds the full listing content. Every role gets its own first responsibility
 * and a different selection from the category pool, so two internships in the
 * same category do not read the same.
 */
export function expand(i: NewListingInput) {
  const t = T[i.field];
  const start = seedOf(i.id) % t.responsibilities.length;
  const picked = [0, 1, 2].map((k) => t.responsibilities[(start + k * 2 + (k === 2 ? 1 : 0)) % t.responsibilities.length]);
  const responsibilities = [...new Set(i.extraResponsibility ? [i.extraResponsibility, ...picked] : [...picked, t.responsibilities[(start + 1) % t.responsibilities.length]])];
  return {
    responsibilities,
    requirements: i.noExp
      ? [...t.requirements, 'No previous work experience needed']
      : [...t.requirements, 'Some previous experience, such as an internship, part-time job or significant project'],
    skills: i.skills ?? t.skills,
    learning: t.learning,
  };
}

/** Compact constructor for the roles added in the startup-focused release. */
function n(
  id: string,
  startupId: string,
  title: string,
  field: FieldId,
  summary: string,
  focus: string,
  stipend: number | null,
  noExp: boolean,
  minYear: number,
  mode: WorkMode,
  months: number,
  hours: number,
  deadlineIn: number,
  postedAgo: number,
  supName: string,
  supRole: string,
  skills?: SkillId[],
): NewListingInput {
  return { id, startupId, title, field, summary, extraResponsibility: focus, stipend, noExp, minYear, mode, months, hours, deadlineIn, postedAgo, supervisor: [supName, supRole], skills };
}

export const NEW_LISTINGS: NewListingInput[] = [
  // Threadline
  { id: 'l_sw_mkt', startupId: 'st_siamweave', title: 'Brand Marketing Intern', field: 'marketing', summary: 'Support the brand team on small-batch collection launches, from pop-up shop themes to student promotions.', stipend: 10000, noExp: true, minYear: 2, mode: 'onsite', months: 3, hours: 40, deadlineIn: 11, postedAgo: 3, supervisor: ['Khun Darin P.', 'Brand Manager'], extraResponsibility: 'Help plan one pop-up shop weekend and report what sold' },
  { id: 'l_sw_acc', startupId: 'st_siamweave', title: 'Accounting Intern', field: 'accounting', summary: 'Join a three-person finance team and help reconcile app, marketplace and pop-up sales for the monthly close.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 18, postedAgo: 8, supervisor: ['Khun Orawan S.', 'Accounting Supervisor'] },
  { id: 'l_sw_ecom', startupId: 'st_siamweave', title: 'E-commerce Intern', field: 'ecommerce', summary: 'Help run the online shop and marketplace stores, from product listings to monthly sale days.', stipend: 10000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 36, deadlineIn: 6, postedAgo: 5, supervisor: ['Khun Nontaya R.', 'E-commerce Lead'] },
  // Chao Phraya Advisory
  { id: 'l_cpa_consult', startupId: 'st_chaophraya', title: 'Business Analyst Intern', field: 'consulting', summary: 'Support analysts helping family businesses plan their next move. Research markets, build analysis and set up the planning tool for clients.', stipend: 12000, noExp: true, minYear: 3, mode: 'hybrid', months: 3, hours: 40, deadlineIn: 15, postedAgo: 4, supervisor: ['Khun Somsak R.', 'Partner'] },
  // Northpeak Consulting
  { id: 'l_np_strategy', startupId: 'st_northpeak', title: 'Strategy Intern', field: 'consulting', summary: 'Join a client project and work out where AI could save the most time: map workflows, size the benefit and present recommendations.', stipend: 18000, noExp: false, minYear: 3, mode: 'onsite', months: 3, hours: 45, deadlineIn: 9, postedAgo: 12, supervisor: ['Khun Anchalee P.', 'Engagement Manager'], skills: ['market_research', 'excel', 'presentation', 'english', 'problem_solving'] },
  { id: 'l_np_research', startupId: 'st_northpeak', title: 'AI Research Intern', field: 'consulting', summary: 'Test AI tools on real Thai-language documents, record what works and write short guides the project teams can use.', stipend: 15000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 21, postedAgo: 2, supervisor: ['Khun Vorawit S.', 'Research Lead'], skills: ['market_research', 'writing', 'english', 'excel'] },
  // Rattana Foods
  { id: 'l_rf_fin', startupId: 'st_rattana', title: 'Finance Intern', field: 'finance', summary: 'Help the finance lead track production costs per kit, update the budget and prepare the monthly numbers for founders.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 13, postedAgo: 6, supervisor: ['Khun Supachai K.', 'Finance Manager'] },
  { id: 'l_rf_design', startupId: 'st_rattana', title: 'Packaging Design Intern', field: 'graphic_design', summary: 'Design packaging for new sauce kits, plus shelf displays and promotion materials for supermarket launches.', stipend: 8500, noExp: true, minYear: 2, mode: 'onsite', months: 3, hours: 40, deadlineIn: 24, postedAgo: 1, supervisor: ['Khun Pim C.', 'Senior Designer'] },
  { id: 'l_rf_procure', startupId: 'st_rattana', title: 'Procurement Intern', field: 'supply_chain', summary: 'Help source fresh chillies, herbs and packaging from Thai farms and suppliers. Track orders and compare offers.', stipend: 8500, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 27, postedAgo: 9, supervisor: ['Khun Montri L.', 'Procurement Manager'] },
  // Kinnaree Stays
  { id: 'l_kh_acc', startupId: 'st_kinnaree', title: 'Finance and Accounting Intern', field: 'accounting', summary: 'Learn how a property startup manages income and owner payouts by supporting the accounts team across 14 boutique stays.', stipend: 7000, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 16, postedAgo: 10, supervisor: ['Khun Siriporn A.', 'Group Accountant'] },
  { id: 'l_kh_hr', startupId: 'st_kinnaree', title: 'People and Culture Intern', field: 'hr', summary: 'Support hiring for guest service and housekeeping teams, prepare onboarding and help organise training days.', stipend: 7000, noExp: true, minYear: 1, mode: 'onsite', months: 3, hours: 40, deadlineIn: 4, postedAgo: 15, supervisor: ['Khun Nattaya K.', 'Learning and Development Manager'] },
  { id: 'l_kh_pr', startupId: 'st_kinnaree', title: 'Communications Intern', field: 'pr', summary: 'Help tell the story of each boutique stay through press releases, guest newsletters and social media.', stipend: 7000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 19, postedAgo: 3, supervisor: ['Khun Kanokwan T.', 'Communications Manager'] },
  { id: 'l_kh_events', startupId: 'st_kinnaree', title: 'Guest Events Intern', field: 'events', summary: 'Help plan small events at Kinnaree properties, such as rooftop dinners, workshops and neighbourhood walks for guests.', stipend: null, paid: true, noExp: true, minYear: 1, mode: 'onsite', months: 4, hours: 40, deadlineIn: 30, postedAgo: 7, supervisor: ['Khun Prasert W.', 'Events Manager'] },
  // Saeng Digital
  { id: 'l_sd_perf', startupId: 'st_saeng', title: 'Performance Marketing Intern', field: 'digital_marketing', summary: 'Work in an account team running search and social ads for food and beauty brands.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 8, postedAgo: 5, supervisor: ['Khun Nuttapon S.', 'Performance Lead'] },
  { id: 'l_sd_social', startupId: 'st_saeng', title: 'Social Media Intern', field: 'social_media', summary: 'Create posts, short videos and community replies for three lifestyle brand accounts.', stipend: 8000, noExp: true, minYear: 1, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 3, postedAgo: 11, supervisor: ['Khun Ploypailin M.', 'Social Media Manager'] },
  // Pulse Mobile
  { id: 'l_pm_data', startupId: 'st_pulse', title: 'Customer Data Intern', field: 'data', summary: 'Analyse plan usage and top-up patterns to help the marketing team design better offers for students.', stipend: 12000, noExp: true, minYear: 3, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 14, postedAgo: 2, supervisor: ['Khun Tawan J.', 'Analytics Manager'] },
  { id: 'l_pm_sales', startupId: 'st_pulse', title: 'Campus Sales Intern', field: 'sales', summary: 'Run booths and partnerships at Bangkok universities to introduce student mobile plans.', stipend: 7000, noExp: true, minYear: 1, mode: 'hybrid', months: 3, hours: 24, deadlineIn: 10, postedAgo: 4, supervisor: ['Khun Phat N.', 'Channel Sales Manager'], skills: ['sales', 'communication', 'presentation', 'event_planning'] },
  // Tidewater Logistics
  { id: 'l_tw_hr', startupId: 'st_tidewater', title: 'HR Intern', field: 'hr', summary: 'Help a fast-growing team hire operations and customer staff, keep training records and run team activities.', stipend: 8000, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 20, postedAgo: 6, supervisor: ['Khun Chaiwat B.', 'HR Manager'] },
  { id: 'l_tw_sc', startupId: 'st_tidewater', title: 'Supply Chain Planning Intern', field: 'supply_chain', summary: 'Support the team that schedules inbound containers and shared warehouse space for small importers.', stipend: 10000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 12, postedAgo: 3, supervisor: ['Khun Apinya M.', 'Planning Manager'] },
  // Bloom & Beam PR
  { id: 'l_bb_pr', startupId: 'st_bloombeam', title: 'PR Intern', field: 'pr', summary: 'Write press releases, update media lists and help organise launch events for fashion and beauty clients.', stipend: 8000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 7, postedAgo: 6, supervisor: ['Khun Mayuree S.', 'Managing Director'] },
  { id: 'l_bb_design', startupId: 'st_bloombeam', title: 'Visual Design Intern', field: 'graphic_design', summary: 'Design press kits, event signage and social graphics for client campaigns.', stipend: 8000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 22, postedAgo: 1, supervisor: ['Khun Ton P.', 'Art Director'] },
  // Stagecraft Events
  { id: 'l_sc_coord', startupId: 'st_stagecraft', title: 'Event Coordinator Intern', field: 'events', summary: 'Help plan corporate conferences and launches, from supplier quotes to on-the-day run sheets.', stipend: 8000, noExp: true, minYear: 1, mode: 'onsite', months: 3, hours: 40, deadlineIn: 5, postedAgo: 9, supervisor: ['Khun Krit A.', 'Head of Production'] },
  { id: 'l_sc_prod', startupId: 'st_stagecraft', title: 'Production Assistant Intern', field: 'events', summary: 'Support the production team with stage plans, equipment lists and crew schedules for concerts and launches.', stipend: 8000, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 25, postedAgo: 2, supervisor: ['Khun Jakkrit S.', 'Production Manager'] },
  // Nimbus Commerce
  { id: 'l_nc_eng', startupId: 'st_nimbus', title: 'Frontend Developer Intern', field: 'engineering', summary: 'Build screens in the seller dashboard used by hundreds of Thai brands, with code review from senior engineers.', stipend: 15000, noExp: false, minYear: 3, mode: 'hybrid', months: 6, hours: 40, deadlineIn: 17, postedAgo: 4, supervisor: ['Khun Ekkachai P.', 'Engineering Manager'] },
  { id: 'l_nc_product', startupId: 'st_nimbus', title: 'Product Intern', field: 'product', summary: 'Talk to sellers, organise feedback and help the product manager plan the next features of the dashboard.', stipend: 12000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 23, postedAgo: 1, supervisor: ['Khun Lalita W.', 'Product Manager'] },
  { id: 'l_nc_seller', startupId: 'st_nimbus', title: 'Seller Success Intern', field: 'ecommerce', summary: 'Help brands set up their marketplace stores and answer their questions about orders and stock.', stipend: 10000, noExp: true, minYear: 1, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 9, postedAgo: 7, supervisor: ['Khun Kwan T.', 'Seller Success Lead'], skills: ['customer_support', 'communication', 'excel', 'problem_solving'] },
  // Ledgerline Accounting
  { id: 'l_ll_acc', startupId: 'st_ledgerline', title: 'Audit and Accounting Intern', field: 'accounting', summary: 'Support accountants keeping the books for SME clients and help prepare documents for year-end audits.', stipend: 8000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 11, postedAgo: 5, supervisor: ['Khun Suda W.', 'Audit Manager'] },
  // Talentree
  { id: 'l_tt_hr', startupId: 'st_talentree', title: 'Talent Acquisition Intern', field: 'hr', summary: 'Help a fast-growing startup hire its next 15 people: write job posts, screen applications and schedule interviews.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 6, postedAgo: 4, supervisor: ['Khun Benjamas L.', 'Co-founder'] },
  { id: 'l_tt_product', startupId: 'st_talentree', title: 'Product Research Intern', field: 'product', summary: 'Interview HR managers at small companies and turn what you learn into clear product recommendations.', stipend: 9000, noExp: true, minYear: 2, mode: 'remote', months: 3, hours: 24, deadlineIn: 28, postedAgo: 2, supervisor: ['Khun Ohm S.', 'Product Lead'] },
  // Pixel & Pestle
  { id: 'l_pp_graphic', startupId: 'st_pixelpestle', title: 'Graphic Design Intern', field: 'graphic_design', summary: 'Design logos, menus and packaging for cafés and small hotels with feedback from the creative director.', stipend: 7500, noExp: true, minYear: 2, mode: 'onsite', months: 3, hours: 36, deadlineIn: 14, postedAgo: 8, supervisor: ['Khun Arisa N.', 'Creative Director'] },
  { id: 'l_pp_ux', startupId: 'st_pixelpestle', title: 'UX/UI Design Intern', field: 'ux_design', summary: 'Design and prototype websites for studio clients and help test them with real customers.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 36, deadlineIn: 19, postedAgo: 3, supervisor: ['Khun Beam K.', 'Digital Designer'] },
  // Datawise Analytics
  { id: 'l_dw_bi', startupId: 'st_datawise', title: 'BI Analyst Intern', field: 'data', summary: 'Build Power BI dashboards for retail clients and help analysts answer questions about customer behaviour.', stipend: 13000, noExp: true, minYear: 3, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 7, postedAgo: 6, supervisor: ['Khun Pakorn D.', 'Analytics Lead'] },
  // Chanthra Financial Group
  { id: 'l_cf_fin', startupId: 'st_chanthra', title: 'Financial Planning Intern', field: 'finance', summary: 'Join the finance team of a fast-growing insurance startup, preparing budgets and performance reports for investors.', stipend: 14000, noExp: false, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 20, postedAgo: 10, supervisor: ['Khun Rungnapa C.', 'FP&A Manager'], openings: 2 },
  // Homeful Living
  { id: 'l_hl_digital', startupId: 'st_homeful', title: 'Digital Marketing Intern', field: 'digital_marketing', summary: 'Help the online team run ads, email campaigns and promotions that bring shoppers to the website and showrooms.', stipend: 8500, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 12, postedAgo: 2, supervisor: ['Khun Mint R.', 'Online Marketing Manager'] },
  { id: 'l_hl_ecom', startupId: 'st_homeful', title: 'Marketplace Operations Intern', field: 'ecommerce', summary: 'Keep product listings, prices and stock accurate across three online marketplaces.', stipend: 8500, noExp: true, minYear: 1, mode: 'onsite', months: 3, hours: 40, deadlineIn: 4, postedAgo: 13, supervisor: ['Khun Golf S.', 'E-commerce Supervisor'] },
  { id: 'l_hl_sales', startupId: 'st_homeful', title: 'B2B Sales Intern', field: 'sales', summary: 'Support the team selling furniture to hotels, offices and condominium developers.', stipend: null, paid: true, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 26, postedAgo: 5, supervisor: ['Khun Ann P.', 'B2B Sales Manager'] },
  { id: 'l_hl_inventory', startupId: 'st_homeful', title: 'Inventory Planning Intern', field: 'supply_chain', summary: 'Help plan stock levels for 2,000 products and work with suppliers on delivery dates.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 15, postedAgo: 4, supervisor: ['Khun Boy T.', 'Supply Planning Lead'] },
  // Chargeway
  { id: 'l_cw_bd', startupId: 'st_chargeway', title: 'Business Development Intern', field: 'bizdev', summary: 'Find condos and offices that need EV charging, prepare proposals and join meetings with building managers.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 10, postedAgo: 3, supervisor: ['Khun Thitipong V.', 'Co-founder, Partnerships'] },
  { id: 'l_cw_comms', startupId: 'st_chargeway', title: 'Communications Intern', field: 'pr', summary: 'Tell the Chargeway story through press releases, partner newsletters and short case studies.', stipend: 8000, noExp: true, minYear: 1, mode: 'remote', months: 3, hours: 20, deadlineIn: 29, postedAgo: 1, supervisor: ['Khun Fon P.', 'Marketing Lead'] },
  // ---------- Added for the startup-focused release ----------
  // Nuanwell
  n('l_nw_ops', 'st_nuanwell', 'Care Operations Intern', 'operations', 'Keep home care visits running smoothly by matching caregivers to families and solving schedule problems as they come up.', 'Match caregivers to new booking requests each morning', 9000, true, 1, 'hybrid', 3, 30, 8, 3, 'Khun Pichaya D.', 'Co-founder, Operations'),
  n('l_nw_mkt', 'st_nuanwell', 'Community Marketing Intern', 'marketing', 'Help families discover Nuanwell through hospital partnerships, community talks and honest stories from caregivers.', 'Collect two caregiver or family stories a month, with consent, for marketing', 8000, true, 2, 'hybrid', 3, 24, 21, 2, 'Khun Ying T.', 'Marketing Lead'),
  n('l_nw_hr', 'st_nuanwell', 'Caregiver Recruitment Intern', 'hr', 'Help find and screen caregivers who meet the Nuanwell standard, and support their first training week.', 'Run reference checks for caregiver applicants', 8500, true, 2, 'onsite', 4, 36, 14, 6, 'Khun Pichaya D.', 'Co-founder, Operations'),
  // Dosely
  n('l_ds_ux', 'st_dosely', 'Product Design Intern', 'ux_design', 'Make medication reminders easier for older patients by redesigning the refill flow and testing it with real users.', 'Test the refill flow with five patients over 60 and report what confused them', 12000, true, 2, 'hybrid', 4, 36, 10, 4, 'Khun Sarawut N.', 'Head of Product'),
  n('l_ds_ops', 'st_dosely', 'Pharmacy Operations Intern', 'operations', 'Work with partner pharmacies and riders to make sure prescriptions are packed correctly and delivered on time.', 'Audit ten deliveries a week for packing accuracy', 9500, true, 2, 'onsite', 4, 40, 5, 9, 'Khun Mali R.', 'Operations Manager'),
  n('l_ds_data', 'st_dosely', 'Data Analyst Intern', 'data', 'Find out why patients stop refilling and which reminders actually work, using anonymised usage data.', 'Analyse which reminder times lead to on-time refills', 13000, true, 3, 'hybrid', 4, 40, 19, 1, 'Khun Poom S.', 'Data Lead'),
  n('l_ds_bd', 'st_dosely', 'Pharmacy Partnerships Intern', 'bizdev', 'Help bring independent pharmacies onto Dosely by researching neighbourhoods and joining partner visits.', 'Research and rank pharmacies in two Bangkok districts', 9000, true, 2, 'hybrid', 3, 30, 26, 5, 'Khun Mali R.', 'Operations Manager'),
  // Skillyard
  n('l_sy_ops', 'st_skillyard', 'Course Operations Intern', 'operations', 'Run the behind-the-scenes of a six-week course: schedules, learner questions, instructor support and feedback.', 'Own the weekly schedule and reminders for one live cohort', 9000, true, 1, 'hybrid', 3, 30, 6, 7, 'Khun Natcha V.', 'Head of Learning'),
  n('l_sy_content', 'st_skillyard', 'Content Marketing Intern', 'content', 'Write learner stories, career guides and short videos that help students decide which skill to learn next.', 'Write one learner success story every two weeks', 8500, true, 1, 'remote', 3, 24, 17, 2, 'Khun Fern J.', 'Content Lead'),
  n('l_sy_sales', 'st_skillyard', 'Admissions Intern', 'sales', 'Talk with people considering a course, understand their goals and help them choose honestly, even if the answer is "not yet".', 'Hold short advice calls with prospective learners', 9000, true, 2, 'hybrid', 3, 30, 12, 5, 'Khun Best W.', 'Admissions Manager'),
  n('l_sy_product', 'st_skillyard', 'Learning Design Intern', 'product', 'Help design a new course from outline to launch, working with a practitioner who teaches it.', 'Draft the weekly project briefs for one new course', 10000, true, 3, 'hybrid', 4, 36, 28, 3, 'Khun Natcha V.', 'Head of Learning'),
  // Lingoloop
  n('l_lg_growth', 'st_lingoloop', 'Growth Intern', 'digital_marketing', 'Find the cheapest ways to reach Thai students who want to speak better English, and test them week by week.', 'Run one growth experiment each week with a 2,000 baht budget', 8000, true, 2, 'hybrid', 3, 24, 9, 2, 'Khun Ravi K.', 'Co-founder, CEO'),
  n('l_lg_eng', 'st_lingoloop', 'Mobile Developer Intern', 'engineering', 'Build features in the Lingoloop app with the CTO, from the practice screen to the progress page.', 'Ship one user-facing feature in the React Native app', 13000, false, 3, 'hybrid', 4, 36, 23, 1, 'Khun Jom P.', 'Co-founder, CTO'),
  n('l_lg_bd', 'st_lingoloop', 'School Partnerships Intern', 'bizdev', 'Help bring Lingoloop into schools and university language centres through pilots and teacher feedback.', 'Support two school pilots and collect teacher feedback', 8000, true, 2, 'hybrid', 3, 24, 30, 6, 'Khun Ravi K.', 'Co-founder, CEO'),
  // Tamlueng
  n('l_tl_fin', 'st_tamlueng', 'Finance and Compliance Intern', 'finance', 'Learn how a regulated savings app keeps its numbers and records correct, from daily reconciliation to audit files.', 'Reconcile daily gold transactions against partner shop records', 13000, true, 3, 'onsite', 4, 40, 11, 4, 'Khun Kamon S.', 'Chief of Staff'),
  n('l_tl_eng', 'st_tamlueng', 'Backend Engineer Intern', 'engineering', 'Work on the services that record purchases and price alerts, with careful review because the product handles money.', 'Add tests and monitoring to the price alert service', 16000, false, 3, 'hybrid', 6, 40, 20, 2, 'Khun Art B.', 'Engineering Lead'),
  n('l_tl_social', 'st_tamlueng', 'Brand Content Intern', 'social_media', 'Explain saving and gold prices in plain, friendly Thai through short videos and posts.', 'Produce a weekly "gold price in 30 seconds" video', 9000, true, 1, 'hybrid', 3, 24, 4, 10, 'Khun Mew L.', 'Brand Manager'),
  n('l_tl_data', 'st_tamlueng', 'Customer Insights Intern', 'data', 'Study how people save: who reaches their goals, who stops and what helps them continue.', 'Segment savers by behaviour and present three findings', 13000, true, 3, 'hybrid', 4, 36, 25, 3, 'Khun Kamon S.', 'Chief of Staff'),
  // Splitbaht
  n('l_sb_mkt', 'st_splitbaht', 'Campus Growth Intern', 'marketing', 'Get student clubs and flatmates using Splitbaht by running campus pilots and learning what makes groups stick.', 'Onboard five student clubs and track how they use the app', 7500, true, 1, 'hybrid', 3, 20, 7, 3, 'Khun Pattara M.', 'Co-founder, Growth'),
  n('l_sb_product', 'st_splitbaht', 'Product Intern', 'product', 'Help decide what Splitbaht builds next by talking to users and studying how groups split costs.', 'Interview ten club treasurers and summarise their needs', 9000, true, 2, 'hybrid', 3, 30, 16, 1, 'Khun Gun T.', 'Co-founder, Product'),
  n('l_sb_eng', 'st_splitbaht', 'Frontend Intern', 'engineering', 'Build and polish screens in the Splitbaht web app alongside two engineers who review every change.', 'Rebuild the group summary screen from the new design', 12000, true, 2, 'remote', 4, 30, 22, 5, 'Khun Gun T.', 'Co-founder, Product'),
  // Looma AI
  n('l_lm_content', 'st_looma', 'AI Conversation Designer Intern', 'content', 'Write and test how the assistant speaks: natural Thai replies, polite handovers and answers customers trust.', 'Review 50 real conversations a week and rewrite weak replies', 10000, true, 2, 'hybrid', 3, 30, 13, 2, 'Khun Pear S.', 'Conversation Design Lead'),
  n('l_lm_ml', 'st_looma', 'Machine Learning Intern', 'engineering', 'Help evaluate and improve Thai-language models: build test sets, run experiments and report results clearly.', 'Build an evaluation set of tricky Thai customer questions', 16000, false, 3, 'hybrid', 6, 40, 27, 4, 'Khun Tanawat C.', 'Co-founder, CTO', ['python', 'data_analysis', 'problem_solving', 'english']),
  n('l_lm_ops', 'st_looma', 'Customer Onboarding Intern', 'operations', 'Set up the assistant for new shops and clinics: load their FAQs, test the answers and train their staff.', 'Onboard three new customers end to end', 9500, true, 2, 'hybrid', 3, 30, 3, 8, 'Khun Bank N.', 'Customer Lead'),
  n('l_lm_sales', 'st_looma', 'Sales Development Intern', 'sales', 'Find online shops that would benefit from an AI assistant and book demos for the founders.', 'Book eight qualified demos a month', 9000, true, 2, 'remote', 3, 24, 18, 6, 'Khun Bank N.', 'Customer Lead'),
  // Visionrail
  n('l_vr_data', 'st_visionrail', 'Data Quality Intern', 'data', 'Improve the product recognition models by checking labelled images, finding errors and tracking accuracy.', 'Review labelled shelf images and measure label accuracy weekly', 10000, true, 2, 'hybrid', 3, 30, 15, 3, 'Khun Siriwan P.', 'Head of Operations'),
  n('l_vr_ops', 'st_visionrail', 'Field Operations Intern', 'operations', 'Visit stores with the field team, see how the app is used in real aisles and bring back what needs fixing.', 'Join two store visits a week and log usability problems', 9000, true, 1, 'onsite', 3, 36, 24, 7, 'Khun Siriwan P.', 'Head of Operations'),
  n('l_vr_cv', 'st_visionrail', 'Computer Vision Intern', 'engineering', 'Train and test image models that recognise products on crowded shelves under poor lighting.', 'Run experiments to improve recognition of small products', 17000, false, 3, 'hybrid', 6, 40, 29, 2, 'Khun Kong M.', 'ML Lead', ['python', 'data_analysis', 'problem_solving', 'english']),
  // Queuely
  n('l_ql_bd', 'st_queuely', "Founder's Associate Intern", 'bizdev', 'Work beside the founder on whatever matters most that week: customer visits, pricing tests and investor updates.', 'Prepare the monthly investor update with the founder', 8000, true, 2, 'hybrid', 4, 30, 8, 1, 'Khun Chanin O.', 'Founder'),
  n('l_ql_ux', 'st_queuely', 'UX/UI Intern', 'ux_design', 'Design the screens customers see while they wait, and make joining a queue take under ten seconds.', 'Redesign the "your turn is near" screen and test it in a restaurant', 8500, true, 2, 'remote', 3, 24, 19, 4, 'Khun Chanin O.', 'Founder'),
  n('l_ql_sales', 'st_queuely', 'Merchant Onboarding Intern', 'sales', 'Sign up restaurants and clinics near BTS stations and help them run their first week on Queuely.', 'Visit and pitch fifteen venues a week', 8000, true, 1, 'onsite', 3, 30, 2, 12, 'Khun Chanin O.', 'Founder'),
  // Plantable
  n('l_pl_social', 'st_plantable', 'Brand and Social Intern', 'social_media', 'Show people that plant-based Thai food can taste like the real thing, through recipes, tastings and creator partnerships.', 'Plan and film one tasting video a week', 8500, true, 1, 'hybrid', 3, 24, 10, 3, 'Khun Lalana B.', 'Head of Brand'),
  n('l_pl_ecom', 'st_plantable', 'E-commerce Intern', 'ecommerce', 'Help run the online shop and meal plan: listings, promotions, reviews and repeat orders.', 'Set up and report on one monthly promotion', 9000, true, 2, 'hybrid', 3, 30, 21, 5, 'Khun Earth P.', 'E-commerce Lead'),
  n('l_pl_product', 'st_plantable', 'Food Product Intern', 'product', 'Help bring a new dish from test kitchen to launch: tasting panels, feedback and packaging decisions.', 'Run a tasting panel of 20 people and summarise the scores', 9500, true, 2, 'onsite', 4, 36, 14, 8, 'Khun Chef Noi', 'Head of Product Development'),
  n('l_pl_supply', 'st_plantable', 'Supply Planning Intern', 'supply_chain', 'Plan mushroom and jackfruit orders so the kitchen never runs short and nothing goes to waste.', 'Forecast weekly ingredient needs from sales data', 9500, true, 3, 'onsite', 4, 40, 27, 2, 'Khun Earth P.', 'E-commerce Lead'),
  // Solarra
  n('l_so_sales', 'st_solarra', 'Sales Operations Intern', 'sales', 'Support the home solar sales team by preparing proposals, checking roof data and following up with homeowners.', 'Prepare savings proposals from homeowners’ electricity bills', 10000, true, 2, 'hybrid', 4, 36, 6, 6, 'Khun Worawit T.', 'Operations Director'),
  n('l_so_fin', 'st_solarra', 'Finance Intern', 'finance', 'Learn how subscription financing works by tracking installation costs, monthly fees and payback for each roof.', 'Build a payback model for ten recent installations', 12000, true, 3, 'onsite', 4, 40, 18, 3, 'Khun Jane K.', 'Finance Manager'),
  n('l_so_content', 'st_solarra', 'Customer Education Intern', 'content', 'Explain solar in plain Thai: how it works, what it saves and what homeowners should ask any installer.', 'Write a five-part beginner guide to home solar', 8500, true, 1, 'remote', 3, 20, 25, 1, 'Khun Mook S.', 'Marketing Lead'),
  n('l_so_ops', 'st_solarra', 'Installation Planning Intern', 'operations', 'Schedule installation crews, track materials and join site visits to see projects through from survey to switch-on.', 'Plan the weekly crew schedule with the operations lead', 10000, true, 2, 'onsite', 4, 40, 12, 9, 'Khun Worawit T.', 'Operations Director'),
  // Carbonly
  n('l_cb_research', 'st_carbonly', 'Sustainability Research Intern', 'consulting', 'Research carbon reporting rules that affect Thai exporters and turn them into simple checklists for customers.', 'Summarise one overseas reporting rule each week in plain language', 8000, true, 3, 'hybrid', 3, 24, 16, 2, 'Khun Methee A.', 'Founder', ['market_research', 'writing', 'english', 'excel']),
  n('l_cb_mkt', 'st_carbonly', 'Product Marketing Intern', 'marketing', 'Help a new product find its first customers: sharpen the message, write case studies and prepare webinars.', 'Help run one webinar for exporters', 8000, true, 2, 'remote', 3, 20, 28, 4, 'Khun Methee A.', 'Founder'),
  // Parcelhop
  n('l_ph_bd', 'st_parcelhop', 'Network Expansion Intern', 'bizdev', 'Help decide where the next 50 lockers go by studying delivery demand and pitching building managers.', 'Score candidate locker sites using delivery data', 10000, true, 2, 'hybrid', 4, 36, 9, 5, 'Khun Yada R.', 'Network Lead'),
  n('l_ph_data', 'st_parcelhop', 'Operations Data Intern', 'data', 'Use locker data to spot full lockers, slow pickups and broken doors before customers complain.', 'Build a daily "lockers needing attention" report', 12000, true, 3, 'hybrid', 4, 40, 20, 1, 'Khun Tee W.', 'Data Manager'),
  n('l_ph_design', 'st_parcelhop', 'Graphic Design Intern', 'graphic_design', 'Design locker wraps, instruction stickers and station posters that help first-time users in seconds.', 'Redesign the on-locker instructions and test them with commuters', 9000, true, 2, 'hybrid', 3, 30, 13, 7, 'Khun Ploy A.', 'Brand Designer'),
  n('l_ph_supply', 'st_parcelhop', 'Hardware Supply Intern', 'supply_chain', 'Track locker units, spare parts and installation schedules so new sites open on time.', 'Maintain the spare parts inventory for 300 lockers', 9500, true, 2, 'onsite', 4, 40, 30, 3, 'Khun Yada R.', 'Network Lead'),
  // Motomile
  n('l_mm_mkt', 'st_motomile', 'Rider Community Intern', 'marketing', 'Build trust with delivery riders through meetups, rider stories and a referral programme.', 'Organise one rider meetup a month and collect feedback', 8000, true, 1, 'onsite', 3, 30, 5, 4, 'Khun Anan L.', 'Co-founder, COO'),
  n('l_mm_ops', 'st_motomile', 'Fleet Operations Intern', 'operations', 'Keep 400 electric bikes on the road by tracking maintenance, battery swaps and rider handovers.', 'Track bike downtime and find the three most common causes', 9500, true, 2, 'onsite', 4, 40, 17, 2, 'Khun Anan L.', 'Co-founder, COO'),
  n('l_mm_acc', 'st_motomile', 'Accounting Intern', 'accounting', 'Help keep the books for a subscription business: weekly rider payments, deposits and maintenance costs.', 'Reconcile weekly rider subscription payments', 9000, true, 3, 'onsite', 4, 36, 24, 6, 'Khun Dao S.', 'Finance Lead'),
  // More roles at existing startups
  n('l_kradan_product', 'st_kradan', 'Product Intern', 'product', 'Find out why students stop practising after a week and test ideas that keep them coming back.', 'Analyse practice streaks and propose two retention experiments', 11000, true, 2, 'hybrid', 4, 32, 15, 2, 'Napat W.', 'Co-founder, Product'),
  n('l_green_bd', 'st_greenloop', 'Building Partnerships Intern', 'bizdev', 'Bring refill stations to more condos and dormitories by pitching building managers and juristic offices.', 'Pitch ten buildings a month with the co-founder', 8500, true, 2, 'hybrid', 3, 24, 11, 4, 'Sirin K.', 'Co-founder'),
  n('l_stack_qa', 'st_stackwell', 'QA Engineer Intern', 'engineering', 'Break things before customers do: write test plans, automate checks and report clear, reproducible bugs.', 'Automate the checkout regression tests', 12000, true, 2, 'hybrid', 4, 36, 22, 1, 'Kittipong S.', 'Engineering Lead', ['javascript', 'problem_solving', 'writing', 'html_css']),
  n('l_frame_design', 'st_framehaus', 'Motion Design Intern', 'graphic_design', 'Create thumbnails, title cards and short motion graphics for the Framehaus tutorial channel.', 'Design a consistent thumbnail system for the channel', 8500, true, 2, 'hybrid', 3, 24, 8, 5, 'Pim T.', 'Head of Content', ['graphic_design', 'adobe_creative', 'video_editing', 'canva']),
  n('l_tt_content', 'st_talentree', 'Content Marketing Intern', 'content', 'Write practical hiring guides for small business owners and turn customer wins into short case studies.', 'Publish two hiring guides a month', 8500, true, 1, 'remote', 3, 20, 20, 3, 'Khun Benjamas L.', 'Co-founder'),
  n('l_cw_ops', 'st_chargeway', 'Charger Network Intern', 'operations', 'Monitor charger uptime across Bangkok, coordinate repairs and visit sites to check signage and access.', 'Track charger uptime and escalate faults within a day', 9000, true, 2, 'hybrid', 3, 30, 26, 2, 'Khun Thitipong V.', 'Co-founder, Partnerships'),
  n('l_pay_hr', 'st_paysabai', 'People Operations Intern', 'hr', 'Help a 30-person fintech hire well and onboard smoothly as it doubles in size.', 'Rebuild the new-joiner onboarding checklist', 10000, true, 2, 'hybrid', 3, 30, 13, 5, 'Chanon P.', 'Head of Finance'),
  n('l_nc_data', 'st_nimbus', 'Marketplace Data Intern', 'data', 'Study what makes products sell across marketplaces and turn it into advice sellers can act on.', 'Analyse which listing changes lift sales for ten sellers', 13000, true, 3, 'hybrid', 4, 40, 29, 1, 'Khun Lalita W.', 'Product Manager'),
];

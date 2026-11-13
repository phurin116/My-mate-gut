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
    responsibilities: ['Help plan monthly marketing campaigns with the brand team', 'Prepare briefs for agencies and in-store teams', 'Track campaign results in a weekly report', 'Research competitors and customer trends'],
    requirements: ['Interest in brands and consumer behaviour', 'Good written Thai and English'],
    skills: ['communication', 'market_research', 'presentation', 'excel'],
    learning: ['How a campaign is planned from brief to results', 'Writing clear briefs', 'Reading marketing numbers'],
  },
  digital_marketing: {
    responsibilities: ['Set up and monitor online ad campaigns with a specialist', 'Prepare weekly performance reports', 'Suggest new ad copy and audiences to test', 'Check landing pages for errors before launch'],
    requirements: ['Interest in online advertising', 'Comfortable with numbers and spreadsheets'],
    skills: ['google_ads', 'data_analysis', 'copywriting', 'excel'],
    learning: ['How paid search and social ads work', 'Testing and measuring campaigns', 'Presenting results to clients'],
  },
  social_media: {
    responsibilities: ['Draft daily posts and captions for brand accounts', 'Reply to comments and messages using the tone guide', 'Collect ideas from trending content each week', 'Report reach and engagement every Friday'],
    requirements: ['Active user of Instagram, TikTok or Facebook', 'Clear written Thai'],
    skills: ['social_media', 'copywriting', 'canva', 'content_creation'],
    learning: ['Planning a content calendar', 'Writing in a brand voice', 'Reading social media analytics'],
  },
  content: {
    responsibilities: ['Research and write articles or scripts', 'Edit short videos and graphics for social channels', 'Check facts and spelling before publishing', 'Keep the content calendar up to date'],
    requirements: ['A writing or video sample, coursework is fine', 'Attention to detail'],
    skills: ['writing', 'content_creation', 'video_editing', 'canva'],
    learning: ['An editorial workflow', 'Writing for different audiences', 'Measuring what content works'],
  },
  pr: {
    responsibilities: ['Draft press releases and media pitches', 'Build and update media contact lists', 'Monitor news coverage and prepare clipping reports', 'Help prepare press events and media kits'],
    requirements: ['Strong written Thai and English', 'Interest in media and current affairs'],
    skills: ['writing', 'copywriting', 'communication', 'english'],
    learning: ['How media relations works', 'Writing press materials', 'Planning a launch'],
  },
  events: {
    responsibilities: ['Help plan event timelines and run sheets', 'Contact suppliers and venues for quotes', 'Prepare registration lists and signage', 'Support the team on event days'],
    requirements: ['Organised and calm under pressure', 'Available for some evening or weekend events'],
    skills: ['event_planning', 'project_coordination', 'communication', 'excel'],
    learning: ['Running an event from plan to wrap-up', 'Working with suppliers', 'Managing budgets and timelines'],
  },
  sales: {
    responsibilities: ['Research and qualify potential customers', 'Make first contact by phone, email and LINE', 'Prepare quotes and follow-up messages', 'Update the sales pipeline daily'],
    requirements: ['Confident speaking with customers', 'Organised and reliable'],
    skills: ['sales', 'communication', 'negotiation', 'presentation'],
    learning: ['How a sales pipeline works', 'Handling objections', 'Professional follow-up'],
  },
  bizdev: {
    responsibilities: ['Research potential partner locations and companies', 'Prepare partnership proposals and pitch decks', 'Join meetings with the partnerships lead and take notes', 'Track partner conversations in the CRM'],
    requirements: ['Interested in business and partnerships', 'Clear spoken Thai'],
    skills: ['market_research', 'presentation', 'communication', 'negotiation'],
    learning: ['How partnerships are found and closed', 'Building a pitch deck', 'Running a sales process'],
  },
  finance: {
    responsibilities: ['Update monthly budget and forecast files', 'Prepare charts for management reports', 'Reconcile figures between systems', 'Document one finance process step by step'],
    requirements: ['Finance, accounting or economics student', 'Confident with spreadsheet formulas'],
    skills: ['excel', 'financial_modelling', 'accounting', 'data_analysis'],
    learning: ['Budgeting and forecasting', 'Building a financial model', 'Presenting numbers clearly'],
  },
  accounting: {
    responsibilities: ['Record invoices and receipts in the accounting system', 'Help prepare monthly closing schedules', 'Match bank statements to the ledger', 'Support audit preparation with documents'],
    requirements: ['Accounting or finance student', 'Careful with numbers and documents'],
    skills: ['accounting', 'excel', 'problem_solving'],
    learning: ['The monthly bookkeeping cycle', 'How an audit is prepared', 'Thai tax documents in practice'],
  },
  consulting: {
    responsibilities: ['Research industries and competitors for client projects', 'Build analysis in Excel and turn it into slides', 'Take notes in client meetings', 'Check numbers and sources before reviews'],
    requirements: ['Strong analytical thinking', 'Professional written English'],
    skills: ['market_research', 'excel', 'presentation', 'problem_solving'],
    learning: ['Structuring business problems', 'Building clear slides', 'Working on client projects'],
  },
  hr: {
    responsibilities: ['Screen applications and schedule interviews', 'Update employee records and onboarding checklists', 'Help organise training sessions', 'Draft internal announcements'],
    requirements: ['Interest in people and workplaces', 'Can keep information confidential'],
    skills: ['recruiting', 'communication', 'excel', 'writing'],
    learning: ['How recruitment works', 'Onboarding and training', 'HR policies in practice'],
  },
  graphic_design: {
    responsibilities: ['Design social media graphics and print materials', 'Adapt designs into different sizes and formats', 'Prepare files for printers and the web', 'Present ideas in weekly design reviews'],
    requirements: ['A portfolio, coursework is fine', 'Basic Adobe Illustrator or Photoshop'],
    skills: ['graphic_design', 'adobe_creative', 'canva', 'presentation'],
    learning: ['Working to a brand guideline', 'Preparing files for production', 'Taking design feedback'],
  },
  ux_design: {
    responsibilities: ['Create wireframes and prototypes in Figma', 'Help run usability tests and write up findings', 'Update components in the design library', 'Prepare designs for engineering handoff'],
    requirements: ['A portfolio with at least one interface project', 'Basic Figma'],
    skills: ['figma', 'ux_research', 'graphic_design', 'presentation'],
    learning: ['An end-to-end design process', 'Testing with real users', 'Working with engineers'],
  },
  engineering: {
    responsibilities: ['Build features with a mentor reviewing your code', 'Fix bugs from the support queue', 'Write tests for the code you change', 'Join sprint planning and demos'],
    requirements: ['Programming coursework or a personal project', 'Basic Git'],
    skills: ['javascript', 'react', 'html_css', 'problem_solving'],
    learning: ['Working in a production codebase', 'Code review habits', 'Debugging real issues'],
  },
  data: {
    responsibilities: ['Clean and prepare data for analysis', 'Build and update dashboards', 'Answer weekly business questions with SQL', 'Present one analysis of your own'],
    requirements: ['Basic SQL or Excel from a course', 'Curious about numbers'],
    skills: ['sql', 'data_analysis', 'power_bi', 'excel'],
    learning: ['SQL on real business data', 'Dashboard design', 'Explaining findings to non-analysts'],
  },
  product: {
    responsibilities: ['Collect and organise customer feedback', 'Write simple product briefs with the product manager', 'Help plan and test new features', 'Track feature usage after release'],
    requirements: ['Curious about how products are built', 'Clear writing'],
    skills: ['ux_research', 'writing', 'data_analysis', 'presentation'],
    learning: ['How product decisions are made', 'Writing product briefs', 'Measuring feature success'],
  },
  ecommerce: {
    responsibilities: ['Update product listings, prices and photos on online stores', 'Monitor orders, stock and customer reviews', 'Help plan marketplace campaigns such as monthly sales days', 'Report weekly online sales'],
    requirements: ['Familiar with online shopping platforms', 'Comfortable with spreadsheets'],
    skills: ['excel', 'data_analysis', 'copywriting', 'customer_support'],
    learning: ['Running an online store day to day', 'Marketplace campaigns', 'Reading sales data'],
  },
  operations: {
    responsibilities: ['Monitor daily operations data and flag problems', 'Update process documents', 'Coordinate with other teams to fix issues', 'Prepare a weekly operations summary'],
    requirements: ['Organised and practical', 'Spreadsheet basics'],
    skills: ['excel', 'project_coordination', 'problem_solving', 'communication'],
    learning: ['How operations are measured', 'Process improvement', 'Cross-team coordination'],
  },
  supply_chain: {
    responsibilities: ['Track purchase orders and supplier deliveries', 'Update stock and demand planning sheets', 'Help compare supplier quotes', 'Prepare a weekly inventory report'],
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
  extraResponsibility?: string;
  skills?: SkillId[];
}

export function expand(i: NewListingInput) {
  const t = T[i.field];
  return {
    responsibilities: i.extraResponsibility ? [...t.responsibilities, i.extraResponsibility] : t.responsibilities,
    requirements: i.noExp ? [...t.requirements, 'No previous work experience needed'] : [...t.requirements, 'Some previous experience, such as an internship, part-time job or significant project'],
    skills: i.skills ?? t.skills,
    learning: t.learning,
  };
}

export const NEW_LISTINGS: NewListingInput[] = [
  // Siam Weave Apparel
  { id: 'l_sw_mkt', startupId: 'st_siamweave', title: 'Brand Marketing Intern', field: 'marketing', summary: 'Support the brand team on seasonal campaigns for 40 stores, from store window themes to student promotions.', stipend: 10000, noExp: true, minYear: 2, mode: 'onsite', months: 3, hours: 40, deadlineIn: 11, postedAgo: 3, supervisor: ['Khun Darin P.', 'Brand Manager'], extraResponsibility: 'Visit two stores a month to check campaign displays' },
  { id: 'l_sw_acc', startupId: 'st_siamweave', title: 'Accounting Intern', field: 'accounting', summary: 'Join the head office accounting team and help with store sales reconciliation and the monthly close.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 18, postedAgo: 8, supervisor: ['Khun Orawan S.', 'Accounting Supervisor'] },
  { id: 'l_sw_ecom', startupId: 'st_siamweave', title: 'E-commerce Intern', field: 'ecommerce', summary: 'Help run the online shop and marketplace stores, from product listings to monthly sale days.', stipend: 10000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 36, deadlineIn: 6, postedAgo: 5, supervisor: ['Khun Nontaya R.', 'E-commerce Lead'] },
  // Chao Phraya Advisory
  { id: 'l_cpa_consult', startupId: 'st_chaophraya', title: 'Business Analyst Intern', field: 'consulting', summary: 'Support consultants helping family businesses plan their expansion. Research markets, build analysis and prepare client slides.', stipend: 12000, noExp: true, minYear: 3, mode: 'hybrid', months: 3, hours: 40, deadlineIn: 15, postedAgo: 4, supervisor: ['Khun Somsak R.', 'Partner'] },
  // Northpeak Consulting
  { id: 'l_np_strategy', startupId: 'st_northpeak', title: 'Strategy Intern', field: 'consulting', summary: 'Join a client project team for one term and work on market sizing, competitor research and recommendations.', stipend: 18000, noExp: false, minYear: 3, mode: 'onsite', months: 3, hours: 45, deadlineIn: 9, postedAgo: 12, supervisor: ['Khun Anchalee P.', 'Engagement Manager'], skills: ['market_research', 'excel', 'presentation', 'english', 'problem_solving'] },
  { id: 'l_np_research', startupId: 'st_northpeak', title: 'Research Intern, Knowledge Team', field: 'consulting', summary: 'Find and summarise industry data and reports that consultants use on projects across Southeast Asia.', stipend: 15000, noExp: true, minYear: 2, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 21, postedAgo: 2, supervisor: ['Khun Vorawit S.', 'Research Lead'], skills: ['market_research', 'writing', 'english', 'excel'] },
  // Rattana Foods
  { id: 'l_rf_fin', startupId: 'st_rattana', title: 'Finance Intern', field: 'finance', summary: 'Help the finance team track factory costs, update the budget and prepare monthly reports for management.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 13, postedAgo: 6, supervisor: ['Khun Supachai K.', 'Finance Manager'] },
  { id: 'l_rf_design', startupId: 'st_rattana', title: 'Packaging Design Intern', field: 'graphic_design', summary: 'Work with the brand team on packaging updates, shelf displays and supermarket promotion materials.', stipend: 8500, noExp: true, minYear: 2, mode: 'onsite', months: 3, hours: 40, deadlineIn: 24, postedAgo: 1, supervisor: ['Khun Pim C.', 'Senior Designer'] },
  { id: 'l_rf_procure', startupId: 'st_rattana', title: 'Procurement Intern', field: 'supply_chain', summary: 'Support buyers sourcing chillies, packaging and ingredients. Track orders and compare supplier offers.', stipend: 8500, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 27, postedAgo: 9, supervisor: ['Khun Montri L.', 'Procurement Manager'] },
  // Kinnaree Hotels
  { id: 'l_kh_acc', startupId: 'st_kinnaree', title: 'Hotel Accounting Intern', field: 'accounting', summary: 'Learn how hotels manage income and costs by supporting the accounts team across five Bangkok properties.', stipend: 7000, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 16, postedAgo: 10, supervisor: ['Khun Siriporn A.', 'Group Accountant'] },
  { id: 'l_kh_hr', startupId: 'st_kinnaree', title: 'People and Culture Intern', field: 'hr', summary: 'Support recruitment for hotel teams, prepare onboarding for new staff and help organise training days.', stipend: 7000, noExp: true, minYear: 1, mode: 'onsite', months: 3, hours: 40, deadlineIn: 4, postedAgo: 15, supervisor: ['Khun Nattaya K.', 'Learning and Development Manager'] },
  { id: 'l_kh_pr', startupId: 'st_kinnaree', title: 'Communications Intern', field: 'pr', summary: 'Help the communications team with press releases, guest newsletters and social media for the hotel group.', stipend: 7000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 19, postedAgo: 3, supervisor: ['Khun Kanokwan T.', 'Communications Manager'] },
  { id: 'l_kh_events', startupId: 'st_kinnaree', title: 'Banquet and Events Intern', field: 'events', summary: 'Support the events team planning weddings, conferences and corporate dinners at the Sukhumvit hotel.', stipend: null, paid: true, noExp: true, minYear: 1, mode: 'onsite', months: 4, hours: 40, deadlineIn: 30, postedAgo: 7, supervisor: ['Khun Prasert W.', 'Events Manager'] },
  // Saeng Digital
  { id: 'l_sd_perf', startupId: 'st_saeng', title: 'Performance Marketing Intern', field: 'digital_marketing', summary: 'Work in an account team running search and social ads for food and beauty brands.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 8, postedAgo: 5, supervisor: ['Khun Nuttapon S.', 'Performance Lead'] },
  { id: 'l_sd_social', startupId: 'st_saeng', title: 'Social Media Intern', field: 'social_media', summary: 'Create posts, short videos and community replies for three lifestyle brand accounts.', stipend: 8000, noExp: true, minYear: 1, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 3, postedAgo: 11, supervisor: ['Khun Ploypailin M.', 'Social Media Manager'] },
  // Pulse Mobile
  { id: 'l_pm_data', startupId: 'st_pulse', title: 'Customer Data Intern', field: 'data', summary: 'Analyse plan usage and top-up patterns to help the marketing team design better offers for students.', stipend: 12000, noExp: true, minYear: 3, mode: 'hybrid', months: 4, hours: 40, deadlineIn: 14, postedAgo: 2, supervisor: ['Khun Tawan J.', 'Analytics Manager'] },
  { id: 'l_pm_sales', startupId: 'st_pulse', title: 'Campus Sales Intern', field: 'sales', summary: 'Run booths and partnerships at Bangkok universities to introduce student mobile plans.', stipend: 7000, noExp: true, minYear: 1, mode: 'hybrid', months: 3, hours: 24, deadlineIn: 10, postedAgo: 4, supervisor: ['Khun Phat N.', 'Channel Sales Manager'], skills: ['sales', 'communication', 'presentation', 'event_planning'] },
  // Tidewater Logistics
  { id: 'l_tw_hr', startupId: 'st_tidewater', title: 'HR Intern', field: 'hr', summary: 'Help recruit warehouse and office staff, keep training records and support employee engagement activities.', stipend: 8000, noExp: true, minYear: 2, mode: 'onsite', months: 4, hours: 40, deadlineIn: 20, postedAgo: 6, supervisor: ['Khun Chaiwat B.', 'HR Manager'] },
  { id: 'l_tw_sc', startupId: 'st_tidewater', title: 'Supply Chain Planning Intern', field: 'supply_chain', summary: 'Support the planning team that schedules inbound containers and warehouse space for importers.', stipend: 10000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 12, postedAgo: 3, supervisor: ['Khun Apinya M.', 'Planning Manager'] },
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
  { id: 'l_cf_fin', startupId: 'st_chanthra', title: 'Financial Planning Intern', field: 'finance', summary: 'Join the financial planning and analysis team preparing budgets and performance reports for the board.', stipend: 14000, noExp: false, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 20, postedAgo: 10, supervisor: ['Khun Rungnapa C.', 'FP&A Manager'], openings: 3 },
  // Homeful Living
  { id: 'l_hl_digital', startupId: 'st_homeful', title: 'Digital Marketing Intern', field: 'digital_marketing', summary: 'Help the online team run ads, email campaigns and promotions that bring shoppers to the website and showrooms.', stipend: 8500, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 12, postedAgo: 2, supervisor: ['Khun Mint R.', 'Online Marketing Manager'] },
  { id: 'l_hl_ecom', startupId: 'st_homeful', title: 'Marketplace Operations Intern', field: 'ecommerce', summary: 'Keep product listings, prices and stock accurate across three online marketplaces.', stipend: 8500, noExp: true, minYear: 1, mode: 'onsite', months: 3, hours: 40, deadlineIn: 4, postedAgo: 13, supervisor: ['Khun Golf S.', 'E-commerce Supervisor'] },
  { id: 'l_hl_sales', startupId: 'st_homeful', title: 'B2B Sales Intern', field: 'sales', summary: 'Support the team selling furniture to hotels, offices and condominium developers.', stipend: null, paid: true, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 36, deadlineIn: 26, postedAgo: 5, supervisor: ['Khun Ann P.', 'B2B Sales Manager'] },
  { id: 'l_hl_inventory', startupId: 'st_homeful', title: 'Inventory Planning Intern', field: 'supply_chain', summary: 'Help plan stock levels for 2,000 products and work with suppliers on delivery dates.', stipend: 9000, noExp: true, minYear: 3, mode: 'onsite', months: 4, hours: 40, deadlineIn: 15, postedAgo: 4, supervisor: ['Khun Boy T.', 'Supply Planning Lead'] },
  // Chargeway
  { id: 'l_cw_bd', startupId: 'st_chargeway', title: 'Business Development Intern', field: 'bizdev', summary: 'Find condos and offices that need EV charging, prepare proposals and join meetings with building managers.', stipend: 9000, noExp: true, minYear: 2, mode: 'hybrid', months: 3, hours: 32, deadlineIn: 10, postedAgo: 3, supervisor: ['Khun Thitipong V.', 'Co-founder, Partnerships'] },
  { id: 'l_cw_comms', startupId: 'st_chargeway', title: 'Communications Intern', field: 'pr', summary: 'Tell the Chargeway story through press releases, partner newsletters and short case studies.', stipend: 8000, noExp: true, minYear: 1, mode: 'remote', months: 3, hours: 20, deadlineIn: 29, postedAgo: 1, supervisor: ['Khun Fon P.', 'Marketing Lead'] },
];

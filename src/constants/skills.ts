// Skills taxonomy used for job posting, candidate profiles, filters and matching.
//
// Everything here is deterministic:
//   1. Skill names are canonicalised (case, spacing, common aliases) so that
//      "excel", "MS Excel" and "Microsoft Excel" are the same skill.
//   2. A subsector title is matched against ordered keyword rules. Each rule
//      that matches contributes its skills, earlier rules rank higher.
//   3. The sector's core skills fill any remaining slots.
// The same input always gives the same ranked output, so results are explainable.

import { SECTORS, getSubsectorsForSector } from './sectors';

/* ---------- canonical names & aliases ---------- */

const SYNONYMS: Record<string, string> = {
  'excel': 'MS Excel',
  'ms excel': 'MS Excel',
  'microsoft excel': 'MS Excel',
  'ms office': 'MS Office',
  'microsoft office': 'MS Office',
  'ms word': 'MS Word',
  'ms powerpoint': 'MS PowerPoint',
  'tally': 'Tally ERP',
  'tally erp': 'Tally ERP',
  'tally erp 9': 'Tally ERP',
  'tally prime': 'Tally Prime',
  'gst': 'GST Filing',
  'gst filing': 'GST Filing',
  'hr': 'Human Resources',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'py': 'Python',
  'python3': 'Python',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'autocad': 'AutoCAD',
  'auto cad': 'AutoCAD',
  'cnc': 'CNC Operation',
  'cnc operation': 'CNC Operation',
  'cnc machine operation': 'CNC Operation',
  'customer care': 'Customer Service',
  'driver': 'Driving',
  'driving': 'Driving',
  'first aid': 'First Aid',
  'welder': 'Welding',
  'mig welding': 'Welding',
  'seo': 'SEO',
  'search engine optimisation': 'SEO',
  'search engine optimization': 'SEO',
};

/**
 * Clean, human-readable form of a skill name: spacing collapsed, aliases applied,
 * and all-lowercase input title-cased so "welding" and "Welding" store the same.
 * Mixed-case input such as "CNC" or "iOS" is kept as typed.
 */
export function canonicalSkill(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const alias = SYNONYMS[cleaned.toLowerCase()];
  if (alias) return alias;
  if (cleaned === cleaned.toLowerCase()) {
    return cleaned.replace(/(^|[\s/(-])([a-z])/g, (_m, sep, ch) => sep + ch.toUpperCase());
  }
  return cleaned;
}

/** Comparison key: two skills are the same when their keys are equal. */
export function skillKey(raw: string): string {
  return canonicalSkill(raw).toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();
}

/** Splits comma-separated input into canonical, de-duplicated skill names. */
export function parseSkillList(text: string): string[] {
  return dedupeSkills(text.split(',').map(canonicalSkill).filter(Boolean));
}

export function dedupeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of skills) {
    const k = skillKey(s);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(canonicalSkill(s));
  }
  return out;
}

/* ---------- subsector keyword rules (ordered: earlier = stronger) ---------- */

interface SkillRule {
  pattern: RegExp;
  skills: string[];
}

const SUBSECTOR_RULES: SkillRule[] = [
  { pattern: /cnc/i, skills: ['CNC Operation', 'Blueprint Reading', 'Measuring Instruments', 'Tool Offsets'] },
  { pattern: /weigh ?bridge/i, skills: ['Weighbridge Operation', 'Data Entry', 'Truck Documentation'] },
  { pattern: /batcher|concrete|pump operator/i, skills: ['Concrete Batching', 'Plant Operation', 'Equipment Handling'] },
  { pattern: /transit mixer|\btm\b|drive/i, skills: ['Heavy Vehicle Driving', 'Route Planning', 'Road Safety', 'Vehicle Inspection'] },
  { pattern: /driver|delivery/i, skills: ['Driving', 'Route Planning', 'Road Safety', 'Vehicle Maintenance'] },
  { pattern: /supervisor|in-?charge|manager|head\b|team lead/i, skills: ['Team Leadership', 'Shift Planning', 'Process Monitoring', 'MIS Reporting'] },
  { pattern: /quality|\bqc\b|\bqa\b|inspector/i, skills: ['Quality Control', 'Testing & Inspection', 'Documentation', 'ISO Standards'] },
  { pattern: /lab/i, skills: ['Sample Testing', 'Lab Equipment Handling', 'Documentation'] },
  { pattern: /machine operator|production operator|operator|production/i, skills: ['Machine Operation', 'Production Process', 'Safety Procedures', 'Quality Checking'] },
  { pattern: /mechanic|maintenance|technician|fitter|repair/i, skills: ['Mechanical Troubleshooting', 'Preventive Maintenance', 'Hand Tools', 'Spare Parts Handling'] },
  { pattern: /electric/i, skills: ['Electrical Wiring', 'Circuit Troubleshooting', 'Electrical Safety', 'Multimeter Use'] },
  { pattern: /weld|fabricat/i, skills: ['Welding', 'Fabrication', 'Blueprint Reading', 'Safety Procedures'] },
  { pattern: /assembly/i, skills: ['Assembly', 'Torque Tools', 'Blueprint Reading'] },
  { pattern: /store|inventory|warehouse|stock/i, skills: ['Inventory Management', 'Stock Audit', 'MS Excel', 'Warehouse Management'] },
  { pattern: /dispatch|logistic/i, skills: ['Dispatch Planning', 'Logistics Coordination', 'MS Excel'] },
  { pattern: /packing|packer|labell?ing/i, skills: ['Packing', 'Labelling', 'Dispatch Coordination'] },
  { pattern: /sales|bdm|business development|relationship manager|merchandiser|territory|distributor|channel partner|pre-sales|medical representative/i, skills: ['Sales', 'Lead Generation', 'Client Relationship', 'CRM Tools', 'Negotiation'] },
  { pattern: /seo|social media|content|digital marketing|performance marketing|ads|marketing/i, skills: ['Digital Marketing', 'SEO', 'Social Media Management', 'Content Writing', 'Google Analytics'] },
  { pattern: /graphic|design/i, skills: ['Photoshop', 'Canva', 'Illustrator'] },
  { pattern: /customer|call|support|cre\b|client/i, skills: ['Customer Service', 'Communication', 'CRM Tools', 'Complaint Handling'] },
  { pattern: /service/i, skills: ['Field Service', 'Troubleshooting', 'Customer Service'] },
  { pattern: /account|finance|credit|loan|banking|collection|cashier|relationship/i, skills: ['Accounting', 'Tally ERP', 'MS Excel', 'Banking Operations', 'KYC Compliance'] },
  { pattern: /admin|office|coordinator/i, skills: ['MS Office', 'Data Entry', 'Documentation', 'Scheduling'] },
  { pattern: /receptionist|front office|reservation|guest/i, skills: ['Front Office', 'Guest Handling', 'Reservations', 'Communication'] },
  { pattern: /chef|cook|kitchen|food|restaurant|steward/i, skills: ['Food Preparation', 'Kitchen Hygiene', 'Food Safety (FSSAI)', 'Menu Planning'] },
  { pattern: /housekeeping|cleaning/i, skills: ['Housekeeping', 'Cleaning Procedures', 'Hygiene Standards'] },
  { pattern: /security|guard/i, skills: ['Security Procedures', 'Surveillance', 'First Aid', 'Emergency Response'] },
  { pattern: /mason/i, skills: ['Masonry', 'Concrete Work', 'Plastering'] },
  { pattern: /carpenter|shuttering/i, skills: ['Carpentry', 'Shuttering', 'Measurement Reading'] },
  { pattern: /painter/i, skills: ['Painting', 'Surface Preparation'] },
  { pattern: /rigger/i, skills: ['Rigging', 'Crane Signalling', 'Load Safety'] },
  { pattern: /helper|assistant|general worker|labou?r|unskilled/i, skills: ['Material Handling', 'Basic Safety', 'Teamwork'] },
  { pattern: /site engineer|civil|project engineer|project manager|construction supervisor|site supervisor/i, skills: ['AutoCAD', 'Site Supervision', 'Project Planning', 'Civil Drawing Reading', 'MS Project'] },
  { pattern: /teacher|faculty|subject|academic|tutor|content developer|counsel/i, skills: ['Lesson Planning', 'Subject Expertise', 'Communication', 'Student Counselling'] },
  { pattern: /nurse|nursing|patient|medical|hospital|radiology/i, skills: ['Patient Care', 'Medical Terminology', 'First Aid', 'Clinical Documentation'] },
  { pattern: /pharm/i, skills: ['Drug Dispensing', 'Pharmacy Software', 'Inventory Management'] },
  { pattern: /beauti|hair|makeup|skin|nail|spa|salon|wellness|stylist|therap/i, skills: ['Hair Styling', 'Makeup', 'Skin Care', 'Client Consultation', 'Hygiene Standards'] },
  { pattern: /tailor|stitch|embroid|garment/i, skills: ['Stitching', 'Pattern Cutting', 'Machine Stitching', 'Measurement Taking'] },
  { pattern: /automobile|auto |service advisor|auto electrician/i, skills: ['Automobile Diagnostics', 'Vehicle Servicing', 'Customer Billing'] },
  { pattern: /\bit\b|software|developer|programmer|data/i, skills: ['Programming', 'SQL', 'Git', 'Problem Solving'] },
  { pattern: /safety/i, skills: ['Safety Compliance', 'Risk Assessment', 'Fire Safety', 'OSHA Standards'] },
  { pattern: /plant/i, skills: ['Plant Operation', 'Safety Procedures'] },
];

/* ---------- sector core skills (fill-in when rules give too few) ---------- */

const SECTOR_CORE: Partial<Record<string, string[]>> = {
  'RMC Plant': ['Concrete Batching', 'Plant Operation', 'Safety Procedures', 'Equipment Handling'],
  'Manufacturing': ['Production Process', 'Quality Control', 'Safety Procedures', 'Shop Floor Management'],
  'Service': ['Customer Service', 'Communication', 'Field Service', 'Problem Solving'],
  'FMCG': ['Sales', 'Distribution Management', 'MS Excel', 'Retail Execution'],
  'Construction': ['Site Supervision', 'Blueprint Reading', 'Safety Procedures', 'Measurement Reading'],
  'Real Estate': ['Sales', 'Client Relationship', 'Property Documentation', 'Negotiation'],
  'Pharma': ['GMP', 'Documentation', 'Quality Control', 'Batch Records'],
  'Digital Marketing': ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Writing'],
  'Private Banking': ['Banking Operations', 'KYC Compliance', 'Sales', 'MS Excel'],
  'Hotels': ['Guest Handling', 'Front Office', 'Communication', 'MS Office'],
  'Hospitality': ['Guest Handling', 'Food & Beverage Service', 'Communication', 'Customer Service'],
  'E-Commerce': ['Order Processing', 'Customer Service', 'MS Excel', 'Inventory Management'],
  'Education': ['Lesson Planning', 'Subject Expertise', 'Communication', 'MS Office'],
  'Healthcare': ['Patient Care', 'Medical Terminology', 'First Aid', 'Clinical Documentation'],
  'Beauty & Wellness': ['Client Consultation', 'Hygiene Standards', 'Customer Service', 'Sales'],
  'Automotive Industry': ['Automobile Diagnostics', 'Vehicle Servicing', 'Customer Service', 'Safety Procedures'],
  'Transport & Fleet Services': ['Driving', 'Route Planning', 'Road Safety', 'Vehicle Maintenance'],
  'Textile Machinery': ['Machine Operation', 'Mechanical Troubleshooting', 'Preventive Maintenance', 'Hand Tools'],
  'Electrical Equipment': ['Electrical Wiring', 'Circuit Troubleshooting', 'Electrical Safety', 'Blueprint Reading'],
  'Machine Tools': ['CNC Operation', 'Blueprint Reading', 'Measuring Instruments', 'Quality Control'],
  'Fertilizers': ['Plant Operation', 'Quality Control', 'Safety Procedures', 'Inventory Management'],
  'Plastic & Polymers': ['Injection Moulding', 'Machine Operation', 'Quality Control', 'Safety Procedures'],
  'Road & Highway': ['Site Supervision', 'Heavy Equipment Operation', 'Safety Procedures', 'Measurement Reading'],
  'Cement Industry': ['Plant Operation', 'Quality Control', 'Safety Procedures', 'Equipment Handling'],
  'Media & Entertainment': ['Content Writing', 'Video Editing', 'Social Media Management', 'Communication'],
  'Tourism': ['Customer Service', 'Travel Planning', 'Communication', 'Sales'],
  'Electric Vehicle & Battery': ['Battery Management', 'Electrical Safety', 'Circuit Troubleshooting', 'Quality Control'],
  'Electronics Manufacturing': ['PCB Assembly', 'Soldering', 'Quality Control', 'Electrical Safety'],
  'Logistics & Warehousing': ['Warehouse Management', 'Inventory Management', 'MS Excel', 'Dispatch Planning'],
  'Oil & Gas Refinery': ['Plant Operation', 'Safety Procedures', 'Process Monitoring', 'Emergency Response'],
  'Chemicals & Petrochemicals': ['Process Monitoring', 'Quality Control', 'Safety Procedures', 'Documentation'],
  'Steel & Metals': ['Welding', 'Fabrication', 'Blueprint Reading', 'Safety Procedures'],
  'Telecommunication': ['Field Service', 'Troubleshooting', 'Customer Service', 'Electrical Safety'],
  'Agriculture': ['Farm Operations', 'Equipment Handling', 'Crop Management', 'Safety Procedures'],
  'Insurance': ['Sales', 'Client Relationship', 'Policy Documentation', 'CRM Tools'],
  'Textiles & Apparel': ['Stitching', 'Quality Control', 'Machine Operation', 'Pattern Reading'],
  'Automobile': ['Automobile Diagnostics', 'Vehicle Servicing', 'Customer Service', 'Spare Parts Handling'],
  'Construction Equipment': ['Heavy Equipment Operation', 'Mechanical Troubleshooting', 'Preventive Maintenance', 'Safety Procedures'],
  'Tailoring': ['Stitching', 'Pattern Cutting', 'Machine Stitching', 'Measurement Taking'],
  'Manual': ['Material Handling', 'Basic Safety', 'Teamwork', 'Punctuality'],
};

const GENERIC_CORE = ['Communication', 'Teamwork', 'Punctuality', 'MS Excel'];

/* ---------- public API ---------- */

export const MAX_SKILL_SUGGESTIONS = 12;

/**
 * Ranked skill suggestions for a sector and subsector.
 * Order: skills from matching keyword rules (strongest first), then sector core skills.
 */
export function skillsForSubsector(sector: string, subsector: string): string[] {
  const ranked: string[] = [];
  const title = subsector || '';
  for (const rule of SUBSECTOR_RULES) {
    if (rule.pattern.test(title)) ranked.push(...rule.skills);
  }
  ranked.push(...(SECTOR_CORE[sector] ?? GENERIC_CORE));
  return dedupeSkills(ranked).slice(0, MAX_SKILL_SUGGESTIONS);
}

/** Every skill known to the taxonomy, sorted. Used when no sector is chosen yet. */
export function allTaxonomySkills(): string[] {
  const pool: string[] = [...GENERIC_CORE];
  for (const rule of SUBSECTOR_RULES) pool.push(...rule.skills);
  for (const sector of SECTORS) pool.push(...(SECTOR_CORE[sector] ?? []));
  return dedupeSkills(pool).sort((a, b) => a.localeCompare(b));
}

/** All subsectors across sectors, keyed by sector, for building a full skill map. */
export function skillMapBySector(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const sector of SECTORS) {
    map[sector] = dedupeSkills(
      getSubsectorsForSector(sector).flatMap(sub => skillsForSubsector(sector, sub))
    ).slice(0, 40);
  }
  return map;
}

/** Filters suggestions by what the user has typed. Prefix matches rank above substring matches. */
export function filterSkillSuggestions(query: string, suggestions: string[], exclude: string[] = []): string[] {
  const q = skillKey(query);
  const taken = new Set(exclude.map(skillKey));
  const pool = suggestions.filter(s => !taken.has(skillKey(s)));
  if (!q) return pool;
  const prefix = pool.filter(s => skillKey(s).startsWith(q));
  const contains = pool.filter(s => !skillKey(s).startsWith(q) && skillKey(s).includes(q));
  return [...prefix, ...contains];
}

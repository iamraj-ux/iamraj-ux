import { PromptTemplate } from '../types/database';

export const INITIAL_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'natasha-system',
    title: 'Natasha v5.6 Core System Persona',
    category: 'natasha',
    description: 'Executive digital operative for Raj Expo Digitals. Direct, strategic, and tactical.',
    systemInstruction:
      'You are Natasha v5.6, the executive AI operative for Raj Expo Digitals. You report directly to the Boss. You provide sharp logistics intelligence, product specifications, catalog labels, client correspondence, database operations, and system automation.',
    template:
      'Executive Query for Natasha v5.6:\nTarget Domain: {{domain}}\nPriority Level: {{priority}}\nDirective: {{directive}}\n\nProvide an authoritative, high-density tactical answer with immediate action items for Raj Expo Digitals.',
    variables: [
      { key: 'domain', label: 'Domain', defaultValue: 'Enterprise Operations', description: 'Business sector or operational area' },
      { key: 'priority', label: 'Priority', defaultValue: 'High', description: 'Urgency level (Routine, High, Critical)' },
      { key: 'directive', label: 'Directive', defaultValue: 'Audit Q3 export substrates and recommend pricing tiers.', description: 'Core question or objective' },
    ],
    temperature: 0.7,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ask-ai-fast',
    title: 'Ask AI: Quick Operational Intelligence',
    category: 'ask_ai',
    description: 'Fast strategic briefing with bullet points and immediate takeaways.',
    systemInstruction:
      'You are an executive operational analyst at Raj Expo Digitals. Give concise, razor-sharp briefings with zero fluff.',
    template:
      'Operational Request: {{topic}}\nContext: {{context}}\n\nDeliver: 1) Executive Summary (2 sentences max), 2) Key Factors, 3) Recommended Next Move.',
    variables: [
      { key: 'topic', label: 'Topic', defaultValue: 'Cloudinary CDN vs Local Storage Caching', description: 'Subject of query' },
      { key: 'context', label: 'Context', defaultValue: 'We have 1,400 high-res client banner assets and want minimal server bandwidth usage.', description: 'Background situation' },
    ],
    temperature: 0.6,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'write-proposal',
    title: 'Write with AI: Enterprise B2B Proposal',
    category: 'write',
    description: 'High-impact commercial proposals, client agreements, and executive memos.',
    systemInstruction:
      'You are the Chief Commercial Officer at Raj Expo Digitals. You draft persuasive, structured, high-value enterprise proposals and agreements.',
    template:
      'Client Organization: {{client_name}}\nProject Scope: {{scope}}\nProposed Budget: {{budget}}\nTone: {{tone}}\n\nDraft a complete professional commercial proposal containing: Executive Introduction, Scope & Deliverables Matrix, Commercial Terms, and Call-to-Action for signing.',
    variables: [
      { key: 'client_name', label: 'Client Name', defaultValue: 'Apex Global Retailers Ltd', description: 'Recipient client or corporate entity' },
      { key: 'scope', label: 'Scope', defaultValue: 'Nationwide roll-out of 450 custom UV-curable backlit vinyl banners and aluminum frames', description: 'Scope of work' },
      { key: 'budget', label: 'Budget / Terms', defaultValue: '$48,500 with 50% advance', description: 'Pricing or payment terms' },
      { key: 'tone', label: 'Tone', defaultValue: 'Authoritative, Prestige Commercial', description: 'Voice and tone' },
    ],
    temperature: 0.7,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'labels-generator',
    title: 'Catalog Labels & Search Tags Generator',
    category: 'labels',
    description: 'Generates SEO-rich, industry-standard catalog tags, warehouse labels, and search taxonomies.',
    systemInstruction:
      'You are a product taxonomy specialist for Raj Expo Digitals. Generate concise, highly searchable, e-commerce labels and SKU taxonomy tags.',
    template:
      'Product Name: {{product_name}}\nProduct Category: {{category}}\nMaterial / Specs: {{specs}}\nTarget Industry: {{industry}}\n\nGenerate: 1) 6 High-Conversion Search Tags (comma separated), 2) 3 Warehouse Inventory Labels, 3) 1 Primary E-commerce Category Code.',
    variables: [
      { key: 'product_name', label: 'Product Name', defaultValue: 'EXPO Pro Backlit Polyester Fabric 180GSM', description: 'Title of the product' },
      { key: 'category', label: 'Category', defaultValue: 'Substrates & Media', description: 'Catalog section' },
      { key: 'specs', label: 'Specifications', defaultValue: 'Fire retardant B1, wrinkle resistant, dye-sublimation & UV compatible', description: 'Technical parameters' },
      { key: 'industry', label: 'Target Industry', defaultValue: 'Exhibition Displays & Airport Signage', description: 'Target sector' },
    ],
    temperature: 0.5,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'descriptions-generator',
    title: 'E-Commerce Product Descriptions & Technical Specs',
    category: 'descriptions',
    description: 'Generates compelling product descriptions, warranty assurances, and bulleted technical specs.',
    systemInstruction:
      'You are the lead technical copywriter for Raj Expo Digitals. Create high-converting B2B product descriptions with exact engineering specifications.',
    template:
      'Product Title: {{product_name}}\nKey Highlights: {{highlights}}\nApplications: {{applications}}\nWarranty: {{warranty}}\n\nProvide: 1) Engaging Hook & 2-sentence Overview, 2) Technical Specs Bullet List, 3) Recommended Commercial Applications, 4) Durability & Warranty Statement.',
    variables: [
      { key: 'product_name', label: 'Product Name', defaultValue: 'Ultra-Cast Aluminum Modular Frame System 3x3m', description: 'Name of the item' },
      { key: 'highlights', label: 'Highlights', defaultValue: 'Tool-free latch assembly, matte anodized finish, 12kg total weight with rolling travel flight case', description: 'Key selling points' },
      { key: 'applications', label: 'Applications', defaultValue: 'Trade show booths, media step-and-repeats, museum exhibits, retail popups', description: 'Where it is used' },
      { key: 'warranty', label: 'Warranty', defaultValue: '5-Year Structural Integrity Guarantee', description: 'Warranty period and terms' },
    ],
    temperature: 0.7,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'gmail-drafter',
    title: 'Gmail Executive Correspondence',
    category: 'gmail',
    description: 'Professional email responses, quotation dispatches, and follow-ups on behalf of Boss.',
    systemInstruction:
      'You are the Executive Secretary to the Boss at Raj Expo Digitals. Draft crisp, elegant, polite, and persuasive business emails.',
    template:
      'Recipient Name: {{recipient}}\nSubject Topic: {{subject}}\nGoal / Call to Action: {{goal}}\nSpecific Details: {{details}}\nTone: {{tone}}\n\nDraft a complete email with Subject Line, personalized opening, clear value proposition, and professional signoff.',
    variables: [
      { key: 'recipient', label: 'Recipient', defaultValue: 'David Miller, Procurement Director', description: 'Name and title of recipient' },
      { key: 'subject', label: 'Subject', defaultValue: 'Quotation Update & Expedited Freight for Order #EXP-8821', description: 'Email topic' },
      { key: 'goal', label: 'Goal', defaultValue: 'Confirm order confirmation with 10% volume discount if approved by Friday', description: 'Desired outcome' },
      { key: 'details', label: 'Details', defaultValue: 'Production batch ready for container loading on the 24th; DHL Express air option also available', description: 'Specific data points' },
      { key: 'tone', label: 'Tone', defaultValue: 'Warm Executive, Decisive', description: 'Voice and tone' },
    ],
    temperature: 0.6,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'whatsapp-dispatch',
    title: 'WhatsApp Business Client Dispatch',
    category: 'whatsapp',
    description: 'Concise, high-engagement instant dispatches for WhatsApp client updates.',
    systemInstruction:
      'You are a client communications specialist for Raj Expo Digitals. Draft friendly, fast-reading WhatsApp business messages tailored for mobile screens.',
    template:
      'Client Name: {{client_name}}\nPurpose: {{purpose}}\nKey Information: {{info}}\nAction Needed: {{action}}\n\nDraft a concise WhatsApp message (under 120 words). Use clean line breaks and professional formatting. Ready to copy-paste directly into WhatsApp.',
    variables: [
      { key: 'client_name', label: 'Client Name', defaultValue: 'Sanjay Sharma', description: 'Customer or partner name' },
      { key: 'purpose', label: 'Purpose', defaultValue: 'Dispatch Notification & Tracking Link', description: 'Reason for message' },
      { key: 'info', label: 'Info', defaultValue: 'Shipment #EXP-4402 has departed from the Delhi warehouse via BlueDart. Docket #884920194.', description: 'Key data' },
      { key: 'action', label: 'Action', defaultValue: 'Please confirm delivery address availability tomorrow morning.', description: 'What client needs to do' },
    ],
    temperature: 0.6,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'cloudinary-captioner',
    title: 'Cloudinary Asset Vision & Alt-Text',
    category: 'cloudinary',
    description: 'Inspects media assets and generates descriptive alt-text, e-commerce captions, and visual tags.',
    systemInstruction:
      'You are a visual catalog auditor for Raj Expo Digitals. Provide accessible alt text, technical description, and tag arrays for digital assets.',
    template:
      'Media Asset Name: {{asset_name}}\nCloudinary Public ID: {{public_id}}\nContext of Asset: {{context}}\n\nGenerate: 1) WCAG AA Accessibility Alt-Text, 2) Commercial Image Caption, 3) 5 Metadata Tags for Cloudinary indexing.',
    variables: [
      { key: 'asset_name', label: 'Asset Name', defaultValue: 'expo_banner_acrylic_stand.jpg', description: 'Image filename' },
      { key: 'public_id', label: 'Public ID', defaultValue: 'raj_expo/catalog/acrylic_stand_01', description: 'Cloudinary identifier' },
      { key: 'context', label: 'Context', defaultValue: 'Premium clear acrylic freestanding poster display on marble showroom floor', description: 'Visual context' },
    ],
    temperature: 0.5,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'database-sql',
    title: 'Database Schema & Query Assistant',
    category: 'database',
    description: 'Generates safe SQL/JSON transformation scripts and validates data modifications with safety checks.',
    systemInstruction:
      'You are the Senior Database Reliability Engineer for Raj Expo Digitals Server. Ensure high data integrity and safe transaction scripts.',
    template:
      'Target Table: {{table_name}}\nAction Objective: {{objective}}\nFilter / Criteria: {{criteria}}\nSafety Constraint: {{safety}}\n\nGenerate: 1) Safe Query/JSON Update Payload, 2) Data Integrity Analysis, 3) Rollback Strategy.',
    variables: [
      { key: 'table_name', label: 'Table Name', defaultValue: 'products', description: 'Target collection or table' },
      { key: 'objective', label: 'Objective', defaultValue: 'Apply 8% inflation adjustment to all Substrates while stock > 50', description: 'What needs to happen' },
      { key: 'criteria', label: 'Criteria', defaultValue: 'category = "Substrates & Media" AND stock >= 50', description: 'Matching rows' },
      { key: 'safety', label: 'Safety Constraint', defaultValue: 'Preserve minimum price floor of $12.00', description: 'Safety invariant' },
    ],
    temperature: 0.4,
    isCustomized: false,
    version: 1,
    lastUpdated: new Date().toISOString(),
  },
];

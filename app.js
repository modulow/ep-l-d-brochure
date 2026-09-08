const app = document.getElementById('app');
const dialog = document.getElementById('item-dialog');
const itemForm = document.getElementById('item-form');
const closeDialogBtn = document.querySelector('#item-dialog .close-dialog');
const cancelBtn = document.getElementById('cancel-item');
const uploadInput = document.getElementById('item-image-file');
const hiddenImageInput = document.getElementById('item-image-url');
const sectionIdInput = document.getElementById('section-id');
const itemIndexInput = document.getElementById('item-index');
const DEFAULT_IMAGE = 'img/AdobeStock_609514149.jpeg';

const storageKey = 'brochure_catalogue_state_v1';
const lastLoginKey = 'brochure_last_login';
const catalogueEncodedKey = 'brochure_catalogue_encoded_at';
const demoProfilesKey = 'brochure_demo_profiles_seed_v1';
let isLoggedIn = localStorage.getItem('brochure_admin_authenticated') === 'true';

const demoProfiles = [
  { name: 'Camille Durand', role: 'Content lead' },
  { name: 'Nora Janssen', role: 'Learning curator' },
  { name: 'Mateo Rossi', role: 'Visual editor' },
  { name: 'Sofia Moreau', role: 'Quality reviewer' },
  { name: 'Jonas Weber', role: 'Programme owner' },
  { name: 'Elena Petrov', role: 'Metadata editor' },
  { name: 'Hugo Martin', role: 'Catalogue admin' },
  { name: 'Ines Lefevre', role: 'Link checker' },
  { name: 'Amina Benali', role: 'Description editor' },
  { name: 'Thomas Klein', role: 'Section coordinator' }
];

const catalogueEncodedAt = localStorage.getItem(catalogueEncodedKey) || new Date().toISOString();
localStorage.setItem(catalogueEncodedKey, catalogueEncodedAt);
if (isLoggedIn && !localStorage.getItem(lastLoginKey)) {
  localStorage.setItem(lastLoginKey, new Date().toISOString());
}

function safeImage(src) {
  return (src && src.trim()) || DEFAULT_IMAGE;
}

function loadCatalogueState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function normalizeSectionData(data) {
  const templateMap = new Map(baseSectionData.map((section) => [section.id, section]));

  const normalized = (Array.isArray(data) ? data : baseSectionData).map((section) => {
    const template = templateMap.get(section.id) || baseSectionData.find((item) => item.title === section.title);
    const safeItems = Array.isArray(section.items) ? section.items : [];
    return {
      ...(template || {}),
      ...(section || {}),
      items: safeItems.map((item) => ({
        ...(item || {}),
        sectionId: section.id || item?.sectionId || template?.id || 'unknown'
      }))
    };
  });

  const byId = new Map(normalized.map((section) => [section.id, section]));

  for (const section of baseSectionData) {
    if (!byId.has(section.id)) {
      normalized.push({
        ...section,
        items: section.items.map((item) => ({
          ...(item || {}),
          sectionId: section.id
        }))
      });
    }
  }

  return normalized
    .filter((section) => section && section.id)
    .sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
}

function saveCatalogueState(data) {
  localStorage.setItem(storageKey, JSON.stringify(normalizeSectionData(data)));
}

const baseSectionData = [
  { id: 'leadership', index: '01', title: 'INTRODUCTION', image: 'img/karine.png', items: [
    { title: 'Leading with clarity', image: 'img/ai1.png', link: 'https://example.com/leading-with-clarity', text: 'Build trust, delegate with confidence and improve team performance through effective leadership habits.', info: '2h • On demand', size: 'standard' },
    { title: 'Coaching for growth', image: 'img/ai2.png', link: 'https://example.com/coaching-for-growth', text: 'Create coaching conversations that help teams explore opportunities, challenges and accountability.', info: '3h • Live', size: 'standard' },
    { title: 'Managing change with impact', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/managing-change', text: 'Turn uncertainty into structured action and align your team around a clear communication plan.', info: '4h • Hybrid', size: 'wide' },
    { title: 'Performance culture', image: 'img/ai3.png', link: 'https://example.com/performance-culture', text: 'Set meaningful goals, run productive reviews and encourage continuous feedback across the organisation.', info: '1.5h • Self-paced', size: 'standard' }
  ] },
  { id: 'communication', index: '02', title: 'TABLE OF CONTENT', image: 'img/pexels_kindelmedia_7579354_108093519.jpg', items: [
    { title: 'Executive communication', image: 'img/20230316_EP_147095A_DEN_888__2__69792418.jpg', link: 'https://example.com/executive-communication', text: 'Develop message clarity, better speaking flow and more persuasive presentations for senior audiences.', info: '2.5h • Webinar', size: 'standard' },
    { title: 'Storytelling for impact', image: 'img/20160226_EP_032394A_BBO_113__1__95576947.jpg', link: 'https://example.com/storytelling', text: 'Translate strategy into meaningful narratives that are easy to understand, memorable and actionable.', info: '2h • Live', size: 'standard' },
    { title: 'Public speaking confidence', image: 'img/public_speaker_98919503.png', link: 'https://example.com/public-speaking', text: 'Practise structure, delivery and audience engagement so your key message lands with confidence.', info: '3h • Workshop', size: 'wide' },
    { title: 'Writing with clarity', image: 'img/AdobeStock_609514149.jpeg', link: 'https://example.com/writing-with-clarity', text: 'Improve tone, structure and readability for memos, updates and key internal communications.', info: '1h • On demand', size: 'standard' }
  ] },
  { id: 'wellbeing', index: '03', title: 'EU POLICIES & EP CORE BUSINESS', image: 'img/volunteers_55298429.png', items: [
    { title: 'Stress resilience', image: 'img/Resilience_at_Work_thumb_650x365_88056299.png', link: 'https://example.com/stress-resilience', text: 'Build habits to sustain energy, improve focus and navigate pressure without burnout.', info: '2h • On demand', size: 'standard' },
    { title: 'Healthy leadership habits', image: 'img/Mental_health_First_Aid_95955956.png', link: 'https://example.com/healthy-leadership', text: 'Lead by example with sustainable routines that support wellbeing and employee trust.', info: '1.5h • Live', size: 'standard' },
    { title: 'Managing emotional load', image: 'img/howtostayfitatyourdesk_ebrITWl0WdncWdCvGaUCzyZFBo_152682_thumb_84963447.jpg', link: 'https://example.com/emotional-load', text: 'Recognise pressure signals early and create healthier rhythms in demanding professional environments.', info: '2h • Workshop', size: 'wide' },
    { title: 'Teams and energy', image: 'img/AdobeStock_214541560.jpeg', link: 'https://example.com/teams-and-energy', text: 'Support regular recovery, better collaboration and realistic expectations across teams.', info: '1h • Self-paced', size: 'standard' }
  ] },
  { id: 'digital', index: '04', title: 'Digital & productivity', image: 'img/AdobeStock_609514149.jpeg', items: [
    { title: 'Digital basics', image: 'img/digital_basics_96084258.png', link: 'https://example.com/digital-basics', text: 'Improve everyday digital confidence for tools, collaboration and data access across workflows.', info: '1.5h • Self-paced', size: 'standard' },
    { title: 'Teams productivity', image: 'img/IT_Microsoft_Teams_650x365_45569474.jpg', link: 'https://example.com/teams-productivity', text: 'Organise work better, speed up meetings and improve collaboration in distributed teams.', info: '2h • Workshop', size: 'standard' },
    { title: 'AI at work', image: 'img/ai1.png', link: 'https://example.com/ai-at-work', text: 'Explore practical ways to use AI support in writing, research, planning and decision-making.', info: '3h • Live', size: 'wide' },
    { title: 'Data fluency', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/data-fluency', text: 'Turn dashboards and metrics into action through better interpretation and critical thinking.', info: '2.5h • On demand', size: 'standard' }
  ] },
  { id: 'learning', index: '05', title: 'Learning & capability', image: 'img/LP_Newcommer_ilustration_78416183.png', items: [
    { title: 'Learning design', image: 'img/Clear_Language_Essentials___Graphic_100496148.png', link: 'https://example.com/learning-design', text: 'Design sessions that are practical, relevant and aligned with the learner journey.', info: '2h • On demand', size: 'standard' },
    { title: 'Facilitation basics', image: 'img/Online_workshop_facilitation_tools__flow__and_best_practices_95959586.png', link: 'https://example.com/facilitation-basics', text: 'Run inclusive and engaging sessions with better structure, dialogue and energy management.', info: '3h • Workshop', size: 'standard' },
    { title: 'Learning analytics', image: 'img/2_mandatory_training_84058887.png', link: 'https://example.com/learning-analytics', text: 'Track engagement and impact using clear indicators and practical evidence from your programmes.', info: '2.5h • Hybrid', size: 'wide' },
    { title: 'Capability planning', image: 'img/ep_talk_faces_main_template_EUL_90430580.png', link: 'https://example.com/capability-planning', text: 'Build a focused learning roadmap that supports business priorities and individual development.', info: '2h • Live', size: 'standard' }
  ] },
  { id: 'security', index: '06', title: 'Cybersecurity & compliance', image: 'img/Cybersecurity_105644876.jpg', items: [
    { title: 'Cyber awareness', image: 'img/AdobeStock_1965104867.jpeg', link: 'https://example.com/cyber-awareness', text: 'Recognise common risks and adopt safer habits for digital working and information handling.', info: '1.5h • On demand', size: 'standard' },
    { title: 'Compliance essentials', image: 'img/brand_guidelines_93851484.png', link: 'https://example.com/compliance-essentials', text: 'Understand core obligations, controls and responsibilities in a modern governance environment.', info: '2h • Live', size: 'standard' },
    { title: 'Data protection', image: 'img/AdobeStock_214541560.jpeg', link: 'https://example.com/data-protection', text: 'Strengthen awareness of personal data handling, accountability and informed decision-making.', info: '2.5h • Workshop', size: 'wide' },
    { title: 'Risk and reporting', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/risk-and-reporting', text: 'Spot issues early, escalate effectively and respond with clarity when situations become critical.', info: '2h • Self-paced', size: 'standard' }
  ] },
  { id: 'project', index: '07', title: 'Project management', image: 'img/How_to_plan_and_lead_a_productive_meeting_650x365_98688928.png', items: [
    { title: 'Project planning', image: 'img/Work_Let_s_talk_ethics_640x365_37106235_106692516.jpg', link: 'https://example.com/project-planning', text: 'Create workable plans with owners, milestones and clear decision points from the start.', info: '2.5h • Live', size: 'standard' },
    { title: 'Decision-making', image: 'img/10_things_you_need_to_know_74573671.png', link: 'https://example.com/decision-making', text: 'Balance urgency, evidence and stakeholder views to reach stronger, faster decisions.', info: '2h • On demand', size: 'standard' },
    { title: 'Change delivery', image: 'img/EP_Powers_and_EU_Policies_90705421.png', link: 'https://example.com/change-delivery', text: 'Support adoption, communication and continuous learning throughout implementation phases.', info: '3h • Hybrid', size: 'wide' },
    { title: 'Stakeholder alignment', image: 'img/Engage_PM_Certification_Exam_preparation_106909389.png', link: 'https://example.com/stakeholder-alignment', text: 'Diagnose stakeholder needs and build momentum through better listening and structured follow-up.', info: '1.5h • Workshop', size: 'standard' }
  ] },
  { id: 'policy', index: '08', title: 'EU policy & law', image: 'img/LEX_Understanding_the_EU_Budget_640x365_36904879_79564509.jpg', items: [
    { title: 'EU basics', image: 'img/LEX_EU_Law_and_Policy_in_the_Area_of_Asylum_640x365_57346496.jpg', link: 'https://example.com/eu-basics', text: 'Understand the essential roles, structures and policy mechanisms behind EU governance.', info: '2h • On demand', size: 'standard' },
    { title: 'Legislative process', image: 'img/LEX_Drafting_legislation_640x365_39178194_78410575.jpg', link: 'https://example.com/legislative-process', text: 'Navigate the policy cycle and identify how laws and decisions actually take shape.', info: '3h • Live', size: 'standard' },
    { title: 'The rule of law', image: 'img/LEX_Rule_of_Law_as_a_Fundamental_Value_of_EU_640x365_55448756.jpg', link: 'https://example.com/rule-of-law', text: 'Connect principles and practice through legal and institutional perspectives that matter for public service.', info: '2h • Workshop', size: 'wide' },
    { title: 'EU institutions', image: 'img/LEX_Security_Defence_and_teh_EU_67847401.jpg', link: 'https://example.com/eu-institutions', text: 'Learn how the institutions, actors and procedures work together in daily policymaking.', info: '1.5h • Self-paced', size: 'standard' }
  ] },
  { id: 'teamwork', index: '09', title: 'Collaboration & teamwork', image: 'img/mariana.png', items: [
    { title: 'Facilitating groups', image: 'img/public_speaking_reading_a_speech_98839391.png', link: 'https://example.com/facilitating-groups', text: 'Guide better conversations through structure, listening and healthy balance of participation.', info: '2h • On demand', size: 'standard' },
    { title: 'Remote collaboration', image: 'img/AdobeStock_1965104867.jpeg', link: 'https://example.com/remote-collaboration', text: 'Drive clarity in distributed work through strong routines, signals and collective ownership.', info: '2.5h • Live', size: 'standard' },
    { title: 'Team feedback loops', image: 'img/Getting_the_most_out_of_feedback_93656167.png', link: 'https://example.com/team-feedback-loops', text: 'Create practical, constructive feedback routines to improve trust and learning across the team.', info: '1.5h • Workshop', size: 'wide' },
    { title: 'Cross-functional work', image: 'img/ai2.png', link: 'https://example.com/cross-functional-work', text: 'Align different priorities, language and rhythms when multiple teams need to move together.', info: '2h • Self-paced', size: 'standard' }
  ] },
  { id: 'career', index: '10', title: 'Career & growth', image: 'img/public_speaker_98919503.png', items: [
    { title: 'Career conversations', image: 'img/EP_Powers_and_EU_Policies_90705421.png', link: 'https://example.com/career-conversations', text: 'Prepare meaningful discussions about development goals, strengths and future opportunities.', info: '2h • Live', size: 'standard' },
    { title: 'Professional brand', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/professional-brand', text: 'Build a credible, visible personal brand grounded in your strengths and role impact.', info: '2.5h • Workshop', size: 'standard' },
    { title: 'Interview readiness', image: 'img/2026_03_31_velomai_2026_V03_2_108622172.jpg', link: 'https://example.com/interview-readiness', text: 'Strengthen your preparation, storytelling and confidence when presenting your profile.', info: '1.5h • On demand', size: 'wide' },
    { title: 'Next-step planning', image: 'img/2_mandatory_training_84058887.png', link: 'https://example.com/next-step-planning', text: 'Turn ambition into action by identifying skills, opportunities and milestones that matter.', info: '2h • Self-paced', size: 'standard' }
  ] },
  { id: 'coaching', index: '11', title: 'Coaching & mentoring', image: 'img/Empowerment.png', items: [
    { title: 'Mentoring fundamentals', image: 'img/brand_guidelines_93851484.png', link: 'https://example.com/mentoring-fundamentals', text: 'Learn how to structure conversations that bring clarity, challenge and support to others.', info: '2h • On demand', size: 'standard' },
    { title: 'Coach-like conversations', image: 'img/ai2.png', link: 'https://example.com/coach-conversations', text: 'Increase listening quality and confidence in conversations that help people think more deeply.', info: '3h • Live', size: 'standard' },
    { title: 'Feedback as coaching', image: 'img/Howtostayfitatyourdesk_ebrITWl0WdncWdCvGaUCzyZFBo_152682_thumb_84963447.jpg', link: 'https://example.com/feedback-as-coaching', text: 'Deliver feedback through curiosity rather than correction so others can learn and adapt.', info: '2h • Workshop', size: 'wide' },
    { title: 'Development conversations', image: 'img/Resilience_at_Work_thumb_650x365_88056299.png', link: 'https://example.com/development-conversations', text: 'Support growth journeys by creating space for reflection, goals and behaviour change.', info: '1.5h • Self-paced', size: 'standard' }
  ] },
  { id: 'culture', index: '12', title: 'Culture & inclusion', image: 'img/AdobeStock_132223860.jpeg', items: [
    { title: 'Inclusion at work', image: 'img/AdobeStock_609514149.jpeg', link: 'https://example.com/inclusion-at-work', text: 'Build stronger teams through practical actions that support respect, fairness and participation.', info: '2h • On demand', size: 'standard' },
    { title: 'Bias and awareness', image: 'img/ai3.png', link: 'https://example.com/bias-awareness', text: 'Recognise common patterns and improve everyday decision-making with greater awareness.', info: '2.5h • Live', size: 'standard' },
    { title: 'Inclusive leadership', image: 'img/20230316_EP_147095A_DEN_888__2__69792418.jpg', link: 'https://example.com/inclusive-leadership', text: 'Lead with more intention by creating safe spaces for voices, ideas and contribution.', info: '3h • Hybrid', size: 'wide' },
    { title: 'Belonging in practice', image: 'img/20160226_EP_032394A_BBO_113__1__95576947.jpg', link: 'https://example.com/belonging-in-practice', text: 'Move from intentions to practical habits that make teams feel recognised and included.', info: '1.5h • Self-paced', size: 'standard' }
  ] },
  { id: 'language', index: '13', title: 'Language & professionalism', image: 'img/AI_collection_of_courses__91624375__92666607.png', items: [
    { title: 'Clear language', image: 'img/Clear_Language_Essentials___Graphic_100496148.png', link: 'https://example.com/clear-language', text: 'Improve clarity, tone and readability across formal and informal communication tasks.', info: '2h • On demand', size: 'standard' },
    { title: 'Professional writing', image: 'img/AdobeStock_1769855883.jpeg', link: 'https://example.com/professional-writing', text: 'Master structure, purpose and concise style for letters, emails and key internal documents.', info: '2.5h • Live', size: 'standard' },
    { title: 'Meeting facilitation', image: 'img/How_to_plan_and_lead_a_productive_meeting_650x365_98688928.png', link: 'https://example.com/meeting-facilitation', text: 'Run meetings that are focused, productive and inclusive while creating better follow-through.', info: '2h • Workshop', size: 'wide' },
    { title: 'Listening and summarising', image: 'img/ai1.png', link: 'https://example.com/listening-and-summarising', text: 'Turn conversations into accurate summaries and shared actions with stronger listening habits.', info: '1.5h • Self-paced', size: 'standard' }
  ] },
  { id: 'innovation', index: '14', title: 'Innovation & creativity', image: 'img/AdobeStock_275122613.jpeg', items: [
    { title: 'Creative problem solving', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/creative-problem-solving', text: 'Explore practical techniques to generate options and move from idea to action more quickly.', info: '2h • On demand', size: 'standard' },
    { title: 'Brainstorming methods', image: 'img/20230316_EP_147095A_DEN_888__2__69792418.jpg', link: 'https://example.com/brainstorming-methods', text: 'Use simple frameworks to make collaborative creativity more focused, inclusive and useful.', info: '2.5h • Live', size: 'standard' },
    { title: 'Experimentation mindset', image: 'img/ai2.png', link: 'https://example.com/experimentation-mindset', text: 'Test, learn and adapt with structured approaches that encourage continuous improvement.', info: '2h • Workshop', size: 'wide' },
    { title: 'Design thinking', image: 'img/AdobeStock_1965104867.jpeg', link: 'https://example.com/design-thinking', text: 'Understand user needs and build better actions by turning feedback into concrete opportunities.', info: '3h • Hybrid', size: 'standard' }
  ] },
  { id: 'people', index: '15', title: 'People management', image: 'img/ai3.png', items: [
    { title: 'Managing performance', image: 'img/ai1.png', link: 'https://example.com/managing-performance', text: 'Build practical and fair performance conversations that strengthen accountability and trust.', info: '2.5h • Live', size: 'standard' },
    { title: 'Employee experience', image: 'img/volunteers_55298429.png', link: 'https://example.com/employee-experience', text: 'Create more engaging and supportive work experiences through better touchpoints and routines.', info: '2h • On demand', size: 'standard' },
    { title: 'Conflict resolution', image: 'img/Cybersecurity_105644876.jpg', link: 'https://example.com/conflict-resolution', text: 'Approach difficult situations with structure, empathy and a clear path for resolution.', info: '2.5h • Workshop', size: 'wide' },
    { title: 'People leadership', image: 'img/karine.png', link: 'https://example.com/people-leadership', text: 'Develop the habits and mindset that create healthy expectations, growth and accountability.', info: '3h • Hybrid', size: 'standard' }
  ] },
  { id: 'strategy', index: '16', title: 'Strategy & execution', image: 'img/AdobeStock_609514149.jpeg', items: [
    { title: 'Strategic thinking', image: 'img/AI_collection_of_courses__91624375__92666607.png', link: 'https://example.com/strategic-thinking', text: 'Connect big-picture priorities with decision-making and practical execution across teams.', info: '2h • On demand', size: 'standard' },
    { title: 'Execution rhythm', image: 'img/EP_Powers_and_EU_Policies_90705421.png', link: 'https://example.com/execution-rhythm', text: 'Design disciplined routines that keep work moving with alignment, follow-up and accountability.', info: '2.5h • Live', size: 'standard' },
    { title: 'Prioritisation', image: 'img/How_to_plan_and_lead_a_productive_meeting_650x365_98688928.png', link: 'https://example.com/prioritisation', text: 'Make better trade-offs and focus energy where it can create the strongest organisational value.', info: '1.5h • Workshop', size: 'wide' },
    { title: 'From plan to action', image: 'img/ai2.png', link: 'https://example.com/plan-to-action', text: 'Turn strategic intent into clear actions, ownership and momentum across the organisation.', info: '2h • Self-paced', size: 'standard' }
  ] }
];

const additionalItemsBySection = {
  leadership: [
    ['Participatory leadership', 'EU_learn_Participatory_Leadership_650x3652_82118316.png'],
    ['Leading through change', 'Cultivating_sustainable_motivation_650x365_94628048.png'],
    ['Powers of scrutiny', 'EU_learn_Powers_of_Scrutiny_650x365_97642434.png']
  ],
  communication: [
    ['Presentation skills in virtual settings', 'My_presentation_skills_in_virtual_settings_640x365_51342528_78702904_94765412.jpg'],
    ['Reading a speech', 'public_speaking_reading_a_speech_98839391.png'],
    ['How to develop professional communication', 'EU_learn_How_to_develop_prof_650x365_107454336.png']
  ],
  wellbeing: [
    ['Mental health first aid', 'Mental_health_First_Aid_95955956.png'],
    ['Emotional intelligence', 'Emotional_intel_650x365_83105060.png'],
    ['Preventing harassment', 'prevent_harrassment_94640291.png']
  ],
  digital: [
    ['Microsoft Teams', 'IT_Microsoft_Teams_650x365_45569474.jpg'],
    ['Adobe Acrobat', 'IT_Adobe_Acrobat_thumbnail_650x365_61423696.jpg'],
    ['Digital accessibility', 'EU_learn_Digigtal_Accessibility_learning_path_650x365_111111558.png'],
    ['Adobe Premiere', 'EU_learn_AdobePremiere_650x365_98757256.png']
  ],
  learning: [
    ['Train the trainer', 'Train_the_Trainer_postits_94737584.jpg'],
    ['Workshop facilitation tools', 'Online_workshop_facilitation_tools__flow__and_best_practices_95959586.png'],
    ['Newcomer learning path', 'LP_Newcommer_ilustration_78416183.png']
  ],
  security: [
    ['Cybersecurity essentials', 'EU learn cybersecurity 650x365.png'],
    ['Risk management in the European Parliament', 'Risk_Management_in_the_European_Parliament_105461259.png'],
    ['Disinformation awareness', 'EU_learn_Disinformation_650x365_109737101.png']
  ],
  project: [
    ['Project management certification preparation', 'Engage_PM_Certification_Exam_preparation_106909389.png'],
    ['Productive meetings', 'How_to_plan_and_lead_a_productive_meeting_650x365_98688928.png'],
    ['Kick-start competition preparation', 'Kick_start_competition_prep_Image_81343338_98509988.png']
  ],
  policy: [
    ['EU law for non-lawyers', 'LEX_EU_Law_for_Non_Lawyers_An_Introduction_to_the_EUs_sources_of_law_640x365_36332398_77551242.jpg'],
    ['Ordinary legislative procedure', 'EU_learn_Ordinary_Legislative_Procedure_650x365_106328879.png'],
    ['Understanding the EU budget', 'LEX_Understanding_the_EU_Budget_640x365_36904879_79564509.jpg'],
    ['Environmental law and the Green Deal', 'LEX__Enviornmental_Law_Green_Deal__68408323.jpg']
  ],
  teamwork: [
    ['Getting the most out of feedback', 'Getting_the_most_out_of_feedback_93656167.png'],
    ['Tough talks', 'EU_learn_Tough_talks_650x365_98569406.png'],
    ['Multigenerational teams', 'EU_learn_multigen_650x365_96312006.jpg']
  ],
  career: [
    ['Develop your personal brand', 'EU_learn_Develop_personal_brand_650x365_110232425.png'],
    ['Prepare for an internal interview', 'EU_Learn_How_to_prepare_for_internal_interview_108299500.png'],
    ['How to develop professionally', 'EU_learn_How_to_develop_prof_650x365_107454336.png']
  ],
  coaching: [
    ['Mentoring', 'EU_learn_thumb_Mentoring_650x365_88868314.png'],
    ['Coaching conversations', 'EU_learn_Tough_talks_650x365_98569406.png'],
    ['Participatory leadership coaching', 'EU_learn_Participatory_Leadership_650x3652_82118316.png']
  ],
  culture: [
    ['Diversity and inclusion', 'EU_learn_thumb_Diversity_inclusion_650x365_88132879.png'],
    ['Inclusive leadership', 'EP_Powers_and_EU_Policies_90705421.png'],
    ['Respect at work', 'WORK_Let_s_talk_ethics_640x365_37106235_106692516.jpg']
  ],
  language: [
    ['Clear language essentials', 'Clear_Language_Essentials___Graphic_100496148.png'],
    ['Professional writing', 'EU_learn_How_to_develop_prof_650x365_107454336.png'],
    ['Protocol', 'EU_learn_Protocol_650x365_1_108448254.png']
  ],
  innovation: [
    ['Brainstorming techniques', 'EU_learn_brainstorming_techniques_650x365_107223191.png'],
    ['Creative problem solving', 'PowerVisuals_thumb_650x3652_89137204.png'],
    ['Kick-start competition preparation', 'Kick_start_competition_prep_Image_81343338_98509988.png']
  ],
  people: [
    ['Employee experience', 'volunteers_55298429.png'],
    ['Managing performance', 'Competences.png'],
    ['Conflict resolution', 'WORK_Let_s_talk_ethics_640x365_37106235_106692516.jpg']
  ],
  strategy: [
    ['Strategic representation', 'EU_learn_Representation_650x365_87390653.png'],
    ['Understanding the EU mission', 'eMISS_Mission_rules_and_MISS_application_104595295.png'],
    ['EU powers and policies', 'EP_Powers_and_EU_Policies_90705421.png']
  ]
};

function addMissingCatalogueItems(data) {
  return data.map((section) => {
    const existingImages = new Set(section.items.map((item) => item.image));
    const additions = (additionalItemsBySection[section.id] || [])
      .filter(([, image]) => !existingImages.has(`img/${image}`))
      .map(([title, image]) => ({
        sectionId: section.id,
        title,
        image: `img/${image}`,
        link: `https://example.com/enrol/${section.id}/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
        text: `Explore ${title.toLowerCase()} through the L&D catalogue.`,
        info: 'On demand',
        size: 'standard'
      }));
    return { ...section, items: [...section.items, ...additions] };
  });
}

const pageTwoSections = [
  ['eu-policies', '01', 'EU POLICIES & EP CORE BUSINESS'],
  ['ep-work-tools', '02', 'EP WORK TOOLS & RULES'],
  ['digital-competences', '03', 'DIGITAL COMPETENCES'],
  ['language-courses', '04', 'LANGUAGE COURSES'],
  ['communication-competencies', '05', 'COMMUNICATION COMPETENCIES'],
  ['finance-tools', '06', 'FINANCE TOOLS & REGULATIONS'],
  ['mep-apa-training', '07', 'MEP & APA TRAINING'],
  ['ethics-data-protection', '08', 'ETHICS & DATA PROTECTION'],
  ['career-development', '09', 'CAREER DEVELOPMENT'],
  ['wellbeing', '10', 'WELLBEING'],
  ['newcomers-mandatory', '11', 'NEWCOMERS & MANDATORY COURSES'],
  ['jean-monnet-academy', '12', 'JEAN MONNET ACADEMY'],
  ['ep-talks-webinars', '13', 'EP TALKS & WEBINARS'],
  ['faq', '14', 'FAQ']
];

const pdfSectionOneItems = [
  ['EP Powers and EU Policies', 'EP_Powers_and_EU_Policies_90705421.png'],
  ['Rules of Procedure', 'LEX_Rules_of_Procedure_and_Beyond_640x365_57244569.jpg'],
  ['Powers of Scrutiny of the European Parliament', 'EU_learn_Powers_of_Scrutiny_650x365_97642434.png'],
  ['Legislating for the European Union', 'EU_learn_Ordinary_Legislative_Procedure_650x365_106328879.png'],
  ['Ordinary Legislative Procedure - Walkthrough the OLP / Cod Procedure', 'LEX_Legislating_for_EU_essential_guide_640x365_36307277_77551242.jpg'],
  ['Legislative Amendments from A to Z: Drafting, Tabling, Voting', 'LEX_Drafting_legislation_640x365_39178194_78410575.jpg'],
  ['EU Delegated and Implementing Acts at a Glance', 'EU_Delegated_and_Implementing_Acts_at_a_glance_90707046.png'],
  ['EU Law for Non-Lawyers', 'LEX_EU_Law_for_Non_Lawyers_An_Introduction_to_the_EUs_sources_of_law_640x365_36332398_77551242.jpg'],
  ['Rule of Law as a Fundamental Value of the European Union', 'LEX_Rule_of_Law_as_a_Fundamental_Value_of_EU_640x365_55448756.jpg'],
  ['EU Social Law', 'LEX_EU_Public_Health_106281916.jpg'],
  ['EU Food Law', 'EU_Food_Law_106470112.jpg'],
  ['EU Public Health', 'LEX_EU_Public_Health_106281916.jpg'],
  ['Environmental Law and the European Green Deal', 'LEX__Enviornmental_Law_Green_Deal__68408323.jpg'],
  ['EU Trade Policy and Geoeconomics', 'LEX_Everyday_economics_650x365_39166703.jpg']
].map(([title, image]) => ({
  sectionId: 'eu-policies',
  title,
  image: `img/${image}`,
  link: `https://example.com/enrol/eu-policies/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
  text: `Explore ${title.toLowerCase()} through the L&D catalogue.`,
  info: 'Classroom course',
  size: 'standard'
}));

function pdfItems(sectionId, entries) {
  return entries.map(([title, image]) => ({
    sectionId,
    title,
    image: `img/${image}`,
    link: `https://example.com/enrol/${sectionId}/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    text: `Explore ${title.toLowerCase()} through the L&D catalogue.`,
    info: 'Classroom course',
    size: 'standard'
  }));
}

const pdfItemsBySection = {
  'ep-work-tools': pdfItems('ep-work-tools', [
    ['Microsoft Teams', 'IT_Microsoft_Teams_650x365_45569474.jpg'],
    ['Adobe Acrobat', 'IT_Adobe_Acrobat_thumbnail_650x365_61423696.jpg'],
    ['Office 365', 'EU learn Office 365 650x365.png'],
    ['GEDA online course', 'IT_GEDA_online_course_650x365_36422001.jpg'],
    ['Protocol', 'EU_learn_Protocol_650x365_1_108448254.png'],
    ['Staff Regulations', 'EU_learn_Staff_Regulations_650x365_02.04.2025_107750574.png']
  ]),
  'digital-competences': pdfItems('digital-competences', [
    ['Digital competences', 'digital_basics_96084258.png'],
    ['Digital accessibility learning path', 'EU_learn_Digigtal_Accessibility_learning_path_650x365_111111558.png'],
    ['AI tools and applications', 'EU learn Could apps 650x365.png'],
    ['Adobe Premiere', 'EU_learn_AdobePremiere_650x365_98757256.png'],
    ['Cybersecurity', 'EU learn cybersecurity 650x365.png'],
    ['Disinformation', 'EU_learn_Disinformation_650x365_109737101.png']
  ]),
  'language-courses': pdfItems('language-courses', [
    ['Clear Language Essentials', 'Clear_Language_Essentials___Graphic_100496148.png'],
    ['How to develop professional language skills', 'EU_learn_How_to_develop_prof_650x365_107454336.png'],
    ['Professional writing', 'AdobeStock_1769855883.jpeg'],
    ['Language and communication', 'My_presentation_skills_in_virtual_settings_640x365_51342528_78702904_94765412.jpg'],
    ['Listening and summarising', 'ai1.png']
  ]),
  'communication-competencies': pdfItems('communication-competencies', [
    ['My presentation skills in virtual settings', 'My_presentation_skills_in_virtual_settings_640x365_51342528_78702904_94765412.jpg'],
    ['Public speaking and reading a speech', 'public_speaking_reading_a_speech_98839391.png'],
    ['Storytelling for impact', '20160226_EP_032394A_BBO_113__1__95576947.jpg'],
    ['How to plan and lead a productive meeting', 'How_to_plan_and_lead_a_productive_meeting_650x365_98688928.png'],
    ['Getting the most out of feedback', 'Getting_the_most_out_of_feedback_93656167.png'],
    ['Tough talks', 'EU_learn_Tough_talks_650x365_98569406.png']
  ]),
  'finance-tools': pdfItems('finance-tools', [
    ['Understanding the EU Budget', 'LEX_Understanding_the_EU_Budget_640x365_36904879_79564509.jpg'],
    ['Everyday economics', 'LEX_Everyday_economics_650x365_39166703.jpg'],
    ['Finance tools and regulations', 'PowerVisuals_thumb_650x3652_89137204.png'],
    ['EMAS training', 'EU_learn_EMAS_training_650x365_107343653.png'],
    ['Risk management in the European Parliament', 'Risk_Management_in_the_European_Parliament_105461259.png']
  ]),
  'mep-apa-training': pdfItems('mep-apa-training', [
    ['EP role play', 'EU_learn_EP_role_play_650x365_91503920.png'],
    ['MEP training', 'EU_learn_Learn_MEP_650x365_101850138.png'],
    ['Representation', 'EU_learn_Representation_650x365_87390653.png'],
    ['Powers of scrutiny', 'EU_learn_Powers_of_Scrutiny_650x365_97642434.png'],
    ['Participatory leadership', 'EU_learn_Participatory_Leadership_650x3652_82118316.png']
  ]),
  'ethics-data-protection': pdfItems('ethics-data-protection', [
    ['Let’s talk ethics', 'WORK_Let_s_talk_ethics_640x365_37106235_106692516.jpg'],
    ['Preventing harassment', 'prevent_harrassment_94640291.png'],
    ['Data protection', 'AdobeStock_214541560.jpeg'],
    ['Disinformation awareness', 'EU_learn_Disinformation_650x365_109737101.png'],
    ['Compliance essentials', 'brand_guidelines_93851484.png'],
    ['EU delegated and implementing acts', 'EU_Delegated_and_Implementing_Acts_at_a_glance_90707046.png']
  ]),
  'career-development': pdfItems('career-development', [
    ['Develop your personal brand', 'EU_learn_Develop_personal_brand_650x365_110232425.png'],
    ['Prepare for an internal interview', 'EU_Learn_How_to_prepare_for_internal_interview_108299500.png'],
    ['Career development', '2026_03_31_velomai_2026_V03_2_108622172.jpg'],
    ['Professional brand', 'AI_collection_of_courses__91624375__92666607.png']
  ]),
  wellbeing: pdfItems('wellbeing', [
    ['Resilience at work', 'Resilience_at_Work_thumb_650x365_88056299.png'],
    ['Mental Health First Aid', 'Mental_health_First_Aid_95955956.png'],
    ['Emotional intelligence', 'Emotional_intel_650x365_83105060.png'],
    ['Cultivating sustainable motivation', 'Cultivating_sustainable_motivation_650x365_94628048.png'],
    ['How to stay fit at your desk', 'Howtostayfitatyourdesk_ebrITWl0WdncWdCvGaUCzyZFBo_152682_thumb_84963447.jpg']
  ]),
  'newcomers-mandatory': pdfItems('newcomers-mandatory', [
    ['EP induction programme', 'ep_induction_programme_650x365__002__100092045.png'],
    ['Newcomer learning path', 'LP_Newcommer_ilustration_78416183.png'],
    ['Mandatory training', '2_mandatory_training_84058887.png'],
    ['Staff Regulations', 'EU_learn_Staff_Regulations_650x365_02.04.2025_107750574.png']
  ]),
  'jean-monnet-academy': pdfItems('jean-monnet-academy', [
    ['JMA Begin', 'EU_learn_JMA_Begin_650x365_63636773.jpg'],
    ['JMA Exploration', 'EU_learn_JMA_Exploration_650x365_63881592.jpg'],
    ['JMA Amplitude', 'EU_learn_JMA_Amplitude_650x365_63522297.jpg'],
    ['JMA Our House', 'EU_learn_JMA_Our_House_650x365_63881929.jpg'],
    ['JMA Perspectives', 'EU_learn_JMA_Perspectives_650x365_63927169.jpg'],
    ['JMA Your Story', 'EU_learn_JMA_Your_Story_650x365_63927431.jpg']
  ]),
  'ep-talks-webinars': pdfItems('ep-talks-webinars', [
    ['EP talks and webinars', 'ep_talk_faces_main_template_EUL_90430580.png'],
    ['Online workshop facilitation', 'Online_workshop_facilitation_tools__flow__and_best_practices_95959586.png'],
    ['EU learn workshops', 'EU learn Could apps 650x365.png'],
    ['Learning conversations', 'pexels_kindelmedia_7579354_108093519.jpg']
  ]),
  faq: []
};

function applyPageTwoSections(data) {
  const sourceGroups = [
    ['policy'],
    ['project'],
    ['digital'],
    ['language'],
    ['communication'],
    ['strategy'],
    ['leadership'],
    ['security', 'culture'],
    ['career'],
    ['wellbeing'],
    ['learning'],
    ['coaching'],
    ['teamwork'],
    []
  ];
  const sourceSections = new Map(data.map((section) => [section.id, section]));

  return pageTwoSections.map(([id, sectionIndex, title], index) => {
    const items = sourceGroups[index]
      .flatMap((sourceId) => sourceSections.get(sourceId)?.items || [])
      .map((item) => ({ ...item, sectionId: id }));

    if (index === 0) {
      return { id, index: sectionIndex, title, items: pdfSectionOneItems };
    }

    return {
      id,
      index: sectionIndex,
      title,
      items: pdfItemsBySection[id] || items
    };
  });
}

function applyAuthoritativeCatalogueItems() {
  const itemsBySection = new Map(pageTwoSections.map(([id]) => [id, []]));
  for (const item of window.authoritativeCatalogueItems || []) {
    if (itemsBySection.has(item.sectionId)) {
      itemsBySection.get(item.sectionId).push({
        ...item,
        sectionId: item.sectionId,
        info: item.info || '',
        link: item.link || '',
        image: item.image || '',
        text: item.text || '',
        displayOrder: itemsBySection.get(item.sectionId).length
      });
    }
  }

  return pageTwoSections.map(([id, index, title]) => ({
    id,
    index,
    title,
    heroImage: (itemsBySection.get(id) || []).find((item) => item.image)?.image || DEFAULT_IMAGE,
    items: itemsBySection.get(id) || []
  }));
}

function getInitialSectionData() {
  const authoritative = window.authoritativeCatalogueItems?.length
    ? applyAuthoritativeCatalogueItems()
    : applyPageTwoSections(addMissingCatalogueItems(normalizeSectionData(baseSectionData)));
  const saved = loadCatalogueState();
  if (!Array.isArray(saved)) return authoritative;

  const savedMap = new Map(saved.map((section) => [section.id, section]));
  return authoritative.map((section) => {
    const savedSection = savedMap.get(section.id);
    return savedSection && Array.isArray(savedSection.items)
      ? { ...section, items: savedSection.items }
      : section;
  });
}

const sectionData = getInitialSectionData();

function getDemoTimestamp(itemIndex, editIndex) {
  const date = new Date(catalogueEncodedAt);
  date.setDate(date.getDate() - ((itemIndex % 18) + editIndex * 3));
  date.setHours(9 + ((itemIndex + editIndex) % 8), (itemIndex * 7 + editIndex * 11) % 60, 0, 0);
  return date.toISOString();
}

function applyDemoProfileMetadata(data) {
  let globalIndex = 0;
  const shouldSeedProfiles = localStorage.getItem(demoProfilesKey) !== 'true';

  data.forEach((section) => {
    section.items.forEach((item) => {
      const owner = shouldSeedProfiles
        ? demoProfiles[globalIndex % demoProfiles.length]
        : demoProfiles.find((profile) => profile.name === item.owner) || { name: item.owner || 'Laurent', role: 'Catalogue admin' };
      const editCount = shouldSeedProfiles ? 1 + (globalIndex % 3) : 1;
      const editHistory = shouldSeedProfiles
        ? Array.from({ length: editCount }, (_, editIndex) => ({
            person: demoProfiles[(globalIndex + editIndex + 2) % demoProfiles.length].name,
            timestamp: getDemoTimestamp(globalIndex, editIndex)
          }))
        : [{ person: owner.name, timestamp: item.encodedAt || catalogueEncodedAt }];

      item.owner = item.owner && !shouldSeedProfiles ? item.owner : owner.name;
      item.ownerRole = item.ownerRole && !shouldSeedProfiles ? item.ownerRole : owner.role;
      item.encodedAt = item.encodedAt || catalogueEncodedAt;
      item.editHistory = Array.isArray(item.editHistory) && item.editHistory.length && !shouldSeedProfiles
        ? item.editHistory
        : editHistory;
      globalIndex += 1;
    });
  });

  if (shouldSeedProfiles) {
    localStorage.setItem(demoProfilesKey, 'true');
    saveCatalogueState(data);
  }
}

applyDemoProfileMetadata(sectionData);

function formatDashboardDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getAllItems() {
  return sectionData.flatMap((section) => section.items.map((item, index) => ({ item, section, index })));
}

function getDashboardStats(items) {
  const people = new Map(demoProfiles.map((profile) => [profile.name, {
    ...profile,
    owned: 0,
    edits: 0,
    sections: new Set(),
    lastAction: null
  }]));
  const recentActions = [];

  items.forEach(({ item, section }) => {
    const owner = people.get(item.owner) || { name: item.owner, role: item.ownerRole || 'Contributor', owned: 0, edits: 0, sections: new Set(), lastAction: null };
    owner.owned += 1;
    owner.sections.add(section.title);
    people.set(owner.name, owner);

    item.editHistory.forEach((entry) => {
      const profile = people.get(entry.person) || { name: entry.person, role: 'Contributor', owned: 0, edits: 0, sections: new Set(), lastAction: null };
      profile.edits += 1;
      profile.sections.add(section.title);
      const action = { person: entry.person, itemTitle: item.title, sectionTitle: section.title, timestamp: entry.timestamp };
      recentActions.push(action);
      if (!profile.lastAction || new Date(entry.timestamp) > new Date(profile.lastAction.timestamp)) {
        profile.lastAction = action;
      }
      people.set(profile.name, profile);
    });
  });

  const profiles = [...people.values()].sort((first, second) => second.edits - first.edits || second.owned - first.owned);
  return {
    profiles,
    totalEdits: profiles.reduce((total, profile) => total + profile.edits, 0),
    topEditor: profiles[0],
    topOwner: [...people.values()].sort((first, second) => second.owned - first.owned)[0],
    recentActions: recentActions.sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp)).slice(0, 5)
  };
}

function renderFriendlyStats(stats) {
  const profiles = stats.profiles.map((profile) => `
    <article class="dashboard-profile">
      <div>
        <strong>${profile.name}</strong>
        <span>${profile.role}</span>
      </div>
      <dl>
        <div><dt>Owns</dt><dd>${profile.owned}</dd></div>
        <div><dt>Edits</dt><dd>${profile.edits}</dd></div>
        <div><dt>Sections</dt><dd>${profile.sections.size}</dd></div>
      </dl>
    </article>
  `).join('');
  const recentActions = stats.recentActions.map((action) => `
    <li><strong>${action.person}</strong><span>${action.itemTitle}</span><em>${formatDashboardDate(action.timestamp)}</em></li>
  `).join('');

  return `
    <div class="dashboard-friendly-stats">
      <div class="dashboard-insights">
        <div><span>Most active</span><strong>${stats.topEditor.name}</strong><small>${stats.topEditor.edits} edits</small></div>
        <div><span>Most ownership</span><strong>${stats.topOwner.name}</strong><small>${stats.topOwner.owned} items</small></div>
        <div><span>Total teamwork</span><strong>${stats.totalEdits}</strong><small>recorded edits</small></div>
      </div>
      <div class="dashboard-profiles">
        ${profiles}
      </div>
      <div class="dashboard-recent">
        <h2>Latest activity</h2>
        <ul>${recentActions}</ul>
      </div>
    </div>
  `;
}

function updateDialogMetadata(item = {}) {
  const ownerMeta = document.getElementById('item-owner-meta');
  const historyMeta = document.getElementById('item-edit-history-meta');
  if (!ownerMeta || !historyMeta) return;

  const owner = item.owner || 'Laurent';
  const editHistory = Array.isArray(item.editHistory) && item.editHistory.length
    ? item.editHistory
    : [{ person: owner, timestamp: item.encodedAt || new Date().toISOString() }];

  ownerMeta.textContent = owner;
  historyMeta.innerHTML = editHistory.slice().reverse().map((entry) => `
    <li><strong>${entry.person}</strong><span>${formatDashboardDate(entry.timestamp)}</span></li>
  `).join('');
}

function detectItem(item) {
  const sizeLabel = item.size === 'wide' ? 'two-column item' : 'standard item';
  const hasContent = Boolean(item.text && item.text.trim().length > 0);
  const hasImage = Boolean(item.image && item.image.trim().length > 0);
  return `Detected ${sizeLabel}. ${hasImage ? 'Image present.' : 'Image missing.'} ${hasContent ? 'Text present.' : 'Text missing.'}`;
}

function confirmItem(item, sectionTitle) {
  const message = `${detectItem(item)}\n\nIs this item correct for the ${sectionTitle} section?`;
  return window.confirm(message);
}

function renderCover() {
  return `
    <section class="page cover-page">
      <div class="cover-panel">
        <img class="catalogue-cover-image" src="stocksnap-people-2557396_1920.jpg" alt="People collaborating during a learning workshop" />
        <div class="catalogue-cover-shade"></div>
        <div class="catalogue-cover-content">
          <h1 class="catalogue-cover-title">Learning<br />Catalogue<span>_</span><br />20<span class="cover-year-accent">26</span></h1>
        </div>
        <div class="catalogue-cover-colors" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const items = getAllItems();
  const stats = getDashboardStats(items);
  const lastLogin = localStorage.getItem(lastLoginKey);
  const rows = items.map(({ item, section, index }) => {
    const latestEdit = item.editHistory[item.editHistory.length - 1];
    const history = item.editHistory.slice().reverse().map((entry) => `
      <li><strong>${entry.person}</strong><span>${formatDashboardDate(entry.timestamp)}</span></li>
    `).join('');

    return `
      <article class="dashboard-item">
        <div class="dashboard-item__main">
          <span class="dashboard-item__section">${section.index} · ${section.title}</span>
          <h2>${item.title}</h2>
          <span class="dashboard-item__meta">Owner: ${item.owner} · Last edited by ${latestEdit.person} on ${formatDashboardDate(latestEdit.timestamp)}</span>
        </div>
        <details class="dashboard-item__history">
          <summary>Edited by ${item.editHistory.length} ${item.editHistory.length === 1 ? 'person' : 'people'}</summary>
          <ul>${history}</ul>
        </details>
        <button class="edit-btn dashboard-item__edit" type="button" data-section-id="${section.id}" data-item-index="${index}" aria-label="Edit ${item.title}" title="Edit item">&#9998;</button>
      </article>
    `;
  }).join('');

  return `
    <section class="dashboard-page page" id="dashboard">
      <div class="dashboard-header">
        <div>
          <span class="section-label">CATALOGUE ADMINISTRATION</span>
          <h1>Hello Laurent</h1>
          <p>Here is the complete catalogue and its editing history.</p>
        </div>
        <div class="dashboard-stats">
          <div><strong>${items.length}</strong><span>Items</span></div>
          <div><strong>${sectionData.length}</strong><span>Sections</span></div>
        </div>
      </div>
      <div class="dashboard-account">
        <div><span>Last connection</span><strong>${formatDashboardDate(lastLogin)}</strong></div>
        <div><span>Articles encoded</span><strong>${formatDashboardDate(catalogueEncodedAt)}</strong></div>
        <div><span>Signed in as</span><strong>Laurent</strong></div>
      </div>
      ${renderFriendlyStats(stats)}
      <details class="dashboard-list">
        <summary class="dashboard-list__summary">
          <span>Owner and edit history</span>
          <strong>${items.length} items</strong>
        </summary>
        <div class="dashboard-list__heading"><span>All catalogue items</span><span>Owner and edit history</span></div>
        ${rows}
      </details>
    </section>
  `;
}

function renderMenu() {
  const palette = [
    'menu-card--page2-01', 'menu-card--page2-02', 'menu-card--page2-03', 'menu-card--page2-04',
    'menu-card--page2-05', 'menu-card--page2-06', 'menu-card--page2-07', 'menu-card--page2-08',
    'menu-card--page2-09', 'menu-card--page2-10', 'menu-card--page2-11', 'menu-card--page2-12',
    'menu-card--page2-13', 'menu-card--page2-14'
  ];

  const cards = sectionData.map((section, index) => `
    <a class="menu-card ${palette[index % palette.length]}" href="#${section.id}" aria-label="Open ${section.title}">
      <div class="menu-card__content">
        <span class="menu-card__number">${section.index}</span>
        <div class="menu-card__title">${section.title}</div>
      </div>
    </a>
  `).join('');

  return `
    <section class="page menu-page" id="menu">
      <div class="page-header">
        <div>
          <div class="section-label">TABLE OF CONTENT</div>
        </div>
      </div>

      <div class="menu-grid">
        ${cards}
      </div>
    </section>
  `;
}

function renderSectionNav(sectionId) {
  const links = sectionData.map((section) => `
    <a class="section-menu-link section-menu-link--${section.index} ${section.id === sectionId ? 'is-current' : ''}" href="#${section.id}">
      <span class="section-menu-link__number">${section.index}</span>
      <span>${section.title}</span>
    </a>
  `).join('');

  return `
    <div class="section-shell">
      <div class="section-nav section-nav--menu">
        <button class="section-menu-toggle" type="button" aria-expanded="false" aria-label="Open section menu">
          <span></span><span></span><span></span>
        </button>
        <nav class="section-menu-list" aria-label="Sections">
          ${links}
        </nav>
      </div>
    </div>
  `;
}

window.revealItemCard = (card) => {
  if (!card || card.dataset.revealScheduled === 'true') return;
  card.dataset.revealScheduled = 'true';
  window.setTimeout(() => card.classList.remove('is-loading'), 500);
};

function renderFloatingSectionMenu() {
  const links = sectionData.map((section) => `
    <a class="section-menu-link section-menu-link--${section.index}" href="#${section.id}">
      <span class="section-menu-link__number">${section.index}</span>
      <span>${section.title}</span>
    </a>
  `).join('');

  return `
    <div class="floating-section-menu" aria-label="Section navigation">
      <button class="section-menu-toggle floating-section-menu__toggle" type="button" aria-expanded="false" aria-label="Open section menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="section-menu-list floating-section-menu__list" aria-label="Sections">
        <button class="section-menu-close" type="button" aria-label="Close section menu" title="Close menu">×</button>
        ${links}
      </nav>
    </div>
  `;
}

function renderSectionTransitionOverlay() {
  return '<div class="section-transition-overlay" aria-hidden="true"></div>';
}

function renderItem(item, sectionId, index) {
  const hasDescription = Boolean(item.text && item.text.trim());
  const isPlaceholderDescription = /^lorem ipsum/i.test(item.text?.trim() || '');
  const sizeClass = item.size === 'wide' || !hasDescription || isPlaceholderDescription ? 'item-card--wide' : '';
  const actionLabel = sizeClass ? 'Discover our selection' : 'Enrol';
  const editButton = isLoggedIn ? `<button class="edit-btn" type="button" data-section-id="${sectionId}" data-item-index="${index}" aria-label="Edit ${item.title}" title="Edit item">&#9998;</button>` : '';
  const removeButton = isLoggedIn ? `<button class="remove-btn" type="button" data-section-id="${sectionId}" data-item-index="${index}" aria-label="Remove ${item.title}" title="Remove item">&#128465;</button>` : '';
  const enrolButton = item.link
    ? `<a class="link-btn" href="${item.link}" target="_blank" rel="noreferrer">${actionLabel}</a>`
    : `<span class="link-btn link-btn--disabled" aria-disabled="true">${actionLabel}</span>`;

  return `
    <article class="item-card is-loading ${sizeClass}" data-item-index="${index}" draggable="${isLoggedIn}">
      <div class="item-content">
        <h3>${item.title}</h3>
        ${hasDescription ? `<p>${item.text}</p>` : ''}
        <div class="item-footer">
          <span class="item-info">${item.info}</span>
          <div class="item-actions">
            ${enrolButton}
          </div>
        </div>
      </div>
      <div class="item-media">
        <img src="${safeImage(item.image)}" alt="${item.title}" loading="eager" decoding="async" onload="this.classList.add('is-loaded');this.closest('.item-card').dataset.imageLoaded='true';if(this.closest('.item-card').dataset.inViewport==='true')window.revealItemCard(this.closest('.item-card'));" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';this.classList.add('is-loaded');this.closest('.item-card').dataset.imageLoaded='true';if(this.closest('.item-card').dataset.inViewport==='true')window.revealItemCard(this.closest('.item-card'));" />
        ${editButton}
        ${removeButton}
      </div>
    </article>
  `;
}

function renderSectionPage(section) {
  const orderedItems = [...section.items].sort((first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0));
  const items = orderedItems.map((item, index) => renderItem(item, section.id, index)).join('');

  return `
    <section class="page section-page" id="${section.id}">
      <div class="section-hero section-hero--${section.index}">
        <div class="section-hero__label">${section.index}</div>
        <h2>${section.title}</h2>
      </div>
      <div class="section-hero__image">
        <img src="${safeImage(section.heroImage)}" alt="${section.title}" loading="eager" decoding="async" onload="this.classList.add('is-loaded');this.closest('.section-hero__image').classList.add('is-loaded');" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE}';this.classList.add('is-loaded');this.closest('.section-hero__image').classList.add('is-loaded');" />
      </div>

      <div class="container">
        <div class="items-grid">
          ${items}
        </div>
        <div class="section-actions">
          ${isLoggedIn ? `<button class="primary-btn add-item-btn" type="button" data-section-id="${section.id}">Add item</button>` : ''}
        </div>
      </div>
    </section>
  `;
}

function renderApp() {
  app.innerHTML = [
    isLoggedIn ? renderDashboard() : renderCover(),
    renderMenu(),
    ...sectionData.map(renderSectionPage),
    renderFloatingSectionMenu(),
    renderSectionTransitionOverlay()
  ].join('');

  bindGlobalActions();
  bindAdminActions();
}

function bindGlobalActions() {
  let previousScrollY = window.scrollY;

  document.querySelectorAll('.menu-card').forEach((card) => {
    card.addEventListener('pointerenter', () => card.classList.add('is-hovered'));
    card.addEventListener('pointerleave', () => card.classList.remove('is-hovered'));
    card.addEventListener('focus', () => card.classList.add('is-hovered'));
    card.addEventListener('blur', () => card.classList.remove('is-hovered'));
  });

  const updateSectionHeaders = () => {
    const sections = [...document.querySelectorAll('.section-page')];
    previousScrollY = window.scrollY;
    const activeSection = [...sections].reverse().find((sectionPage) => {
      const rect = sectionPage.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom > 0;
    });
    sections.forEach((sectionPage) => {
      const hero = sectionPage.querySelector('.section-hero');
      if (!hero) return;
      const pageRect = sectionPage.getBoundingClientRect();
      const incoming = sectionPage === activeSection;
      hero.classList.toggle('is-active-section', sectionPage === activeSection);
      hero.classList.toggle('is-behind', sectionPage !== activeSection);
      hero.classList.toggle('is-incoming', incoming);
      hero.classList.toggle('is-future', pageRect.top > 0 && sectionPage !== activeSection);
      hero.classList.toggle('is-condensed', incoming && hero.getBoundingClientRect().top <= 0);
      hero.classList.toggle('is-under-active-section', sectionPage !== activeSection && pageRect.top < 0);
      hero.classList.remove('is-ending', 'is-at-top');

    });
  };

  window.addEventListener('scroll', updateSectionHeaders, { passive: true });
  updateSectionHeaders();

  const itemObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.dataset.inViewport = 'true';
      if (card.dataset.imageLoaded === 'true') window.revealItemCard(card);
      observer.unobserve(card);
    });
  }, { rootMargin: '120px 0px' });

  document.querySelectorAll('.item-card.is-loading').forEach((card) => itemObserver.observe(card));

  const navigateToSection = (targetId) => {
    const target = document.getElementById(targetId);
    const overlay = document.querySelector('.section-transition-overlay');
    if (!target) return;
    overlay?.classList.add('is-active');

    let stopTimer;
    let safetyTimer;
    let pollTimer;
    let lastScrollY = window.scrollY;
    let stableSince = Date.now();
    const finishTransition = () => {
      window.clearTimeout(stopTimer);
      window.clearTimeout(safetyTimer);
      window.clearInterval(pollTimer);
      window.removeEventListener('scroll', handleScroll);
      overlay?.classList.remove('is-active');
    };
    const handleScroll = () => {
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(finishTransition, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    pollTimer = window.setInterval(() => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        lastScrollY = currentScrollY;
        stableSince = Date.now();
      } else if (Date.now() - stableSince >= 180) {
        finishTransition();
      }
    }, 50);
    safetyTimer = window.setTimeout(finishTransition, 4000);
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  };

  const menuPage = document.querySelector('.menu-page');
  const floatingMenu = document.querySelector('.floating-section-menu');
  if (menuPage && floatingMenu) {
    const updateFloatingMenu = () => {
      floatingMenu.classList.toggle('is-visible', window.scrollY > menuPage.offsetTop + menuPage.offsetHeight - 120);
    };
    window.addEventListener('scroll', updateFloatingMenu, { passive: true });
    updateFloatingMenu();
  }

  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.section-menu-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) navigateToSection(target.id);
      const menu = link.closest('.section-nav');
      menu?.querySelector('.section-menu-list')?.classList.remove('is-open');
      menu?.querySelector('.section-menu-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.section-menu-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const menu = toggle.nextElementSibling;
      toggle.closest('.floating-section-menu')?.classList.remove('is-closed');
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.querySelectorAll('.floating-section-menu .section-menu-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) navigateToSection(target.id);
      const menu = link.closest('.floating-section-menu');
      menu?.querySelector('.section-menu-list')?.classList.remove('is-open');
      menu?.querySelector('.section-menu-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.section-menu-close').forEach((closeButton) => {
    closeButton.addEventListener('click', () => {
      const menu = closeButton.closest('.floating-section-menu');
      menu?.classList.add('is-closed');
      menu?.querySelector('.section-menu-list')?.classList.remove('is-open');
      menu?.querySelector('.section-menu-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    document.querySelectorAll('.floating-section-menu').forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.classList.add('is-closed');
        menu.querySelector('.section-menu-list')?.classList.remove('is-open');
        menu.querySelector('.section-menu-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.querySelectorAll('.add-item-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.getAttribute('data-section-id');
      openDialog(sectionId);
    });
  });

  document.querySelectorAll('.edit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.getAttribute('data-section-id');
      const itemIndex = Number(button.getAttribute('data-item-index'));
      openDialog(sectionId, itemIndex);
    });
  });

  document.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const sectionId = button.getAttribute('data-section-id');
      const itemIndex = Number(button.getAttribute('data-item-index'));
      const section = sectionData.find((entry) => entry.id === sectionId);
      if (!section) return;
      if (window.confirm('Remove this item from the section?')) {
        section.items.splice(itemIndex, 1);
        saveCatalogueState(sectionData);
        renderApp();
      }
    });
  });

  if (isLoggedIn) bindDragAndDrop();
}

function bindDragAndDrop() {
  let draggedCard = null;

  document.querySelectorAll('.item-card[draggable="true"]').forEach((card) => {
    card.addEventListener('dragstart', () => {
      draggedCard = card;
      card.classList.add('is-dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      draggedCard = null;
    });

    card.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!draggedCard || draggedCard === card) return;
      const grid = card.parentElement;
      const cardRect = card.getBoundingClientRect();
      const insertBefore = event.clientY < cardRect.top + cardRect.height / 2;
      grid.insertBefore(draggedCard, insertBefore ? card : card.nextElementSibling);
    });

    card.addEventListener('drop', (event) => {
      event.preventDefault();
      const sectionId = card.closest('.section-page')?.id;
      const section = sectionData.find((entry) => entry.id === sectionId);
      if (!section) return;
      const orderedIndexes = [...card.closest('.items-grid').querySelectorAll('.item-card')]
        .map((itemCard) => Number(itemCard.dataset.itemIndex));
      const currentItems = [...section.items];
      section.items = orderedIndexes.map((index) => currentItems[index]).filter(Boolean);
      section.items.forEach((item, index) => { item.displayOrder = index; });
      saveCatalogueState(sectionData);
      renderApp();
    });
  });
}

function bindAdminActions() {
  const loginToggle = document.getElementById('login-toggle');
  const adminPanel = document.getElementById('admin-panel');
  const adminForm = document.getElementById('admin-form');
  const closeAdmin = document.getElementById('close-admin');
  const cancelAdmin = document.getElementById('cancel-admin');

  if (!loginToggle || !adminPanel || !adminForm) return;

  loginToggle.textContent = isLoggedIn ? 'Log out' : 'Log in';
  loginToggle.href = isLoggedIn ? '#' : 'login.html?return=index.html';
  loginToggle.onclick = isLoggedIn ? (event) => {
    event.preventDefault();
    localStorage.removeItem('brochure_admin_authenticated');
    isLoggedIn = false;
    renderApp();
  } : null;

  closeAdmin.onclick = () => adminPanel.classList.add('hidden');
  cancelAdmin.onclick = () => adminPanel.classList.add('hidden');

  adminForm.onsubmit = (event) => {
    event.preventDefault();
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();

    if (user === 'admin' && pass === 'catalogue') {
      localStorage.setItem('brochure_admin_authenticated', 'true');
      localStorage.setItem(lastLoginKey, new Date().toISOString());
      isLoggedIn = true;
      adminPanel.classList.add('hidden');
      renderApp();
    } else {
      alert('Invalid credentials. Use admin / catalogue.');
    }
  };
}

function openDialog(sectionId, itemIndex = null) {
  sectionIdInput.value = sectionId;
  itemForm.reset();
  itemIndexInput.value = itemIndex === null ? '' : String(itemIndex);
  document.getElementById('item-dialog-title').textContent = itemIndex === null ? 'Add item' : 'Edit item';
  let activeItem = { owner: 'Laurent', encodedAt: new Date().toISOString(), editHistory: [{ person: 'Laurent', timestamp: new Date().toISOString() }] };

  if (itemIndex !== null) {
    const section = sectionData.find((entry) => entry.id === sectionId);
    const item = section?.items[itemIndex];
    if (item) {
      activeItem = item;
      document.getElementById('item-title').value = item.title || '';
      document.getElementById('item-link').value = item.link || '';
      document.getElementById('item-text').value = item.text || '';
      document.getElementById('item-info').value = item.info || '';
      document.getElementById('item-size').value = item.size || 'standard';
      hiddenImageInput.value = item.image || DEFAULT_IMAGE;
    }
  } else {
    hiddenImageInput.value = 'img/AI_collection_of_courses__91624375__92666607.png';
  }
  updateDialogMetadata(activeItem);
  dialog.classList.remove('hidden');
}

function closeDialog() {
  dialog.classList.add('hidden');
}

if (closeDialogBtn) closeDialogBtn.addEventListener('click', closeDialog);
if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
if (dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
}

if (uploadInput) {
  uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      hiddenImageInput.value = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

if (itemForm) {
  itemForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const sectionId = sectionIdInput.value;
    const section = sectionData.find((entry) => entry.id === sectionId);
    const formData = new FormData(itemForm);
    const itemIndex = itemIndexInput.value === '' ? null : Number(itemIndexInput.value);
    const existingItem = itemIndex === null ? null : section?.items[itemIndex];

    const item = {
        sectionId,
      title: String(formData.get('title') || '').trim(),
      image: hiddenImageInput.value || DEFAULT_IMAGE,
      link: String(formData.get('link') || '').trim() || 'https://example.com',
      text: String(formData.get('text') || '').trim(),
      info: String(formData.get('info') || '').trim() || 'New item',
      size: formData.get('size') || 'standard',
      owner: existingItem?.owner || 'Laurent',
      encodedAt: existingItem?.encodedAt || catalogueEncodedAt,
      editHistory: existingItem?.editHistory || [{ person: 'Laurent', timestamp: catalogueEncodedAt }],
      displayOrder: itemIndex === null ? section.items.length : existingItem?.displayOrder ?? itemIndex
    };

    if (!section || !item.title) return;
    if (!confirmItem(item, section.title)) return;

    if (itemIndex === null) {
      item.editHistory = [{ person: 'Laurent', timestamp: new Date().toISOString() }];
      section.items.push(item);
    } else if (section.items[itemIndex]) {
      item.editHistory = [...item.editHistory, { person: 'Laurent', timestamp: new Date().toISOString() }];
      section.items[itemIndex] = item;
    }
    saveCatalogueState(sectionData);
    closeDialog();
    renderApp();
  });
}

renderApp();

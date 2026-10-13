// src/utils/departments.js
// Display details for each doctor specialization. Which departments appear on the site is driven by
// the doctors in the database; this only supplies an icon, colour and description for each one.

const DEPARTMENT_INFO = {
  Cardiology: {
    icon: '💓',
    color: '#e91e63',
    summary: 'Heart and blood vessel care.',
    description: 'Comprehensive heart care: ECGs, blood pressure management, heart rhythm problems and follow-up after cardiac events.'
  },
  Dermatology: {
    icon: '🧴',
    color: '#ff7043',
    summary: 'Skin, hair and nail conditions.',
    description: 'Diagnosis and treatment of skin, hair and nail conditions, from acne and eczema to allergy testing.'
  },
  ENT: {
    icon: '👂',
    color: '#26a69a',
    summary: 'Ear, nose and throat.',
    description: 'Ear, nose and throat problems including hearing tests, sinus care, tonsils and balance disorders.'
  },
  'General Medicine': {
    icon: '🩺',
    color: '#3f51b5',
    summary: 'Everyday illnesses and check-ups.',
    description: 'Your first stop for fevers, infections, chronic conditions and annual check-ups, with referrals to specialists when needed.'
  },
  Gynecology: {
    icon: '🌸',
    color: '#ab47bc',
    summary: 'Women’s health and pregnancy care.',
    description: 'Women’s reproductive health, pregnancy and prenatal care, screening and family planning.'
  },
  Neurology: {
    icon: '🧠',
    color: '#5c6bc0',
    summary: 'Brain, spine and nerves.',
    description: 'Care for migraine, epilepsy, nerve pain, memory problems and other conditions of the brain and nervous system.'
  },
  Ophthalmology: {
    icon: '👁️',
    color: '#9c27b0',
    summary: 'Eye and vision care.',
    description: 'Eye examinations, vision correction, cataract assessment and treatment of eye infections.'
  },
  Orthopedics: {
    icon: '🦴',
    color: '#ff9800',
    summary: 'Bones, joints and muscles.',
    description: 'Fractures, joint pain, back problems and sports injuries, with rehabilitation plans to get you moving again.'
  },
  Pediatrics: {
    icon: '🧸',
    color: '#4caf50',
    summary: 'Care for children and teenagers.',
    description: 'Health care for babies, children and teenagers: growth checks, vaccinations and childhood illnesses.'
  },
  Psychiatry: {
    icon: '🧘',
    color: '#7e57c2',
    summary: 'Mental health support.',
    description: 'Assessment and treatment for anxiety, depression, sleep problems and other mental health concerns.'
  }
};

const FALLBACK = {
  icon: '🏥',
  color: '#607d8b',
  summary: 'Specialist care.',
  description: 'Specialist consultations with our experienced doctors.'
};

export const departmentInfo = (name) => ({ name, ...(DEPARTMENT_INFO[name] || FALLBACK) });

/** Departments that have at least one doctor, alphabetically, with their doctor count. */
export const departmentsFromDoctors = (doctors) => {
  const counts = new Map();
  doctors.forEach((d) => {
    if (d.specialization) counts.set(d.specialization, (counts.get(d.specialization) || 0) + 1);
  });
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, doctorCount]) => ({ ...departmentInfo(name), doctorCount }));
};

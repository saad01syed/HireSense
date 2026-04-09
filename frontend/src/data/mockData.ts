import type {
  Job,
  MarketStat,
  SkillTrend,
  LocationStat,
  CompanyStat,
  ResumeSkill,
  ResumeInsight,
  FilterOption,
} from '../types'

// TODO: Remove this file once backend API is connected.
// All data will be replaced by calls in src/api/

export const JOBS: Job[] = [
  {
    id: 1,
    title: 'Full Stack Software Engineer',
    company: 'Microsoft',
    location: 'Dallas, TX',
    type: 'Full-time',
    salary: '$120k - $160k',
    tags: ['React', 'TypeScript', 'Node.js', 'Azure'],
    posted: '2 days ago',
    badge: 'hot',
    match: 92,
    logo: '🏢',
    hybrid: 'Hybrid',
    description: {
      about: 'Join our dynamic team building next-generation cloud solutions.',
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Participate in code reviews and mentoring'
      ],
      requirements: [
        '3+ years of full-stack development experience',
        'Strong proficiency in React and TypeScript',
        'Experience with cloud platforms (Azure preferred)'
      ],
      benefits: [
        'Competitive salary and equity',
        'Comprehensive health insurance',
        'Flexible work arrangements'
      ]
    }
  },
  {
    id: 2,
    title: 'Senior Backend Developer',
    company: 'Amazon',
    location: 'Plano, TX',
    type: 'Full-time',
    salary: '$140k - $180k',
    tags: ['Python', 'AWS', 'Microservices', 'Docker'],
    posted: '1 day ago',
    badge: 'new',
    match: 88,
    logo: '📦',
    hybrid: 'Remote',
    description: {
      about: 'Build highly scalable distributed systems that power millions of customers.',
      responsibilities: [
        'Design and implement backend services',
        'Optimize system performance and scalability',
        'Lead technical design discussions'
      ],
      requirements: [
        '5+ years backend development experience',
        'Expert knowledge of Python and AWS',
        'Experience with microservices architecture'
      ],
      benefits: [
        'Stock options',
        'Unlimited PTO',
        'Remote-first culture'
      ]
    }
  },
  {
    id: 3,
    title: 'Frontend Engineer',
    company: 'Capital One',
    location: 'Plano, TX',
    type: 'Full-time',
    salary: '$110k - $145k',
    tags: ['React', 'JavaScript', 'CSS', 'Redux'],
    posted: '3 days ago',
    badge: null,
    match: 85,
    logo: '💳',
    hybrid: 'Hybrid',
    description: {
      about: 'Create exceptional user experiences for millions of customers.',
      responsibilities: [
        'Build responsive web applications',
        'Collaborate with UX designers',
        'Ensure cross-browser compatibility'
      ],
      requirements: [
        '3+ years frontend development',
        'Strong React and JavaScript skills',
        'Eye for design and user experience'
      ],
      benefits: [
        'Health and wellness programs',
        '401k matching',
        'Professional development budget'
      ]
    }
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'AT&T',
    location: 'Dallas, TX',
    type: 'Full-time',
    salary: '$115k - $150k',
    tags: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
    posted: '4 days ago',
    badge: null,
    match: 78,
    logo: '📡',
    hybrid: 'On-site',
    description: {
      about: 'Manage and optimize our cloud infrastructure.',
      responsibilities: [
        'Maintain CI/CD pipelines',
        'Monitor system health and performance',
        'Automate deployment processes'
      ],
      requirements: [
        '4+ years DevOps experience',
        'Strong Kubernetes and Docker knowledge',
        'Experience with infrastructure as code'
      ],
      benefits: [
        'Employee stock purchase plan',
        'Tuition reimbursement',
        'Comprehensive insurance'
      ]
    }
  },
  {
    id: 5,
    title: 'Data Engineer',
    company: 'American Airlines',
    location: 'Fort Worth, TX',
    type: 'Full-time',
    salary: '$125k - $155k',
    tags: ['Python', 'SQL', 'Spark', 'Airflow'],
    posted: '5 days ago',
    badge: null,
    match: 82,
    logo: '✈️',
    hybrid: 'Hybrid',
    description: {
      about: 'Build data pipelines that drive business insights.',
      responsibilities: [
        'Design and maintain data pipelines',
        'Optimize data warehouse performance',
        'Collaborate with data scientists'
      ],
      requirements: [
        '3+ years data engineering experience',
        'Proficiency in Python and SQL',
        'Experience with big data tools'
      ],
      benefits: [
        'Flight benefits',
        'Retirement plans',
        'Work-life balance'
      ]
    }
  },
  {
    id: 6,
    title: 'Mobile Developer (iOS)',
    company: 'JPMorgan Chase',
    location: 'Plano, TX',
    type: 'Full-time',
    salary: '$130k - $165k',
    tags: ['Swift', 'iOS', 'UIKit', 'SwiftUI'],
    posted: '1 week ago',
    badge: null,
    match: 75,
    logo: '🏦',
    hybrid: 'Hybrid',
    description: {
      about: 'Develop innovative mobile banking solutions.',
      responsibilities: [
        'Build and maintain iOS applications',
        'Implement new features and improvements',
        'Ensure app security and performance'
      ],
      requirements: [
        '4+ years iOS development',
        'Strong Swift programming skills',
        'App Store publication experience'
      ],
      benefits: [
        'Competitive compensation',
        'Healthcare benefits',
        'Career advancement opportunities'
      ]
    }
  },
  {
    id: 7,
    title: 'Software Engineer Intern',
    company: 'Texas Instruments',
    location: 'Dallas, TX',
    type: 'Internship',
    salary: '$28 - $35/hour',
    tags: ['Python', 'C++', 'Git', 'Linux'],
    posted: '2 days ago',
    badge: 'new',
    match: 90,
    logo: '💻',
    hybrid: 'On-site',
    description: {
      about: 'Gain hands-on experience in embedded systems development.',
      responsibilities: [
        'Assist in software development projects',
        'Write and test code',
        'Participate in team meetings'
      ],
      requirements: [
        'Currently pursuing CS degree',
        'Knowledge of Python or C++',
        'Strong problem-solving skills'
      ],
      benefits: [
        'Mentorship program',
        'Networking opportunities',
        'Potential full-time offer'
      ]
    }
  },
  {
    id: 8,
    title: 'Cloud Solutions Architect',
    company: 'Oracle',
    location: 'Irving, TX',
    type: 'Full-time',
    salary: '$145k - $185k',
    tags: ['AWS', 'Azure', 'Cloud Architecture', 'Networking'],
    posted: '3 days ago',
    badge: 'hot',
    match: 80,
    logo: '☁️',
    hybrid: 'Remote',
    description: {
      about: 'Design enterprise-scale cloud solutions for Fortune 500 clients.',
      responsibilities: [
        'Architect cloud infrastructure solutions',
        'Lead technical discussions with clients',
        'Create detailed technical documentation'
      ],
      requirements: [
        '6+ years cloud architecture experience',
        'AWS or Azure certifications',
        'Strong communication skills'
      ],
      benefits: [
        'Remote work flexibility',
        'Professional certifications',
        'Performance bonuses'
      ]
    }
  },
  {
    id: 9,
    title: 'Machine Learning Engineer',
    company: 'Meta',
    location: 'Richardson, TX',
    type: 'Full-time',
    salary: '$150k - $200k',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'ML'],
    posted: '1 day ago',
    badge: 'hot',
    match: 87,
    logo: '🤖',
    hybrid: 'Hybrid',
    description: {
      about: 'Build ML models that impact billions of users worldwide.',
      responsibilities: [
        'Develop and deploy ML models',
        'Optimize model performance',
        'Collaborate with research teams'
      ],
      requirements: [
        '4+ years ML experience',
        'Strong Python and ML frameworks',
        'PhD or Masters preferred'
      ],
      benefits: [
        'Top-tier compensation',
        'Cutting-edge projects',
        'Learning budget'
      ]
    }
  },
  {
    id: 10,
    title: 'QA Automation Engineer',
    company: 'Toyota',
    location: 'Plano, TX',
    type: 'Full-time',
    salary: '$95k - $125k',
    tags: ['Selenium', 'Python', 'Testing', 'CI/CD'],
    posted: '6 days ago',
    badge: null,
    match: 72,
    logo: '🚗',
    hybrid: 'On-site',
    description: {
      about: 'Ensure quality in automotive software systems.',
      responsibilities: [
        'Design and implement automated tests',
        'Maintain test frameworks',
        'Report and track defects'
      ],
      requirements: [
        '3+ years QA automation experience',
        'Selenium or similar tools',
        'Programming skills in Python'
      ],
      benefits: [
        'Employee vehicle discount',
        'Retirement matching',
        'Healthcare coverage'
      ]
    }
  },
  {
    id: 11,
    title: 'Cybersecurity Analyst',
    company: 'Raytheon',
    location: 'Arlington, TX',
    type: 'Full-time',
    salary: '$105k - $140k',
    tags: ['Security', 'Penetration Testing', 'Network Security'],
    posted: '2 days ago',
    badge: null,
    match: 68,
    logo: '🔒',
    hybrid: 'On-site',
    description: {
      about: 'Protect critical infrastructure from cyber threats.',
      responsibilities: [
        'Monitor security systems',
        'Conduct security assessments',
        'Respond to security incidents'
      ],
      requirements: [
        '3+ years cybersecurity experience',
        'Security certifications (CISSP, CEH)',
        'Knowledge of security frameworks'
      ],
      benefits: [
        'Security clearance sponsorship',
        'Continuing education',
        'Competitive benefits'
      ]
    }
  },
  {
    id: 12,
    title: 'Product Manager - Tech',
    company: 'Southwest Airlines',
    location: 'Dallas, TX',
    type: 'Full-time',
    salary: '$120k - $155k',
    tags: ['Product Management', 'Agile', 'Analytics'],
    posted: '4 days ago',
    badge: null,
    match: 70,
    logo: '✈️',
    hybrid: 'Hybrid',
    description: {
      about: 'Lead product strategy for customer-facing applications.',
      responsibilities: [
        'Define product roadmap',
        'Work with engineering and design',
        'Analyze user data and metrics'
      ],
      requirements: [
        '4+ years product management',
        'Technical background preferred',
        'Strong analytical skills'
      ],
      benefits: [
        'Free flights',
        'Flexible schedule',
        'Career growth'
      ]
    }
  },
  {
    id: 13,
    title: 'Backend Developer (Java)',
    company: 'Fidelity Investments',
    location: 'Frisco, TX',
    type: 'Full-time',
    salary: '$115k - $145k',
    tags: ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
    posted: '1 week ago',
    badge: null,
    match: 79,
    logo: '💰',
    hybrid: 'Hybrid',
    description: {
      about: 'Build secure and scalable financial services platforms.',
      responsibilities: [
        'Develop backend services in Java',
        'Design APIs and integrations',
        'Ensure system reliability'
      ],
      requirements: [
        '4+ years Java development',
        'Spring Boot experience',
        'Financial services knowledge a plus'
      ],
      benefits: [
        'Retirement benefits',
        'Health insurance',
        'Bonus potential'
      ]
    }
  },
  {
    id: 14,
    title: 'UI/UX Designer',
    company: 'Sabre',
    location: 'Southlake, TX',
    type: 'Full-time',
    salary: '$90k - $115k',
    tags: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    posted: '5 days ago',
    badge: null,
    match: 65,
    logo: '🎨',
    hybrid: 'Hybrid',
    description: {
      about: 'Design intuitive travel booking experiences.',
      responsibilities: [
        'Create wireframes and prototypes',
        'Conduct user research',
        'Collaborate with developers'
      ],
      requirements: [
        '3+ years UI/UX design',
        'Portfolio of design work',
        'Figma or Sketch proficiency'
      ],
      benefits: [
        'Creative environment',
        'Travel perks',
        'Professional development'
      ]
    }
  },
  {
    id: 15,
    title: 'Site Reliability Engineer',
    company: 'NTT DATA',
    location: 'Carrollton, TX',
    type: 'Full-time',
    salary: '$125k - $160k',
    tags: ['SRE', 'Monitoring', 'Linux', 'Automation'],
    posted: '3 days ago',
    badge: null,
    match: 76,
    logo: '⚙️',
    hybrid: 'Remote',
    description: {
      about: 'Ensure reliability and performance of critical systems.',
      responsibilities: [
        'Monitor system health',
        'Implement automation solutions',
        'Respond to incidents'
      ],
      requirements: [
        '4+ years SRE or DevOps experience',
        'Strong Linux knowledge',
        'Scripting skills (Python, Bash)'
      ],
      benefits: [
        'Remote work',
        'On-call compensation',
        'Training opportunities'
      ]
    }
  },
  {
    id: 16,
    title: 'Blockchain Developer',
    company: 'Chainlink Labs',
    location: 'Addison, TX',
    type: 'Full-time',
    salary: '$135k - $175k',
    tags: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3'],
    posted: '2 days ago',
    badge: 'hot',
    match: 73,
    logo: '⛓️',
    hybrid: 'Remote',
    description: {
      about: 'Build decentralized applications on blockchain.',
      responsibilities: [
        'Develop smart contracts',
        'Audit blockchain code',
        'Integrate with Web3 APIs'
      ],
      requirements: [
        '2+ years blockchain development',
        'Solidity programming',
        'Understanding of crypto protocols'
      ],
      benefits: [
        'Crypto compensation options',
        'Fully remote',
        'Innovative projects'
      ]
    }
  },
  {
    id: 17,
    title: 'Full Stack Engineer (React/Node)',
    company: 'Uber',
    location: 'McKinney, TX',
    type: 'Full-time',
    salary: '$130k - $170k',
    tags: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    posted: '1 day ago',
    badge: 'new',
    match: 91,
    logo: '🚗',
    hybrid: 'Hybrid',
    description: {
      about: 'Build features used by millions of riders and drivers.',
      responsibilities: [
        'Develop full-stack features',
        'Optimize application performance',
        'Participate in on-call rotation'
      ],
      requirements: [
        '3+ years full-stack development',
        'React and Node.js expertise',
        'GraphQL experience'
      ],
      benefits: [
        'Uber credits',
        'Stock options',
        'Health benefits'
      ]
    }
  },
  {
    id: 18,
    title: 'Platform Engineer',
    company: 'VMware',
    location: 'Lewisville, TX',
    type: 'Full-time',
    salary: '$120k - $155k',
    tags: ['Kubernetes', 'Platform Engineering', 'Go', 'Containers'],
    posted: '4 days ago',
    badge: null,
    match: 77,
    logo: '🖥️',
    hybrid: 'Hybrid',
    description: {
      about: 'Build infrastructure platforms for cloud-native applications.',
      responsibilities: [
        'Design platform services',
        'Support engineering teams',
        'Improve developer experience'
      ],
      requirements: [
        '4+ years platform engineering',
        'Kubernetes expertise',
        'Programming in Go or Python'
      ],
      benefits: [
        'Remote flexibility',
        'Learning resources',
        'Collaborative culture'
      ]
    }
  },
  {
    id: 19,
    title: 'Systems Administrator',
    company: 'Dell Technologies',
    location: 'Garland, TX',
    type: 'Full-time',
    salary: '$75k - $95k',
    tags: ['Linux', 'Windows Server', 'Networking', 'Scripting'],
    posted: '1 week ago',
    badge: null,
    match: 66,
    logo: '🖥️',
    hybrid: 'On-site',
    description: {
      about: 'Maintain enterprise IT infrastructure.',
      responsibilities: [
        'Manage servers and networks',
        'Troubleshoot system issues',
        'Implement security patches'
      ],
      requirements: [
        '3+ years system administration',
        'Linux and Windows experience',
        'Networking knowledge'
      ],
      benefits: [
        'Employee discounts',
        'Career advancement',
        'Training programs'
      ]
    }
  },
  {
    id: 20,
    title: 'Frontend Developer (Vue.js)',
    company: 'Zscaler',
    location: 'Allen, TX',
    type: 'Full-time',
    salary: '$105k - $135k',
    tags: ['Vue.js', 'JavaScript', 'TypeScript', 'Tailwind'],
    posted: '6 days ago',
    badge: null,
    match: 84,
    logo: '🌐',
    hybrid: 'Remote',
    description: {
      about: 'Build security dashboards and monitoring tools.',
      responsibilities: [
        'Develop Vue.js applications',
        'Create responsive UIs',
        'Integrate with backend APIs'
      ],
      requirements: [
        '3+ years frontend development',
        'Strong Vue.js skills',
        'TypeScript experience'
      ],
      benefits: [
        'Fully remote',
        'Flexible hours',
        'Stock options'
      ]
    }
  }
]

export const MARKET_STATS: MarketStat[] = [
  { label: 'Active Jobs', value: '1,247', highlight: false },
  { label: 'New This Week', value: '127', highlight: true },
  { label: 'Companies Hiring', value: '86', highlight: false },
  { label: 'Avg Salary', value: '$125k', highlight: false }
]

export const TRENDING_SKILLS: SkillTrend[] = [
  { name: 'React', type: 'hot' },
  { name: 'Python', type: 'hot' },
  { name: 'TypeScript', type: 'rising' },
  { name: 'AWS', type: 'hot' },
  { name: 'Docker', type: 'rising' },
  { name: 'Kubernetes', type: 'rising' },
  { name: 'Node.js', type: 'normal' },
  { name: 'SQL', type: 'normal' }
]

export const TOP_LOCATIONS: LocationStat[] = [
  { city: 'Dallas', count: 547, pct: 44 },
  { city: 'Plano', count: 312, pct: 25 },
  { city: 'Fort Worth', count: 201, pct: 16 },
  { city: 'Arlington', count: 124, pct: 10 },
  { city: 'Irving', count: 63, pct: 5 }
]

export const TOP_COMPANIES: CompanyStat[] = [
  { name: 'Microsoft', openRoles: 45 },
  { name: 'Amazon', openRoles: 38 },
  { name: 'Capital One', openRoles: 32 },
  { name: 'AT&T', openRoles: 28 },
  { name: 'American Airlines', openRoles: 24 }
]

export const RESUME_SKILLS: ResumeSkill[] = [
  { name: 'React', score: 95, color: '#61dafb' },
  { name: 'TypeScript', score: 90, color: '#3178c6' },
  { name: 'Python', score: 85, color: '#3776ab' },
  { name: 'Node.js', score: 80, color: '#339933' },
  { name: 'SQL', score: 75, color: '#00758f' }
]

export const RESUME_INSIGHTS: ResumeInsight[] = [
  { type: 'pos', text: 'Strong full-stack experience with React and Node.js' },
  { type: 'pos', text: 'Good cloud infrastructure knowledge' },
  { type: 'tip', text: 'Consider adding Docker and Kubernetes certifications' },
  { type: 'neg', text: 'Limited mobile development experience' }
]

export const INTERVIEW_QUESTIONS: string[] = [
  'Tell me about yourself and your background.',
  'Why are you interested in this position?',
  'Describe a challenging project you worked on.',
  'How do you handle tight deadlines?',
  'Where do you see yourself in 5 years?'
]

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Jobs', value: 'all' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'onsite' },
  { label: '$100k+', value: '100k' },
  { label: '$130k+', value: '130k' },
  { label: 'Posted Today', value: 'today' },
  { label: 'Engineering', value: 'engineering' },
]
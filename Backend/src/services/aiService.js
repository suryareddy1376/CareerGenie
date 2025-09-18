/**
 * Enhanced AI Service for CareerGenie
 * Advanced AI-powered resume parsing and career guidance
 * Uses Google Cloud Free Tier compatible services with intelligent text processing
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const natural = require('natural');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class AIService {
  constructor() {
    // Use Google Gemini API for AI processing (Free tier available)
    this.genAI = process.env.GEMINI_API_KEY ? 
      new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
    
    // Initialize NLP tools
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Career-related keywords and skills database
    this.skillsDatabase = this.initializeSkillsDatabase();
    this.careerPaths = this.initializeCareerPaths();
  }

  initializeSkillsDatabase() {
    return {
      technical: {
        'Software Development': [
          'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
          'git', 'docker', 'kubernetes', 'aws', 'azure', 'typescript', 'angular',
          'vue.js', 'spring boot', 'django', 'flask', 'express.js', 'rest api',
          'graphql', 'microservices', 'agile', 'scrum', 'ci/cd', 'jenkins',
          'terraform', 'ansible', 'redis', 'elasticsearch', 'kafka'
        ],
        'Data Science': [
          'python', 'r', 'sql', 'machine learning', 'deep learning', 'pandas',
          'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'jupyter',
          'matplotlib', 'seaborn', 'statistics', 'data visualization',
          'big data', 'hadoop', 'spark', 'tableau', 'power bi', 'excel'
        ],
        'Cybersecurity': [
          'network security', 'penetration testing', 'vulnerability assessment',
          'firewall', 'ids/ips', 'siem', 'incident response', 'cryptography',
          'ethical hacking', 'risk assessment', 'compliance', 'iso 27001',
          'cissp', 'ceh', 'wireshark', 'nmap', 'metasploit', 'burp suite'
        ],
        'Marketing': [
          'digital marketing', 'seo', 'sem', 'social media marketing',
          'content marketing', 'email marketing', 'google analytics',
          'google ads', 'facebook ads', 'marketing automation',
          'brand management', 'market research', 'copywriting',
          'conversion optimization', 'a/b testing', 'crm'
        ]
      },
      soft: [
        'leadership', 'communication', 'teamwork', 'problem solving',
        'project management', 'time management', 'critical thinking',
        'adaptability', 'creativity', 'negotiation', 'presentation',
        'conflict resolution', 'mentoring', 'strategic thinking'
      ]
    };
  }

  initializeCareerPaths() {
    return {
      'Software Developer': {
        levels: ['Junior Developer', 'Mid-level Developer', 'Senior Developer', 'Lead Developer', 'Engineering Manager'],
        requiredSkills: ['programming', 'debugging', 'testing', 'version control'],
        averageSalary: { junior: 65000, mid: 85000, senior: 120000, lead: 150000 },
        growthRate: 0.22
      },
      'Data Scientist': {
        levels: ['Data Analyst', 'Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Data Science Manager'],
        requiredSkills: ['statistics', 'machine learning', 'python', 'sql', 'data visualization'],
        averageSalary: { junior: 75000, mid: 110000, senior: 140000, lead: 170000 },
        growthRate: 0.35
      },
      'Product Manager': {
        levels: ['Associate PM', 'Product Manager', 'Senior PM', 'Principal PM', 'VP of Product'],
        requiredSkills: ['strategic thinking', 'user research', 'data analysis', 'communication', 'roadmap planning'],
        averageSalary: { junior: 80000, mid: 120000, senior: 160000, lead: 200000 },
        growthRate: 0.28
      }
    };
  }

  async parseResumeContent(fileBuffer, fileName) {
    try {
      let text = '';
      
      // Extract text based on file type
      if (fileName.endsWith('.pdf')) {
        const pdfData = await pdf(fileBuffer);
        text = pdfData.text;
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        const docData = await mammoth.extractRawText({ buffer: fileBuffer });
        text = docData.value;
      } else {
        text = fileBuffer.toString('utf-8');
      }

      // Parse resume sections and extract structured data
      const parsedResume = await this.extractResumeData(text);
      
      return parsedResume;
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume content');
    }
  }

  async extractResumeData(text) {
    const sections = this.identifySections(text);
    
    const resumeData = {
      personalInfo: this.extractPersonalInfo(sections.header || ''),
      summary: this.extractSummary(sections.summary || sections.objective || ''),
      experience: this.extractExperience(sections.experience || sections.work || ''),
      education: this.extractEducation(sections.education || ''),
      skills: this.extractSkills(sections.skills || text),
      achievements: this.extractAchievements(text),
      certifications: this.extractCertifications(text),
      rawText: text,
      parsedAt: new Date().toISOString()
    };

    return resumeData;
  }

  identifySections(text) {
    const sections = {};
    const lines = text.split('\n').map(line => line.trim());
    
    const sectionHeaders = {
      header: /^(.*?)(?=(?:summary|objective|experience|work|education|skills))/i,
      summary: /(summary|profile|about|overview)/i,
      objective: /(objective|goal)/i,
      experience: /(experience|work|employment|career)/i,
      work: /(work experience|professional experience|employment history)/i,
      education: /(education|academic|qualification)/i,
      skills: /(skills|technical|competencies|expertise)/i,
      achievements: /(achievements|accomplishments|awards)/i,
      certifications: /(certifications|certificates|licenses)/i
    };

    let currentSection = 'header';
    let sectionContent = [];

    for (const line of lines) {
      let newSection = null;
      
      // Check if line matches any section header
      for (const [section, regex] of Object.entries(sectionHeaders)) {
        if (regex.test(line) && line.length < 50) {
          newSection = section;
          break;
        }
      }

      if (newSection && newSection !== currentSection) {
        // Save previous section content
        if (sectionContent.length > 0) {
          sections[currentSection] = sectionContent.join('\n');
        }
        
        // Start new section
        currentSection = newSection;
        sectionContent = [line];
      } else {
        sectionContent.push(line);
      }
    }

    // Save last section
    if (sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n');
    }

    return sections;
  }

  extractPersonalInfo(headerText) {
    const info = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    };

    // Extract email
    const emailMatch = headerText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) info.email = emailMatch[0];

    // Extract phone
    const phoneMatch = headerText.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) info.phone = phoneMatch[0];

    // Extract LinkedIn
    const linkedinMatch = headerText.match(/linkedin\.com\/in\/([^\s\n]+)/i);
    if (linkedinMatch) info.linkedin = linkedinMatch[0];

    // Extract GitHub
    const githubMatch = headerText.match(/github\.com\/([^\s\n]+)/i);
    if (githubMatch) info.github = githubMatch[0];

    // Extract name (first meaningful line that's not contact info)
    const lines = headerText.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.trim() && 
          !line.includes('@') && 
          !line.includes('linkedin') && 
          !line.includes('github') &&
          !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) {
        info.name = line.trim();
        break;
      }
    }

    return info;
  }

  extractSummary(summaryText) {
    // Return cleaned summary text
    return summaryText.replace(/summary|profile|about|overview/i, '').trim();
  }

  extractExperience(experienceText) {
    const experiences = [];
    const sections = experienceText.split(/(?=\n[A-Z][^,\n]*(?:,|\s+\||$))/);

    for (const section of sections) {
      if (section.trim().length < 10) continue;

      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;

      const experience = {
        title: '',
        company: '',
        duration: '',
        description: '',
        responsibilities: []
      };

      // First line usually contains title and company
      const firstLine = lines[0].trim();
      const titleCompanyMatch = firstLine.match(/^(.+?)\s*(?:at|@|\||,)\s*(.+?)(?:\s*\|\s*(.+))?$/);
      
      if (titleCompanyMatch) {
        experience.title = titleCompanyMatch[1].trim();
        experience.company = titleCompanyMatch[2].trim();
        experience.duration = titleCompanyMatch[3] ? titleCompanyMatch[3].trim() : '';
      } else {
        experience.title = firstLine;
      }

      // Look for duration in subsequent lines if not found
      if (!experience.duration) {
        for (let i = 1; i < lines.length; i++) {
          const dateMatch = lines[i].match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
          if (dateMatch) {
            experience.duration = lines[i].trim();
            break;
          }
        }
      }

      // Extract bullet points and description
      const bulletPoints = lines.filter(line => 
        line.startsWith('•') || 
        line.startsWith('-') || 
        line.startsWith('*') ||
        /^\d+\./.test(line)
      );

      if (bulletPoints.length > 0) {
        experience.responsibilities = bulletPoints.map(bullet => 
          bullet.replace(/^[•\-*]\s*|\d+\.\s*/g, '').trim()
        );
      }

      // Join remaining text as description
      const descriptionLines = lines.filter(line => 
        !titleCompanyMatch || line !== lines[0]
      ).filter(line => 
        !bulletPoints.includes(line) && 
        !experience.duration || !line.includes(experience.duration)
      );

      experience.description = descriptionLines.join(' ').trim();

      if (experience.title || experience.company) {
        experiences.push(experience);
      }
    }

    return experiences;
  }

  extractEducation(educationText) {
    const education = [];
    const sections = educationText.split(/\n(?=[A-Z])/);

    for (const section of sections) {
      if (section.trim().length < 5) continue;

      const lines = section.split('\n').filter(line => line.trim());
      const edu = {
        degree: '',
        institution: '',
        year: '',
        gpa: '',
        details: ''
      };

      // Extract degree and institution
      const firstLine = lines[0].trim();
      const degreeMatch = firstLine.match(/^(.+?)\s*(?:from|at|\||,)\s*(.+?)(?:\s*\|\s*(.+))?$/);
      
      if (degreeMatch) {
        edu.degree = degreeMatch[1].trim();
        edu.institution = degreeMatch[2].trim();
        edu.year = degreeMatch[3] ? degreeMatch[3].trim() : '';
      } else {
        edu.degree = firstLine;
      }

      // Look for GPA
      const gpaMatch = section.match(/gpa[:\s]*(\d+\.?\d*)/i);
      if (gpaMatch) edu.gpa = gpaMatch[1];

      // Look for year if not found
      if (!edu.year) {
        const yearMatch = section.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) edu.year = yearMatch[0];
      }

      education.push(edu);
    }

    return education;
  }

  extractSkills(skillsText) {
    const extractedSkills = {
      technical: [],
      soft: [],
      languages: [],
      frameworks: [],
      tools: []
    };

    // Tokenize and clean the text
    const tokens = this.tokenizer.tokenize(skillsText.toLowerCase());
    const cleanedTokens = tokens.filter(token => token.length > 2);

    // Match against skills database
    for (const category in this.skillsDatabase.technical) {
      for (const skill of this.skillsDatabase.technical[category]) {
        if (skillsText.toLowerCase().includes(skill.toLowerCase())) {
          if (!extractedSkills.technical.includes(skill)) {
            extractedSkills.technical.push(skill);
          }
        }
      }
    }

    // Match soft skills
    for (const skill of this.skillsDatabase.soft) {
      if (skillsText.toLowerCase().includes(skill.toLowerCase())) {
        if (!extractedSkills.soft.includes(skill)) {
          extractedSkills.soft.push(skill);
        }
      }
    }

    // Extract programming languages
    const programmingLanguages = [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
      'swift', 'kotlin', 'typescript', 'scala', 'perl', 'r', 'matlab'
    ];

    for (const lang of programmingLanguages) {
      if (skillsText.toLowerCase().includes(lang)) {
        if (!extractedSkills.languages.includes(lang)) {
          extractedSkills.languages.push(lang);
        }
      }
    }

    return extractedSkills;
  }

  extractAchievements(text) {
    const achievements = [];
    const lines = text.split('\n');
    
    // Look for lines with achievement indicators
    const achievementIndicators = [
      'achieved', 'increased', 'decreased', 'improved', 'reduced', 'saved',
      'generated', 'led', 'managed', 'created', 'developed', 'implemented',
      'award', 'recognition', 'certified', 'published'
    ];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (achievementIndicators.some(indicator => lowerLine.includes(indicator))) {
        // Look for numbers/percentages that might indicate impact
        if (/\d+%|\$\d+|\d+,\d+|\d+\s*(million|thousand|k|m)/i.test(line)) {
          achievements.push(line.trim());
        }
      }
    }

    return achievements;
  }

  extractCertifications(text) {
    const certifications = [];
    const certKeywords = [
      'certified', 'certification', 'certificate', 'license', 'credential',
      'aws', 'microsoft', 'google', 'cisco', 'oracle', 'salesforce',
      'pmp', 'scrum master', 'agile', 'itil', 'cissp', 'ceh', 'comptia'
    ];

    const lines = text.split('\n');
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (certKeywords.some(keyword => lowerLine.includes(keyword))) {
        certifications.push(line.trim());
      }
    }

    return certifications;
  }

  async analyzeSkillGaps(userProfile, targetRole) {
    try {
      const targetSkills = this.getRequiredSkillsForRole(targetRole);
      const userSkills = userProfile.skills || {};
      
      const gaps = {
        missing: [],
        weak: [],
        strong: [],
        recommendations: []
      };

      // Identify missing skills
      for (const skill of targetSkills.required) {
        const hasSkill = this.hasSkill(userSkills, skill);
        if (!hasSkill) {
          gaps.missing.push(skill);
        }
      }

      // Generate learning recommendations
      gaps.recommendations = await this.generateLearningRecommendations(gaps.missing, targetRole);

      return gaps;
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Failed to analyze skill gaps');
    }
  }

  getRequiredSkillsForRole(role) {
    // Simplified role requirements - in production, this would be more comprehensive
    const roleSkills = {
      'Software Developer': {
        required: ['programming', 'debugging', 'version control', 'testing'],
        preferred: ['agile', 'ci/cd', 'cloud platforms', 'database design']
      },
      'Data Scientist': {
        required: ['python', 'statistics', 'machine learning', 'sql'],
        preferred: ['deep learning', 'big data', 'data visualization', 'cloud platforms']
      },
      'Product Manager': {
        required: ['strategic thinking', 'user research', 'data analysis', 'communication'],
        preferred: ['agile', 'design thinking', 'market research', 'roadmap planning']
      }
    };

    return roleSkills[role] || { required: [], preferred: [] };
  }

  hasSkill(userSkills, targetSkill) {
    const allSkills = [
      ...(userSkills.technical || []),
      ...(userSkills.soft || []),
      ...(userSkills.languages || []),
      ...(userSkills.frameworks || []),
      ...(userSkills.tools || [])
    ];

    return allSkills.some(skill => 
      skill.toLowerCase().includes(targetSkill.toLowerCase()) ||
      targetSkill.toLowerCase().includes(skill.toLowerCase())
    );
  }

  async generateLearningRecommendations(missingSkills, targetRole) {
    const recommendations = [];

    for (const skill of missingSkills) {
      const recommendation = {
        skill,
        priority: this.getSkillPriority(skill, targetRole),
        resources: this.getSkillLearningResources(skill),
        estimatedTime: this.getSkillLearningTime(skill)
      };
      recommendations.push(recommendation);
    }

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  getSkillPriority(skill, targetRole) {
    // Simple priority scoring - in production, this would be more sophisticated
    const priorities = {
      'Software Developer': {
        'programming': 10,
        'debugging': 9,
        'version control': 9,
        'testing': 8,
        'agile': 7,
        'ci/cd': 6
      },
      'Data Scientist': {
        'python': 10,
        'statistics': 10,
        'machine learning': 9,
        'sql': 9,
        'data visualization': 8
      }
    };

    return priorities[targetRole]?.[skill] || 5;
  }

  getSkillLearningResources(skill) {
    const resources = {
      'programming': [
        { name: 'freeCodeCamp', type: 'course', url: 'https://freecodecamp.org' },
        { name: 'Codecademy', type: 'platform', url: 'https://codecademy.com' }
      ],
      'python': [
        { name: 'Python.org Tutorial', type: 'documentation', url: 'https://docs.python.org/3/tutorial/' },
        { name: 'Automate the Boring Stuff', type: 'book', url: 'https://automatetheboringstuff.com' }
      ],
      'machine learning': [
        { name: 'Coursera ML Course', type: 'course', url: 'https://coursera.org/learn/machine-learning' },
        { name: 'Kaggle Learn', type: 'platform', url: 'https://kaggle.com/learn' }
      ]
    };

    return resources[skill] || [
      { name: 'Google Search', type: 'search', url: `https://google.com/search?q=${skill}+tutorial` },
      { name: 'YouTube', type: 'video', url: `https://youtube.com/search?q=${skill}+course` }
    ];
  }

  getSkillLearningTime(skill) {
    // Estimated learning times in weeks
    const learningTimes = {
      'programming': 12,
      'python': 8,
      'javascript': 8,
      'machine learning': 16,
      'data visualization': 6,
      'sql': 4,
      'git': 2,
      'agile': 4
    };

    return learningTimes[skill] || 8;
  }

  async generateCareerRoadmap(userProfile, targetRole, timeframe = 12) {
    try {
      const currentSkills = userProfile.skills || {};
      const targetSkills = this.getRequiredSkillsForRole(targetRole);
      const skillGaps = await this.analyzeSkillGaps(userProfile, targetRole);

      const roadmap = {
        targetRole,
        currentLevel: this.assessCurrentLevel(userProfile, targetRole),
        targetLevel: 'Entry Level', // Can be customized based on experience
        timeframe: `${timeframe} months`,
        phases: [],
        milestones: [],
        totalEstimatedHours: 0
      };

      // Generate learning phases
      roadmap.phases = this.generateLearningPhases(skillGaps, timeframe);
      
      // Generate milestones
      roadmap.milestones = this.generateMilestones(roadmap.phases);

      // Calculate total time investment
      roadmap.totalEstimatedHours = roadmap.phases.reduce(
        (total, phase) => total + phase.estimatedHours, 0
      );

      return roadmap;
    } catch (error) {
      console.error('Error generating career roadmap:', error);
      throw new Error('Failed to generate career roadmap');
    }
  }

  assessCurrentLevel(userProfile, targetRole) {
    const experience = userProfile.experience || [];
    const skills = userProfile.skills || {};
    
    const relevantExperience = experience.filter(exp => 
      this.isRelevantExperience(exp, targetRole)
    );

    const totalYears = relevantExperience.length; // Simplified calculation
    
    if (totalYears === 0) return 'Entry Level';
    if (totalYears < 3) return 'Junior';
    if (totalYears < 7) return 'Mid-level';
    return 'Senior';
  }

  isRelevantExperience(experience, targetRole) {
    const roleKeywords = {
      'Software Developer': ['developer', 'programmer', 'software', 'engineer'],
      'Data Scientist': ['data', 'analyst', 'scientist', 'research'],
      'Product Manager': ['product', 'manager', 'strategy', 'planning']
    };

    const keywords = roleKeywords[targetRole] || [];
    const title = experience.title?.toLowerCase() || '';
    const description = experience.description?.toLowerCase() || '';

    return keywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
  }

  generateLearningPhases(skillGaps, timeframe) {
    const phases = [];
    const monthsPerPhase = Math.max(2, Math.floor(timeframe / 3));

    // Phase 1: Foundation Skills
    const foundationSkills = skillGaps.missing.filter(skill => 
      this.getSkillPriority(skill, 'general') >= 8
    ).slice(0, 3);

    if (foundationSkills.length > 0) {
      phases.push({
        name: 'Foundation Phase',
        duration: `${monthsPerPhase} months`,
        skills: foundationSkills,
        goals: foundationSkills.map(skill => `Master ${skill} fundamentals`),
        estimatedHours: foundationSkills.length * 40,
        resources: foundationSkills.map(skill => this.getSkillLearningResources(skill)[0])
      });
    }

    // Phase 2: Intermediate Skills
    const intermediateSkills = skillGaps.missing.slice(3, 6);
    if (intermediateSkills.length > 0) {
      phases.push({
        name: 'Development Phase',
        duration: `${monthsPerPhase} months`,
        skills: intermediateSkills,
        goals: intermediateSkills.map(skill => `Develop proficiency in ${skill}`),
        estimatedHours: intermediateSkills.length * 50,
        resources: intermediateSkills.map(skill => this.getSkillLearningResources(skill)[0])
      });
    }

    // Phase 3: Advanced Skills & Projects
    const remainingSkills = skillGaps.missing.slice(6);
    if (remainingSkills.length > 0) {
      phases.push({
        name: 'Mastery Phase',
        duration: `${timeframe - (phases.length * monthsPerPhase)} months`,
        skills: remainingSkills,
        goals: [
          'Build portfolio projects',
          'Gain practical experience',
          ...remainingSkills.map(skill => `Advanced ${skill} skills`)
        ],
        estimatedHours: remainingSkills.length * 60 + 100, // Extra time for projects
        resources: [
          { name: 'GitHub', type: 'platform', url: 'https://github.com' },
          { name: 'Portfolio Projects', type: 'practice', url: '#' }
        ]
      });
    }

    return phases;
  }

  generateMilestones(phases) {
    const milestones = [];
    let month = 0;

    for (const phase of phases) {
      const phaseDuration = parseInt(phase.duration.split(' ')[0]);
      month += Math.floor(phaseDuration / 2);
      
      milestones.push({
        month,
        title: `${phase.name} Checkpoint`,
        description: `Complete ${phase.skills.slice(0, 2).join(' and ')} learning`,
        type: 'learning'
      });

      month += Math.ceil(phaseDuration / 2);
      
      milestones.push({
        month,
        title: `${phase.name} Complete`,
        description: `Ready for next phase - all ${phase.name.toLowerCase()} skills acquired`,
        type: 'completion'
      });
    }

    return milestones;
  }

  async generateResumeFromProfile(userProfile, template = 'professional') {
    try {
      const resumeData = {
        template,
        sections: {
          header: this.generateHeaderSection(userProfile.personalInfo),
          summary: this.generateSummarySection(userProfile),
          experience: this.generateExperienceSection(userProfile.experience),
          education: this.generateEducationSection(userProfile.education),
          skills: this.generateSkillsSection(userProfile.skills),
          achievements: this.generateAchievementsSection(userProfile.achievements)
        },
        formatting: this.getTemplateFormatting(template),
        generatedAt: new Date().toISOString()
      };

      return resumeData;
    } catch (error) {
      console.error('Error generating resume:', error);
      throw new Error('Failed to generate resume');
    }
  }

  generateHeaderSection(personalInfo) {
    return {
      name: personalInfo.name || 'Your Name',
      title: personalInfo.title || 'Professional Title',
      contact: {
        email: personalInfo.email,
        phone: personalInfo.phone,
        location: personalInfo.location,
        linkedin: personalInfo.linkedin,
        github: personalInfo.github
      }
    };
  }

  generateSummarySection(userProfile) {
    const experience = userProfile.experience || [];
    const skills = userProfile.skills || {};
    const totalYears = experience.length;

    const topSkills = [
      ...(skills.technical || []).slice(0, 3),
      ...(skills.languages || []).slice(0, 2)
    ].join(', ');

    return `Experienced professional with ${totalYears}+ years in the industry. ` +
           `Skilled in ${topSkills}. Proven track record of delivering high-quality ` +
           `solutions and driving business results.`;
  }

  generateExperienceSection(experiences) {
    return experiences.map(exp => ({
      title: exp.title,
      company: exp.company,
      duration: exp.duration,
      description: exp.description,
      achievements: exp.responsibilities || []
    }));
  }

  generateEducationSection(education) {
    return education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      gpa: edu.gpa,
      details: edu.details
    }));
  }

  generateSkillsSection(skills) {
    return {
      technical: skills.technical || [],
      languages: skills.languages || [],
      frameworks: skills.frameworks || [],
      tools: skills.tools || [],
      soft: skills.soft || []
    };
  }

  generateAchievementsSection(achievements) {
    return achievements || [];
  }

  getTemplateFormatting(template) {
    const templates = {
      professional: {
        font: 'Arial',
        fontSize: 11,
        margins: { top: 1, bottom: 1, left: 1, right: 1 },
        colors: { primary: '#000000', secondary: '#666666', accent: '#2563eb' },
        spacing: { section: 16, item: 8 }
      },
      modern: {
        font: 'Helvetica',
        fontSize: 10,
        margins: { top: 0.8, bottom: 0.8, left: 0.8, right: 0.8 },
        colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' },
        spacing: { section: 20, item: 10 }
      },
      minimal: {
        font: 'Times New Roman',
        fontSize: 12,
        margins: { top: 1.2, bottom: 1.2, left: 1.2, right: 1.2 },
        colors: { primary: '#000000', secondary: '#555555', accent: '#000000' },
        spacing: { section: 12, item: 6 }
      }
    };

    return templates[template] || templates.professional;
  }

  async chatWithAI(message, context = {}) {
    try {
      console.log('💬 Processing AI chat message...');
      
      // Simple rule-based responses for free tier
      const responses = this.getAIChatResponses();
      const lowerMessage = message.toLowerCase();
      
      let response = responses.default;
      
      // Match message to appropriate response
      for (const [keywords, responseText] of Object.entries(responses)) {
        if (keywords !== 'default' && keywords.split('|').some(keyword => lowerMessage.includes(keyword))) {
          response = responseText;
          break;
        }
      }

      // Personalize response with context
      if (context.userProfile) {
        response = this.personalizeResponse(response, context.userProfile);
      }

      console.log('✅ AI chat response generated');
      return {
        message: response,
        timestamp: new Date().toISOString(),
        context: context
      };
    } catch (error) {
      console.error('❌ AI chat error:', error);
      throw error;
    }
  }

  getAIChatResponses() {
    return {
      'skills|skill|learn': 'Based on current industry trends, I recommend focusing on in-demand skills like cloud computing, data analysis, and AI/ML. What specific area interests you most?',
      'career|job|role': 'Career growth depends on continuous learning and networking. Consider exploring roles that align with your strengths and market demand. Would you like me to analyze potential career paths for you?',
      'resume|cv': 'A strong resume should highlight your achievements with quantifiable results, relevant skills, and clear career progression. Would you like me to help you optimize your resume?',
      'interview|prepare': 'Interview preparation involves researching the company, practicing common questions, and preparing specific examples that demonstrate your skills. Focus on the STAR method for behavioral questions.',
      'salary|compensation': 'Salary negotiations should be based on market research, your experience level, and the value you bring. Research industry standards and be prepared to justify your expectations.',
      'networking|connections': 'Professional networking is crucial for career growth. Engage on LinkedIn, attend industry events, and maintain relationships with colleagues and mentors.',
      default: 'I\'m here to help with your career development! You can ask me about skills, career paths, resume optimization, interview preparation, or any other career-related questions.'
    };
  }

  personalizeResponse(response, userProfile) {
    if (userProfile.skills?.technical?.length > 0) {
      response += ` Given your background in ${userProfile.skills.technical.slice(0, 2).join(' and ')}, I can provide more targeted advice.`;
    }
    
    if (userProfile.experience?.length > 0) {
      const recentJob = userProfile.experience[0];
      response += ` With your experience as a ${recentJob.title}, you have a solid foundation to build upon.`;
    }

    return response;
  }

  // Legacy methods for backward compatibility
  static async extractResumeData(resumeText) {
    const service = new AIService();
    return await service.extractResumeData(resumeText);
  }

  static parseResumeText(text) {
    const service = new AIService();
    return service.extractResumeData(text);
  }

  static async analyzeSkillGaps(currentSkills, targetRole) {
    const service = new AIService();
    return await service.analyzeSkillGaps({ skills: currentSkills }, targetRole);
  }

  static async generateCareerRoadmap(userProfile, targetRole, timeframe) {
    const service = new AIService();
    return await service.generateCareerRoadmap(userProfile, targetRole, timeframe);
  }

  static async generateResume(profileData, template) {
    const service = new AIService();
    return await service.generateResumeFromProfile(profileData, template);
  }

  static async chatWithAI(message, context) {
    const service = new AIService();
    return await service.chatWithAI(message, context);
  }
}

module.exports = new AIService();

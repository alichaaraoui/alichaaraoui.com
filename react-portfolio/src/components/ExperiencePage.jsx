import { useState } from 'react';
import { motion } from 'framer-motion';
import GridLines from './GridLines';
import Typewriter from './Typewriter';

const ExperiencePage = ({ darkMode }) => {
  const [selectedExperience, setSelectedExperience] = useState(0);
  const [titleComplete, setTitleComplete] = useState(false);

  const experiences = [
    {
      company: 'LITTLE',
      role: 'Software Engineer Intern',
      period: 'Mar. 2024 – Present',
      location: 'Charlotte, NC',
      description: 'Developed permit research database and CRUD applications. Built program management tools for 300+ users.',
      responsibilities: [
        'Developed permit research database and CRUD applications using React and Node.js',
        'Built program management tools for 300+ users across multiple departments',
        'Collaborated with architects and designers to create efficient digital workflows',
        'Implemented PostgreSQL database solutions for complex data management'
      ],
      tags: ['React', 'Node.js', 'PostgreSQL']
    },
    {
      company: 'OMVRA STUDIOS',
      role: 'Software Developer',
      period: 'Jul. 2025 – Present',
      location: 'Charlotte, NC',
      description: 'Created custom websites using React, TypeScript, and Shopify for various clients.',
      responsibilities: [
        'Created custom websites using React, TypeScript, and Shopify for various clients',
        'Developed responsive web applications with modern UI/UX design principles',
        'Collaborated with creative directors to bring design concepts to life',
        'Optimized website performance and SEO for better client results'
      ],
      tags: ['React', 'TypeScript', 'Shopify']
    },
    {
      company: 'SUBLIME MEDISPA',
      role: 'Creative Director & Software Developer',
      period: 'Jan. 2022 – Aug. 2023',
      location: 'Ottawa, ON',
      description: 'Led branding and marketing strategy. Developed custom Shopify website.',
      responsibilities: [
        'Led comprehensive branding and marketing strategy development',
        'Developed custom Shopify website with integrated booking system',
        'Created digital marketing campaigns and social media content',
        'Managed client relationships and business development initiatives'
      ],
      tags: ['Shopify', 'Branding', 'Marketing']
    },
    {
      company: 'UNC CHARLOTTE',
      role: 'Peer Mentor',
      period: 'Aug. 2024 – Dec. 2024',
      location: 'Charlotte, NC',
      description: 'Mentored freshmen in computer science coursework and university life.',
      responsibilities: [
        'Mentored freshmen in computer science coursework and university life',
        'Conducted study groups and provided academic support for programming courses',
        'Helped students develop effective study strategies and time management skills',
        'Created educational resources and programming tutorials'
      ],
      tags: ['Mentoring', 'Teaching']
    },
    {
      company: 'AIAS',
      role: 'Events Director',
      period: 'Sept. 2023 – May 2024',
      location: 'Charlotte, NC',
      description: 'Organized events and workshops for architecture students.',
      responsibilities: [
        'Organized professional development events and workshops for architecture students',
        'Coordinated with industry professionals for guest lectures and networking events',
        'Managed event budgets and logistics for student organization activities',
        'Developed leadership and event planning skills through hands-on experience'
      ],
      tags: ['Leadership', 'Events']
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="experience-page">
      <GridLines darkMode={darkMode} />
      
      <motion.div 
        className="exp-page-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section className="exp-hero" variants={itemVariants}>
          <h1 className="exp-page-title">
            <Typewriter 
              text="EXPERIENCE" 
              delay={300}
              speed={50}
              onComplete={() => setTitleComplete(true)}
            />
          </h1>
        </motion.section>

        {/* Spotlight Experience Layout */}
        <div className="spotlight-container">
          {/* Left Column - Company List */}
          <motion.div className="company-list" variants={itemVariants}>
            <div className="company-list-line"></div>
            {titleComplete && experiences.map((exp, index) => (
              <div
                key={index}
                className={`company-item ${selectedExperience === index ? 'active' : ''}`}
                onClick={() => setSelectedExperience(index)}
              >
                <div className="company-indicator"></div>
                <span className="company-name">
                  <Typewriter 
                    text={exp.company} 
                    delay={index * 100}
                    speed={10}
                    showCursor={false}
                  />
                </span>
              </div>
            ))}
          </motion.div>

          {/* Right Column - Experience Details */}
          <motion.div className="experience-details" variants={itemVariants}>
            <motion.div
              key={selectedExperience}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="experience-title">
                {experiences[selectedExperience].role}
              </h2>
              
              <div className="experience-meta">
                <span className="experience-period">{experiences[selectedExperience].period}</span>
                <span className="experience-location">{experiences[selectedExperience].location}</span>
              </div>

              <div className="experience-responsibilities">
                {experiences[selectedExperience].responsibilities.map((responsibility, index) => (
                  <div key={index} className="responsibility-item">
                    <div className="bullet-point"></div>
                    <p className="responsibility-text">
                      <Typewriter 
                        text={responsibility} 
                        delay={index * 50}
                        speed={5}
                        showCursor={false}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperiencePage;
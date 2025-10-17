import { motion } from 'framer-motion';
import EducationSkillsAwards from './EducationSkillsAwards';

const WorkExperience = ({ darkMode }) => {
  const experiences = [
    {
      company: 'LITTLE DIVERSIFIED ARCHITECTURE',
      role: 'Software Engineer Intern',
      period: 'Mar. 2024 – Present',
      location: 'Charlotte, NC',
      description: 'Developed permit research database and CRUD applications. Built program management tools for 300+ users.',
    },
    {
      company: 'OMVRA STUDIOS',
      role: 'Software Developer',
      period: 'Jul. 2025 – Present',
      location: 'Charlotte, NC',
      description: 'Created custom websites using React, TypeScript, and Shopify for various clients.',
    },
    {
      company: 'SUBLIME MEDISPA',
      role: 'Creative Director & Software Developer',
      period: 'Jan. 2022 – Aug. 2023',
      location: 'Ottawa, ON',
      description: 'Led branding and marketing strategy. Developed custom Shopify website.',
    },
    {
      company: 'UNC CHARLOTTE',
      role: 'Peer Mentor',
      period: 'Aug. 2024 – Dec. 2024',
      location: 'Charlotte, NC',
      description: 'Mentored freshmen in computer science coursework and university life.',
    },
    {
      company: 'AIAS',
      role: 'Events Director',
      period: 'Sept. 2023 – May 2024',
      location: 'Charlotte, NC',
      description: 'Organized events and workshops for architecture students.',
    },
  ];

  return (
    <section className="work-experience-section">
      <motion.div 
        className="work-experience-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="experience-list">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="experience-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="experience-col-1">
                <h3 className="experience-company">{exp.company}</h3>
                <p className="experience-role">{exp.role}</p>
                <div className="experience-meta">
                  <span className="experience-period">{exp.period}</span>
                  <span className="experience-location">{exp.location}</span>
                </div>
              </div>
              <div className="experience-col-2">
                <p className="experience-description">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <EducationSkillsAwards darkMode={darkMode} />
      </motion.div>
    </section>
  );
};

export default WorkExperience;


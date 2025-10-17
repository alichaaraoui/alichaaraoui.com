import { motion } from 'framer-motion';

const EducationSkillsAwards = ({ darkMode }) => {
  const education = [
    {
      school: 'UNC CHARLOTTE',
      degree: 'Bachelor of Science in Computer Science',
      period: '2022 - 2026',
      location: 'Charlotte, NC',
    },
    {
      school: 'UNC CHARLOTTE',
      degree: 'Bachelor of Architecture',
      period: '2022 - 2027',
      location: 'Charlotte, NC',
    },
  ];

  const skills = {
    software: ['React', 'TypeScript', 'Node.js', 'Python', 'Swift', 'Unity', 'C#', 'PostgreSQL', 'MongoDB', 'Firebase'],
    architecture: ['Rhino', 'Grasshopper', 'AutoCAD', 'Revit', 'SketchUp', 'V-Ray', 'Enscape', 'Blender', 'Adobe Suite'],
    design: ['Figma', 'Photoshop', 'Illustrator', 'InDesign', 'UI/UX Design', 'Branding'],
  };

  const awards = [
    'Dean\'s List - UNC Charlotte',
    'Architecture Design Excellence Award',
    'Hackathon Winner - 2024',
  ];

  return (
    <div className="education-skills-awards">
      {/* Education */}
      <motion.div
        className="education-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="section-title">EDUCATION</h2>
        <div className="education-list">
          {education.map((edu, index) => (
            <div key={index} className="education-item">
              <h3 className="education-school">{edu.school}</h3>
              <p className="education-degree">{edu.degree}</p>
              <p className="education-period">{edu.period}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        className="skills-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <h2 className="section-title">SKILLS</h2>
        <div className="skills-categories">
          <div className="skill-category">
            <h4>SOFTWARE</h4>
            <div className="skill-tags">
              {skills.software.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
          <div className="skill-category">
            <h4>ARCHITECTURE</h4>
            <div className="skill-tags">
              {skills.architecture.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
          <div className="skill-category">
            <h4>DESIGN</h4>
            <div className="skill-tags">
              {skills.design.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Awards */}
      <motion.div
        className="awards-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="section-title">AWARDS</h2>
        <ul className="awards-list">
          {awards.map((award, index) => (
            <li key={index} className="award-item">{award}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default EducationSkillsAwards;


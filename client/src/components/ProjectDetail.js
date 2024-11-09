import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Linkedin, Mail, Github, Globe, Code } from 'lucide-react';
import axios from 'axios';
import NotFound from './NotFound';

const ProjectDetail = ({ token }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://project-viewer-tv5f.onrender.com/projects/${id}`);
        setProject(response.data);
        setError(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !project) {
    return <NotFound />;
  }

  const projectLinks = [
    { 
      title: "GitHub Repository", 
      link: project.github_link, 
      type: "github" 
    },
    { 
      title: "Live Demo", 
      link: project.live_link, 
      type: "live" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-16 text-center">
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
            <Code className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
          <p className="text-white/90 mb-6">
            {project.description || "Thank you for taking the time to check out my project!"}
          </p>

            
     

        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-12">
          <a 
            href="https://www.linkedin.com/in/neelansh-bansiwal-91b586237/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-white/80 transition-colors"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-8 h-8" />
          </a>
          <a 
            href="mailto:ether1926@gmail.com" 
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Email Contact"
          >
            <Mail className="w-8 h-8" />
          </a>
          <a 
            href="https://github.com/nerdyEther" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-white/80 transition-colors"
            aria-label="GitHub Profile"
          >
            <Github className="w-8 h-8" />
          </a>
        </div>

        {/* Project Links Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">PROJECT LINKS</h2>
          {projectLinks.map((item, index) => (
            item.link && (
              <a 
                key={index} 
                href={item.link}
                className="block transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-4 p-4 bg-[#fdfbec] shadow-lg rounded-full">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {item.type === 'github' ? (
                      <Github className="h-8 w-8" />
                    ) : (
                      <Globe className="h-8 w-8" />
                    )}
                  </div>
                  <span className="flex-grow text-left font-medium">{item.title}</span>
                </div>
              </a>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
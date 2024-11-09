import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectDetail = ({ token }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      const response = await axios.get(`http://localhost:3333/projects/${id}`);
      setProject(response.data);
    };
    fetchProject();
  }, [id]);

  const deleteProject = async () => {
    await axios.delete(`http://localhost:3333/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate('/');
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <h1>{project.name}</h1>
      
      <a href={project.github_link}>GitHub Link</a>
      
      <a href={project.live_link}> Live Link</a>
     
    </div>
  );
};

export default ProjectDetail;

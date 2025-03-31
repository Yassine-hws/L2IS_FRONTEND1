import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, FileCode, Award, Users, ChevronRight, Calendar, X } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

function Statistics() {
  const [statistics, setStatistics] = useState({
    revues: 0,
    ouvrages: 0,
    projets: 0,
    rapports: 0,
    brevets: 0,
    conferences: 0,
    seminaires: 0,
    members: 0,
  });
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, membersRes, projectsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/statistics', {
            params: { start_date: dateRange[0], end_date: dateRange[1] },
          }),
          axios.get('http://localhost:8000/api/members', {
            params: { start_date: dateRange[0], end_date: dateRange[1] },
          }),
          axios.get('http://localhost:8000/api/projects')
        ]);

        setStatistics(statsRes.data);
        setMembers(membersRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleResetDate = () => {
    setDateRange([null, null]);
    setIsDatePickerOpen(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
        <div className="mb-8">
  <h1 className="text-4xl font-extrabold text-blue-600">
    Dashboard
  </h1>
  <p className="mt-2 text-lg text-gray-600">
    Aperçu des activités et des publications
  </p>
</div>
          <div className="relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Filtrer par date</span>
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 z-10 bg-white rounded-lg shadow-xl p-4">
                <DatePicker
                  selected={dateRange[0]}
                  onChange={(dates) => {
                    setDateRange(dates);
                    if (dates[1]) setIsDatePickerOpen(false);
                  }}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  selectsRange
                  inline
                  className="border rounded-md"
                />
                <button
                  onClick={handleResetDate}
                  className="mt-2 w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Ouvrages" value={statistics.ouvrages} icon={BookOpen} color="bg-blue-500" />
          <StatCard title="Revues" value={statistics.revues} icon={FileText} color="bg-green-500" />
          <StatCard title="Rapports" value={statistics.rapports} icon={FileCode} color="bg-purple-500" />
          <StatCard title="Brevets" value={statistics.brevets} icon={Award} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Projets Récents</h2>
              <Link 
                to="/dashboard/ProjectsAdmin"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Titre</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Équipe</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Date de début</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Date de fin</th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-600">Financement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm text-gray-900">{project.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.team}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(project.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(project.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.funding_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Members</h2>
              </div>
              <Link 
                to="/dashboard/Member"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                 <img
  src={member.image ? `http://localhost:8000/storage/${member.image}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
  alt={member.name}
  className="w-12 h-12 rounded-full object-cover"
/>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.position}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Membres</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.members}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
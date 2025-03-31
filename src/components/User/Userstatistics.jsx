import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, FileCode, Award, Calendar, X } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

function Userstatistics() {
  const [statistics, setStatistics] = useState({
    revues: 0,
    ouvrages: 0,
    rapports: 0,
    brevets: 0,
  });
  const [dateRange, setDateRange] = useState([null, null]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:8000/api/statistics', {
          params: { start_date: dateRange[0], end_date: dateRange[1] },
        });
        setStatistics({
          revues: statsRes.data.revues,
          ouvrages: statsRes.data.ouvrages,
          rapports: statsRes.data.rapports,
          brevets: statsRes.data.brevets,
        });
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
          <div>
            <h1 className="text-4xl font-extrabold text-blue-600">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">Aperçu des activités et des publications</p>
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
      </div>
    </div>
  );
}

export default Userstatistics;

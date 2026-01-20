import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUtilisateurs: 0,
    medecinsActifs: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [medRes, assRes, patRes] = await Promise.all([
        fetch('http://localhost:3000/api/medecins'),
        fetch('http://localhost:3000/api/assistants'),
        fetch('http://localhost:3000/api/patients')
      ]);

      const medecins = await medRes.json();
      const assistants = await assRes.json();
      const patients = await patRes.json();

      const totalUtilisateurs = 
        (Array.isArray(medecins) ? medecins.length : 0) +
        (Array.isArray(assistants) ? assistants.length : 0) +
        (Array.isArray(patients) ? patients.length : 0);

      const medecinsActifs = Array.isArray(medecins) ? medecins.length : 0;

      setStats({ totalUtilisateurs, medecinsActifs });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-page-title">Tableau de bord</h1>

      <div className="admin-stats-grid">
        {/* Stat 1 */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">TOTAL UTILISATEURS</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#9CA3AF" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#9CA3AF" strokeWidth="2"/>
            </svg>
          </div>
          <div className="admin-stat-value">{stats.totalUtilisateurs}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-trend positive">+12% ce mois</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">MÉDECINS ACTIFS</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2"/>
              <path d="M12 14v8M8 16h8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="admin-stat-value">{stats.medecinsActifs}</div>
          <div className="admin-stat-footer">
            <span className="admin-stat-trend positive">100% en ligne</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import './PredictionsIA.css';

const PredictionsIA = () => {
  return (
    <div className="predictions-ia">
      <div className="page-header">
        <div>
          <h1>
            Prédictions IA
            <span className="beta-badge">BETA</span>
          </h1>
          <p className="subtitle">Module d'aide à la décision clinique</p>
        </div>
      </div>

      <div className="ia-modules">
        <div className="ia-card">
          <div className="ia-card-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Brain size={32} color="#3b82f6" />
          </div>
          <h3>Analyse de cas</h3>
          <p>Soumettez un cas clinique pour obtenir des suggestions diagnostiques</p>
          <button className="btn-ia-action">
            Analyser un cas
          </button>
        </div>

        <div className="ia-card">
          <div className="ia-card-icon" style={{ backgroundColor: '#dcfce7' }}>
            <TrendingUp size={32} color="#10b981" />
          </div>
          <h3>Tendances de santé</h3>
          <p>Analyses statistiques sur votre patientèle</p>
          <button className="btn-ia-action">
            Voir les tendances
          </button>
        </div>
      </div>

      <div className="disclaimer">
        <AlertTriangle size={20} />
        <div>
          <strong>Note importante :</strong> Cet outil est une aide à la décision, pas un substitut au jugement clinique. Le médecin reste seul responsable de ses décisions.
        </div>
      </div>
    </div>
  );
};

export default PredictionsIA;
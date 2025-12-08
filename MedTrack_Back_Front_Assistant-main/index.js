// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const medecinRoutes = require('./routes/medecin.routes');
const rendezvousRoutes = require('./routes/rendezvous.routes');
const patientRoutes = require('./routes/patient.routes');
const assistantRoutes = require('./routes/assistant.routes');
const adminRoutes = require('./routes/admin.routes');
const dossierRoutes = require('./routes/dossier.routes');
const consultationRoutes = require('./routes/consultation.routes');
const predictionRoutes = require('./routes/prediction.routes');


/////
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
/////

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
  },
  apis: ["./routes/*.js", "./index.js"], 
};

const swaggerSpec = swaggerJSDoc(options);

/////
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
/////
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medecins', medecinRoutes);
app.use('/api/rendezvous', rendezvousRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/predictions', predictionRoutes);


// Sync DB
sequelize.sync({ alter: true })
  .then(() => {
    console.log('DB sync OK');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error('DB sync error', err));

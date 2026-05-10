const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String },
  location: { type: String },
  salary: { type: String },
  salary_min: { type: Number },
  salary_max: { type: Number },
  jobType: { type: String },
  postedDate: { type: String },
  deadline: { type: String },
  description: { type: String },
  requirements: { type: String },
  vacancy: { type: String },
  experience: { type: String },
  remoteJob: { type: Boolean, default: false },
  source: { type: String, required: true },
  jobUrl: { type: String, required: true },
  hash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);

const dashboardService = require("../services/dashboardService");

const getDashboardMetrics = async (req, res) => {
  try {
    const metrics = await dashboardService.getDashboardMetrics();
    return res.status(200).json(metrics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDashboardTrends = async (req, res) => {
  try {
    const trends = await dashboardService.getDashboardTrends();
    return res.status(200).json(trends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPopularDestinations = async (req, res) => {
  try {
    const destinations = await dashboardService.getPopularDestinations();
    return res.status(200).json(destinations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getDashboardTrends,
  getPopularDestinations,
};

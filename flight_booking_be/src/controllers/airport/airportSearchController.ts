// import * as airportSearchService from "../../services/ariport/airportAPIService";

const getAllAirports = async (req, res) => {
  try {
    // const airports = await airportSearchService.getAllAirports();
    // console.log(airports);
    // return res.json(airports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getAllAirportsTest = async () => {
//   try {
//     const airports = await airportSearchService.getAllAirports();
//     console.log(typeof airports);
//   } catch (error) {
//     console.error({ message: error.message });
//   }
// };

// getAllAirportsTest();

export { getAllAirports };

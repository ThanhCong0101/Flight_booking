import * as express from "express";

const router = express.Router();

import * as flightSearchController from "../../controllers/flight/flightSearchController";

router.get("/auto-complete", flightSearchController.AutoComplete);

router.get("/detail", flightSearchController.searchDetail);

router.get("/incomplete", flightSearchController.searchIncomplete);

router.get("/one-way", flightSearchController.searchOneWay);

router.get("/round-trip", flightSearchController.searchRoundTrip);

router.get("/airport", flightSearchController.searchAirport);

router.get("/price-oneway", flightSearchController.searchCalenderPriceOneWay);

router.get("/price-return", flightSearchController.searchCalenderPriceRoundTrip,);


module.exports = router;

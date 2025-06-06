import { LayoverInfo, FlightSegmentInfo } from '../models/cardDetail.model';
import { calculateDuration, convertToUserTimezone } from './time';

export const createFlightSegment = (segments: any, logourl: any) => {
  const layoverInfo: LayoverInfo[] = [];
  let flightSegmentInfo: FlightSegmentInfo[];

  flightSegmentInfo = segments.map(
    (segment: any, index: number, array: any[]) => {
      const departureTime = convertToUserTimezone(segment.departure);
      const arrivalTime = convertToUserTimezone(segment.arrival);
      const duration = segment.durationMinutes;
      const flightLogoBrand = logourl;
      const flightLogoBrandName = segment.marketingCarrier.name;
      const departureAirport =
        segment.origin.airport.name +
        ' (' +
        segment.origin.airport.displayCode +
        ')';
      const arrivalAirport =
        segment.destination.airport.name +
        ' (' +
        segment.destination.airport.displayCode +
        ')';

      if (index < array.length - 1) {
        const nextSegment = array[index + 1];
        const layoverDuration = calculateDuration(
          nextSegment.departure,
          segment.arrival
        );
        layoverInfo.push({
          duration: layoverDuration,
          layoverAirport: arrivalAirport,
        });
      }

      return {
        departureTime,
        departureAirport,
        arrivalTime,
        arrivalAirport,
        duration,
        flightLogoBrand,
        flightLogoBrandName,
      };
    }
  );

  return {
    flightSegmentInfo,
    layoverInfo,
  };
};

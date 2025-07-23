import { LayoverInfo, FlightSegmentInfo } from '../models/cardDetail.model';
import { calculateDuration, convertToUserTimezone } from './time';

export const createFlightSegment = (segments: any, logourl: any) => {
  const layoverInfo: LayoverInfo[] = [];
  let flightSegmentInfo: FlightSegmentInfo[];

  flightSegmentInfo = segments.map(
    (segment: any, index: number, array: any[]) => {
      const departureTime = convertToUserTimezone(segment.departure);
      const arrivalTime = convertToUserTimezone(segment.arrival);
      const duration = segment.duration;
      const flightLogoBrand = logourl;
      const flightLogoBrandName = segment.marketingCarrier.name;
      const departureAirport =
        segment.origin.name +
        ' (' +
        segment.origin.displayCode +
        ')';
      const arrivalAirport =
        segment.destination.name +
        ' (' +
        segment.destination.displayCode +
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

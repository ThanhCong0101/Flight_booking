export interface FlightSegmentInfo {
  departureTime: string;
  departureAirport: string;
  arrivalTime: string;
  arrivalAirport: string;
  duration: string;
  flightLogoBrand: string;
  flightLogoBrandName: string;
}

export interface LayoverInfo {
  duration: string;
  layoverAirport: string;
}

export interface LegInfo {
  isDetailSegmentAmenities: boolean[];
  flightSegmentInfo: FlightSegmentInfo[];
  layoverInfo: LayoverInfo[];
  fullDurationSegment: string;
  headerDate: string;
}

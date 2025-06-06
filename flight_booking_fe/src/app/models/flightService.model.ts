export interface OneWaySearchParams {
  departureEntityId: string;
  arrivalEntityId: string;
  departDate: string;
  classType?: string;
  travellerType?: string;
}

export interface RoundTripSearchParams {
  departureEntityId: string;
  arrivalEntityId: string;
  departDate: string;
  returnDate: string;
  classType?: string;
  travellerType?: string;
}

export interface Airlines {
  id: number;
  logoUrl: string;
  name: string;
  isActive: boolean;
}

export interface Duration {
  duration: {
    min: number;
    max: number;
    multiCityMin: number;
    multiCityMax: number;
  };
}

export interface Stop {
  direct: {
    isPresent: boolean;
    formattedPrice?: string;
    isActive: boolean;
  };
  one: {
    isPresent: boolean;
    formattedPrice?: string;
    isActive: boolean;
  };
  twoOrMore: {
    isPresent: boolean;
    formattedPrice?: string;
    isActive: boolean;
  };
}
export interface Airport {
  id: string;
  entityId: string;
  name: string;
  isActive: boolean;
}

export interface Location {
  city: string;
  airports: Airport[];
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface TimeRange {
  minTimeDeparture: string;
  maxTimeDeparture: string;
  minTimeLanding: string;
  maxTimeLanding: string;
}

export interface FilterStats {
  duration: Duration;
  airports: Location[];
  carriers: Airlines[];
  stopPrices: Stop;
  timeRange: TimeRange;
  priceRange: PriceRange;
}

import { sanitizeUserBasicInfo } from "./userUtils"

export const sanitizedPassengerInfo = (passenger) => {
    const user = sanitizeUserBasicInfo(passenger.user);
    
}
export const sanitizeUser = (user) => {
  const { password, refresh_token, access_token_password, ...safeUser } = user;
  return safeUser;
};

export const sanitizeUserBasicInfo = (user) => {
  const {
    password,
    refresh_token,
    access_token_password,
    passport_number,
    passport_expiry,
    nationality,
    street_address,
    city,
    country,
    postal_code,
    profile_picture,
    role,
    ...safeUser
  } = user;
  return safeUser;
};

export const sanitizeUserMongoDB = (user) => {
  const {
    password,
    refresh_token,
    access_token_password,
    passport_number,
    passport_expiry,
    nationality,
    street_address,
    city,
    country,
    postal_code,
    profile_picture,
    ...mongoData
  } = user;
  return mongoData;  
}


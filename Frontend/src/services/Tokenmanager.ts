import Cookies from "universal-cookie";

const cookies = new Cookies();

const ACCESS_TOKEN_NAME = "accessToken";
const REFRESH_TOKEN_NAME = "refreshToken";

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  // Set access token cookie
  cookies.set(ACCESS_TOKEN_NAME, accessToken, {
    // expires: fifteenMinutesFromNow,
    path: "/",
    sameSite: "strict",
    // secure: true,
    // httpOnly: true
  });

  // Set refresh token cookie
  cookies.set(REFRESH_TOKEN_NAME, refreshToken, {
    // expires: thirtyDaysFromNow,
    path: "/",
    sameSite: "strict",
    // secure: true,
    // httpOnly: true
  });
};

export const getAccessToken = (): string | undefined => {
  return cookies.get(ACCESS_TOKEN_NAME);
};

export const getRefreshToken = (): string | undefined => {
  return cookies.get(REFRESH_TOKEN_NAME);
};

export const clearTokens = (): void => {
  // Clear access token cookie
  cookies.remove(ACCESS_TOKEN_NAME, { path: "/" });
  // Clear refresh token cookie
  cookies.remove(REFRESH_TOKEN_NAME, { path: "/" });
  // Clear all cookies
  cookies.remove("*", { path: "/" });
};

export const clearAccessTokens = (): void => {
  // Clear access token cookie
  cookies.remove(ACCESS_TOKEN_NAME, { path: "/" });
};

export const clearRefreshTokens = (): void => {
  // Clear refresh token cookie
  cookies.remove(REFRESH_TOKEN_NAME, { path: "/" });
};

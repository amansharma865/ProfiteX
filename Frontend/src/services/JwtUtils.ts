"use client";
import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./Tokenmanager";


// method to get and save the new accessToken Along with the exisiting refreshToken
export const getNewAccessToken = async (): Promise<string | undefined> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const { data } = await axios.post<{
      accessToken: string;
      refreshToken: string;
    }>(`${process.env.BACKENDURL}/refresh `, {
      refreshToken: refreshToken.toString(),
    });
    saveTokens(data.accessToken, refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    clearTokens();
    return undefined;
  }
};

// method to decode jwt token
export const getDecodedTokenData = (): any => {
  try {
    const token = getAccessToken();
    const payloadBase64 = token!.split(".")[1];
    return JSON.parse(atob(payloadBase64));
  } catch (error) {
    return null;
  }
};

//  method to check if the token is expired or not
export const isTokenExpired = (): boolean => {
  try {
    const token = getAccessToken();

    if (!token) return true;
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const { exp } = decodedPayload;
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
};

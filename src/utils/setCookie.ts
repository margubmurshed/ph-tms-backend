import { Response } from "express";

interface AuthTokens{
    accessToken?: string;
    refreshToken?: string;
}
export const setAuthCookie = (res: Response, authTokens: AuthTokens) => {
    if(authTokens.accessToken){
        res.cookie("accessToken", authTokens.accessToken, {
            httpOnly: true,
            secure: false
        })
    }
    if(authTokens.refreshToken){
        res.cookie("refreshToken", authTokens.refreshToken, {
            httpOnly: true,
            secure: false
        })
    }
}
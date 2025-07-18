/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVariables } from "./env";
import { User } from "../modules/user/user.model";
import { Providers, Role } from "../modules/user/user.interface";

passport.use(
    new GoogleStategy({
        clientID: envVariables.GOOGLE_CLIENT_ID,
        clientSecret: envVariables.GOOGLE_CLIENT_SECRET,
        callbackURL: envVariables.GOOGLE_CALLBACK_URL
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            const email = profile.emails?.[0].value;
            if(!email){
                return done(null, false, {message: "No email found!"})
            }
            let user = await User.findOne({email});

            if(!user){
                user = await User.create({
                    name: profile.displayName,
                    email,
                    picture: profile.photos?.[0].value,
                    role: Role.USER,
                    isVerified: true,
                    auths: [{
                        provider: Providers.GOOGLE,
                        providerId: profile.id
                    }]
                })
            }

            return done(null, user)
        } catch (error) {
            console.log("Google strategy error", error)
            return done(error)
        }
    })
)

// save user ID to session
passport.serializeUser((user: any, done: (err:any, id:any) =>void) => {
    done(null, user._id);
})
passport.deserializeUser(async(id: any, done: (err:any, id:any) =>void) => {
    const user = await User.findById(id);
    done(null, user);
})



// frontend => google auth => backend localhost:5000/auth/google => passport => google oauth consent => gmail login => success => callback url backend => db store user if not exist => token
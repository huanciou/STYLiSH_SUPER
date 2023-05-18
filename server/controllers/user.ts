import { Request, Response } from "express";
import { z } from "zod";
import axios from "axios";
import * as userModel from "../models/user.js";
import * as userProviderModel from "../models/userProvider.js";
import signJWT, { EXPIRE_TIME } from "../utils/signJWT.js";

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  secure: true,
  sameSite: "strict",
} as const;

export async function signUp(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const userId = await userModel.createUser(email, name);
    await userProviderModel.createNativeProvider(userId, password);
    const token = await signJWT(userId);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            id: userId,
            provider: userProviderModel.PROVIDER.NATIVE,
            name,
            email,
            picture: "",
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "sign up failed" });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUser(email);
    if (!user) {
      throw new Error("user not exist");
    }
    const isValidPassword = await userProviderModel.checkNativeProviderToken(
      user.id,
      password
    );
    if (!isValidPassword) {
      throw new Error("invalid password");
    }
    const token = await signJWT(user.id);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            ...user,
            provider: userProviderModel.PROVIDER.NATIVE,
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "sign in failed" });
  }
}

async function isFbTokenValid(userToken: string) {
  const response = await axios.get(`
    https://graph.facebook.com/debug_token?
    input_token=${userToken}
    &access_token=${FB_APP_ID}|${FB_APP_SECRET}
  `);
  return response?.data?.data?.is_valid ?? false;
}

const ProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  picture: z.object({
    data: z.object({
      url: z.string(),
    }),
  }),
});

async function getFbProfileData(userToken: string) {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/me?fields=id,name,email,picture&access_token=${userToken}`
  );
  const profile = ProfileSchema.parse(response.data);
  return profile;
}

export async function fbLogin(req: Request, res: Response) {
  try {
    const { access_token: userToken } = req.body;
    if (!(await isFbTokenValid(userToken))) {
      throw new Error("invalid access_token");
    }
    const profile = await getFbProfileData(userToken);

    const user = await userModel.findUser(profile.email);

    if (!user) {
      const userId = await userModel.createUser(profile.email, profile.name);
      await userProviderModel.createFbProvider(userId, profile.id);
      const token = await signJWT(userId);
      res
        .cookie("jwtToken", token, COOKIE_OPTIONS)
        .status(200)
        .json({
          data: {
            access_token: token,
            access_expired: EXPIRE_TIME,
            user: {
              id: userId,
              name: profile.name,
              email: profile.email,
              picture: "",
              provider: userProviderModel.PROVIDER.FACEBOOK,
            },
          },
        });
      return;
    }
    const provider = await userProviderModel.findFbProvider(user.id);
    if (!provider) {
      await userProviderModel.createFbProvider(user.id, profile.id);
    }
    if (provider.token !== profile.id) {
      throw new Error("user id and provider token not match");
    }
    const token = await signJWT(user.id);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            ...user,
            provider: userProviderModel.PROVIDER.FACEBOOK,
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "fb login failed" });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = res.locals.userId;
    const user = await userModel.findUserById(userId);
    res.status(200).json({ data: user });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "get profile failed" });
  }
}

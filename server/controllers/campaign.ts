import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as cache from "../utils/cache.js";
import * as campaignModel from "../models/campaign.js";
import { isProductExist } from "../models/product.js";

const CACHE_KEY = cache.getCampaignKey();

export async function getCampaigns(req: Request, res: Response) {
  try {
    const cachedCampaigns = await cache.get(CACHE_KEY);
    if (cachedCampaigns) {
      const campaigns = z
        .array(campaignModel.CampaignSchema)
        .parse(JSON.parse(cachedCampaigns));
      res.status(200).json({
        data: campaigns,
      });
      return;
    }
    const campaigns = await campaignModel.getCampaigns();
    await cache.set(CACHE_KEY, JSON.stringify(campaigns));
    res.status(200).json({
      data: campaigns,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "get campaigns failed" });
  }
}

export async function checkProductExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { productId } = req.body;
  if (await isProductExist(productId)) {
    next();
    return;
  }
  res.status(400).json({ errors: "product not existed" });
  return;
}

export async function createCampaign(req: Request, res: Response) {
  try {
    const { productId, story } = req.body;
    if (!req.file?.filename) throw new Error("no picture");
    const { filename } = req.file;
    const campaignId = await campaignModel.createCampaign(
      productId,
      story,
      `/uploads/${filename}`
    );
    await cache.del(CACHE_KEY);
    res.status(200).json({ data: campaignId });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "create campaigns failed" });
  }
}

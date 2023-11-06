import { NextFunction, Request, Response } from "express";
import { searchProductsIdsFromElastic } from "../models/elasticsearch.js";

export async function searchProductsId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // try {
  const paging = Number(req.query.paging) || 0;
  const keyword =
    typeof req.query.keyword === "string" ? req.query.keyword : "";
  const color = typeof req.query.color === "string" ? req.query.color : "";
  const size = typeof req.query.size === "string" ? req.query.size : "";
  const category =
    typeof req.query.category === "string" ? req.query.category : "";
  const sorting =
    typeof req.query.sorting === "string" ? req.query.sorting : "popular";

  console.log(color, size, category, sorting);

  const productsIds = await searchProductsIdsFromElastic(
    paging,
    keyword,
    color,
    size,
    category,
    sorting
  );

  // If there're 7 ids, meaning there's next page
  // The ids are sorted already
  console.log("#####################");
  console.log("productsIds = " + productsIds);
  console.log("#####################");

  req.body.productIds = productsIds;

  console.log("#####################");
  console.log("req.body.productIds = " + req.body.productIds);
  console.log("#####################");

  next();
}

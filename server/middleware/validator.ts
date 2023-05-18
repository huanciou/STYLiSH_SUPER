import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

export function handleResult(req: Request, res: Response, next: NextFunction) {
  const errorFormatter = ({ location, msg, param }: ValidationError) => {
    return `${location}[${param}]: ${msg}`;
  };
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  next();
}

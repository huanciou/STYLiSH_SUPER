import { Request, Response, NextFunction } from "express";
import { isUserHasRole } from "../models/role.js"

const authorization =
  (roleName: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.userId;
      if (await isUserHasRole(userId, roleName)) {
        next();
        return;
      }
      res.status(403).json({ errors: "authorization failed" });
    } catch (err) {
      if (err instanceof Error) {
        res.status(403).json({ errors: err.message });
        return;
      }
      res.status(403).json({ errors: "authorization failed" });
    }
  };

export default authorization;

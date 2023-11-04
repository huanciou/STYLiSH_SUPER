import { validationResult } from "express-validator";
export function handleResult(req, res, next) {
    const errorFormatter = ({ location, msg, param }) => {
        return `${location}[${param}]: ${msg}`;
    };
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    next();
}

import verifyJWT from "../utils/verifyJWT.js";
async function whoRU(req, res, next) {
    try {
        console.log(222);
        const tokenInHeaders = req.get("Authorization");
        const token = tokenInHeaders?.replace("Bearer ", "");
        if (!token) {
            next();
        }
        else {
            const decoded = await verifyJWT(token);
            res.locals.userId = decoded.userId;
            next();
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(401).json({ errors: err.message });
            return;
        }
        res.status(401).json({ errors: "authenticate failed" });
        next();
    }
}
export default whoRU;

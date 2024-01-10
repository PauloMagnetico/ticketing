import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string
};

// here we augment the request type
declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.session?.jwt) {
        return next();
    }

    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload
        // we need to change the definition of Request for typescript
        req.currentUser = payload;
    } catch (err) { }
    next();
};
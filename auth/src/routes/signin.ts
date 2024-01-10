import express, { Request, Response, json } from 'express';
import { body } from 'express-validator';
import  jwt  from 'jsonwebtoken';

import { Password } from '../services/password';
import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-requests';
import { BadRequestError } from '../errors/bad-request-error';


const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('you must provide password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('invalid credentials');
        }
        const passwordsMatch = await Password.compare(existingUser.password, password);
        if (!passwordsMatch) {
            throw new BadRequestError('invalid credentials');
        }
        
        // generate JWT
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email
            },
            // the ! is to make typescript happy, we checked that JWT is not undefined when starting the app (index.ts)
            process.env.JWT_KEY!); //

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    });

export { router as signInRouter };
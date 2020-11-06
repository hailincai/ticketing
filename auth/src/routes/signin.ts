import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@hctickets/common';
import { User } from '../models/user';
import { BadRequestError } from '@hctickets/common';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

let router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Must provide a valid email address'),
    body('password').trim().notEmpty().withMessage('Must provide the password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid Credential');
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError('Invalid Credential');
    }

    const retJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: retJwt,
    };

    return res.status(200).send(existingUser);
  }
);

export { router as signinRouter };

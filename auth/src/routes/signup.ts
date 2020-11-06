import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { BadRequestError } from '@hctickets/common';
import { validateRequest } from '@hctickets/common';

let router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Email need to be a valid email address'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password need to be 4 to 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError(`${email} has been used`);
    }

    const user = User.build({ email, password });
    await user.save();

    //generate jwt store in session object
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };

import express, { NextFunction } from 'express';
const router = express.Router();

import { check, validationResult } from 'express-validator/check';

/**
 * Controllers (route handlers).
 */
import * as ethController from '../controllers/api/eth';


// eth router
router.get('/api/eth/create-account', ethController.createAccount);
router.post('/api/eth/call-methods', [
  check('method').not().isEmpty().withMessage('The params [method] is required and not empty'),
  check('contractAddress').not().isEmpty().withMessage('The params [contractAddress] is required and not empty'),
], (req: any, res: any, next: NextFunction) => {
  const errors = validationResult(req);

  try {
    validationResult(req).throw();
    next();
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Bad request',
        error: errors.array(),
      }
    });
  }
}, ethController.callMethodsContract);
router.post('/api/eth/send-methods', [
  check('method').not().isEmpty().withMessage('The params [method] is required and not empty'),
  check('encryptedKey').not().isEmpty().withMessage('The params [encryptedKey] is required and not empty'),
  check('contractAddress').not().isEmpty().withMessage('The params [contractAddress] is required and not empty'),
], (req: any, res: any, next: NextFunction) => {
  const errors = validationResult(req);

  try {
    validationResult(req).throw();
    next();
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Bad request',
        error: errors.array(),
      }
    });
  }
}, ethController.sendMethodsContract);

router.post('/api/eth/get-transaction', [
  check('transactionHash').not().isEmpty().withMessage('The params [transactionHash] is required and not empty'),
], (req: any, res: any, next: NextFunction) => {
  const errors = validationResult(req);

  try {
    validationResult(req).throw();
    next();
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: 'error',
      data: {
        message: 'Bad request',
        error: errors.array(),
      }
    });
  }
}, ethController.getTransaction);
export default router;
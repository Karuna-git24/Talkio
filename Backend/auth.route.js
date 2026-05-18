import express from 'express';
import { signup, login, logout } from './auth.controller.js';

import { protectRoute } from './middleware/auth.middleware.js';
import { onboard} from './auth.controller.js';


const router = express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

router.post("/onboarding", protectRoute, onboard)
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({ user: req.user });
});



export default router;
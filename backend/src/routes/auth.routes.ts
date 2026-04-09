import express from 'express';
import { register, login } from '../controllers/auth.controller';
import auth from '../middleware/auth'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/auth', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '유저 없음' });
    }
    res.json({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
    });
  } catch (err) {
    res.status(500).json({ message: '인증 실패' });
  }
});

export default router; 
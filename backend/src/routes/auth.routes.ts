import express from 'express';
import { getDatabaseConnectionDebug, login, register } from '../controllers/auth.controller';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/auth', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '유저 정보가 없습니다.' });
    }

    return res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
    });
  } catch {
    return res.status(500).json({ message: '인증 확인에 실패했습니다.' });
  }
});

router.get('/debug/db', auth, getDatabaseConnectionDebug);

export default router;

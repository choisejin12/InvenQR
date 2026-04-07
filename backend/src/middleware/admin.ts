import { Request, Response, NextFunction } from 'express';

const admin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 로그인 여부 체크
    if (!req.user) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    // 관리자 권한 체크
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export default admin;
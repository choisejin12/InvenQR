/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

// JWT payload 타입 정의
interface JwtPayload {
  userId: number;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 헤더에서 토큰 가져오기
    const authHeader = req.headers['authorization'];

    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    // 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // DB에서 유저 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: '유저 없음' });
    }

    // req에 유저 정보 추가
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: '토큰이 유효하지 않습니다.' });
  }
};

export default auth;
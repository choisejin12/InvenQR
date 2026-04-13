import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* 회원가입 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name: string;
    };

    // 1. 기본 입력값이 비어 있으면 바로 종료합니다.
    if (!email || !password || !name) {
      return res.status(400).json({ message: '이름, 이메일, 비밀번호를 모두 입력해주세요.' });
    }

    // 2. 같은 이메일이 이미 존재하는지 확인합니다.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 3. 비밀번호는 해시로 변환한 뒤 저장합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || '회원가입 중 서버 오류가 발생했습니다.' });
  }
};

/* 로그인 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // 1. 프론트에서 값이 빠진 채로 요청되면 원인을 바로 알 수 있게 합니다.
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    // 2. 이메일로 사용자를 조회합니다.
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: '해당 이메일을 가진 사용자가 없습니다.' });
    }

    // 3. 저장된 해시와 입력 비밀번호를 비교합니다.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 올바르지 않습니다.' });
    }

    // 4. 로그인 성공 시 JWT를 발급하고 사용자 정보도 함께 내려줍니다.
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' },
    );

    return res.json({
      message: '로그인에 성공했습니다.',
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || '로그인 중 서버 오류가 발생했습니다.' });
  }
};

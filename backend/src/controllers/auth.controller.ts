import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 회원가입
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password , name} = req.body as {
      email: string;
      password: string;
      name : string;
    };

    // 1. 유효성 체크
    if (!email || !password || !name ) {
      return res.status(400).json({ message: '값을 입력해주세요.' });
    }

    // 2. 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 3. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. DB 저장
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({
      message: 'InvenQR의 멤버가 되신 걸 환영합니다🤗',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 로그인
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // 1. 유저 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: '해당하는 이메일이 없습니다.' });
    }

    // 2. 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
    }

    // 3. 토큰 생성
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      message: '로그인에 성공하였습니다.',
      accessToken: token,
      userData:{
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
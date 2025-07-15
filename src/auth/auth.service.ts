import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../tokens/entities/token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async register(createAuthDto: RegisterUserDto) {
    const { email, password } = createAuthDto;

    // Перевірка чи є вже користувач з таким email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({ email, passwordHash });
    return this.userRepository.save(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // приклад для refresh токена
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // додаємо 7 днів

    // збереження в базу
    await this.tokenRepository.save({
      accessToken,
      refreshToken,
      user,
      expiresAt,
    });

    return { accessToken };
  }
}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Token } from '../tokens/entities/token.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: 'yourSecretKeyHere', // краще з .env
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { User } from '../users/entities/user.entity';
import { Token } from './entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Token, User])],
  controllers: [TokensController],
  providers: [TokensService],
})
export class TokensModule {}

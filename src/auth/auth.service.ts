import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schema/user.schema';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async login(
    user: User,
    response: Response,
  ) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() + this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_MS')
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() + this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS')
    );
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };
    const accessToken = await this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });
    const refreshToken = await this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });
    // update user with hashed refreshToken
    await this.usersService.updateUser({_id: user._id }, {
      $set: { refreshToken: 
        await bcrypt.hash(refreshToken, 10),
      },
    }); 
    response.cookie(
      'Authentication',
      accessToken,
      {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        expires: expiresAccessToken,
      }
    );
    response.cookie(
      'Refresh',
      refreshToken,
      {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        expires: expiresRefreshToken,
      }
    )
  }
  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ _id: userId});
      const authenticated = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Refresh Token is not valid');
    }
  }
}

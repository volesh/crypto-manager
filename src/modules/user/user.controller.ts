import { UserService } from './user.service';
import { Controller, Get, Post } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser() {
    return this.userService.getUser();
  }

  @Post()
  createUser() {
    return this.userService.createUser({
      name: 'Vasyl',
      email: 'test@test.com',
      password: 'qwer1234',
    });
  }
}

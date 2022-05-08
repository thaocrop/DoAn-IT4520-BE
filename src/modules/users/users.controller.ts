import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Auth } from 'src/common/decorators/auth.decorator';
import { AuthGuard } from 'src/common/guards/authenticate.guard';
import { UserType } from 'src/enums/user.enum';

import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @Auth([
    {
      userType: UserType.CLIENT,
    },
  ])
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}

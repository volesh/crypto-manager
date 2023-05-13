import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { Deposits } from '@prisma/client';
import { PaginationResponseI } from 'src/general/interfaces/pagination/pagination.response.interface';
import { DepositsEnum } from 'src/general/enums/deposits.enum';
import { OrderEnum } from 'src/general/enums/order.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createDepositDto: CreateDepositDto,
    @Req() request: IRequest,
  ): Promise<Deposits> {
    return this.depositsService.create(createDepositDto, request.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Req() request: IRequest,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 10,
    @Query('status') status?: DepositsEnum,
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
  ): Promise<PaginationResponseI<Deposits>> {
    return this.depositsService.findAll(
      request.user.id,
      +page,
      +perPage,
      status,
      orderDirecrion,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Deposits> {
    return this.depositsService.remove(id);
  }
}

import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { Coins } from '@prisma/client';
import { OrderEnum } from 'src/general/enums/order.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  // Get coins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getCoins(
    @Req() { user }: IRequest,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 10,
    @Query('order_by') orderBy: string = 'spendMoney',
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
    @Query('coinId') coinId?: string,
  ): Promise<PaginationResponseI<Coins>> {
    return this.coinsService.getCoins(
      user.id,
      +page,
      +perPage,
      orderBy,
      orderDirecrion,
      coinId,
    );
  }
}

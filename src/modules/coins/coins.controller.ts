import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Coins, Fiat } from '@prisma/client';

import { FieldsForSort, OrderEnum } from '../../general/enums';
import { IRequest } from '../../general/interfaces/request/request.interface';
import { GetAllCoinsResponse } from '../../general/swagger.responses/coins.responses/get.al.coins.response';
import { FiatResponse } from '../../general/swagger.responses/fiat/fiat.response';
import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { CoinsService } from './coins.service';

@ApiTags('coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  // Get coins by wallet !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: GetAllCoinsResponse })
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'walletId', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'order_by', required: false })
  @ApiQuery({ name: 'coinId', required: false })
  @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @Get()
  getCoins(
    @Req() { user }: IRequest,
    @Query('walletId') walletId?: string,
    @Query('page') page = 1,
    @Query('per_page') perPage = 10,
    @Query('order_by') orderBy: FieldsForSort = FieldsForSort.amount,
    @Query('order_direction') orderDirection: OrderEnum = OrderEnum.DESC,
    @Query('coinId') coinId?: string,
  ): Promise<PaginationResponseI<Coins>> {
    return this.coinsService.getCoins(user.id, walletId, +page, +perPage, orderBy, orderDirection, coinId);
  }

  // Get Fiat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiResponse({ type: [FiatResponse] })
  @Get('/fiat')
  getFiatList(): Promise<Fiat[]> {
    return this.coinsService.getFiatList();
  }
}

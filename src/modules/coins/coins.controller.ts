import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Coins, Fiat } from '@prisma/client';
import { OrderEnum } from 'src/general/enums';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { GetAllCoinsResponse } from 'src/general/swagger.responses/coins.responses/get.al.coins.response';
import { FiatResponse } from 'src/general/swagger.responses/fiat/fiat.response';

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
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'order_by', required: false })
  @ApiQuery({ name: 'coinId', required: false })
  @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @Get(':walletId')
  getCoins(
    @Req() { user }: IRequest,
    @Param('walletId') walletId: string,
    @Query('page') page = 1,
    @Query('per_page') perPage = 10,
    @Query('order_by') orderBy = 'spendMoney',
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
    @Query('coinId') coinId?: string,
  ): Promise<PaginationResponseI<Coins>> {
    return this.coinsService.getCoinsByWallet(user.id, walletId, +page, +perPage, orderBy, orderDirecrion, coinId);
  }

  // Get Coins By Users !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: GetAllCoinsResponse })
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  // @ApiQuery({ name: 'order_by', required: false })
  // @ApiQuery({ name: 'coinId', required: false })
  // @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @Get()
  getCoinsByUsers(
    @Req() { user }: IRequest,
    // @Param('walletId') walletId: string,
    @Query('page') page = 1,
    @Query('per_page') perPage = 10,
    // @Query('order_by') orderBy = 'spendMoney',
    // @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
    // @Query('coinId') coinId?: string,
  ): Promise<PaginationResponseI<Coins>> {
    return this.coinsService.getAllUsersCoins(user.id, +page, +perPage);
  }

  // Get Fiat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: [FiatResponse] })
  @UseGuards(AuthGuard('jwt'))
  @Get('/fiat')
  getFiatList(): Promise<Fiat[]> {
    return this.coinsService.getFiatList();
  }
}

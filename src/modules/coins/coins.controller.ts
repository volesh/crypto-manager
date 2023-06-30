import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { Coins, Fiat } from '@prisma/client';
import { OrderEnum } from 'src/general/enums/order.enum';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAllCoinsResponse } from 'src/general/swagger.responses/coins.responses/get.al.coins.response';
import { FiatResponse } from 'src/general/swagger.responses/fiat/fiat.response';

@ApiTags('coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  // Get coins !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: GetAllCoinsResponse })
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'order_by', required: false })
  @ApiQuery({ name: 'coinId', required: false })
  @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @Get()
  getCoins(
    @Req() { user }: IRequest,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 10,
    @Query('order_by') orderBy: string = 'spendMoney',
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
    @Query('coinId') coinId?: string,
  ): Promise<PaginationResponseI<Coins>> {
    return this.coinsService.getCoins(user.id, +page, +perPage, orderBy, orderDirecrion, coinId);
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

import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Deposits } from '@prisma/client';

import { DepositsEnum, OrderEnum } from '../../general/enums';
import { PaginationResponseI } from '../../general/interfaces/pagination/pagination.response.interface';
import { IRequest } from '../../general/interfaces/request/request.interface';
import { DepositResponse } from '../../general/swagger.responses/deposits.responses/deposit.response';
import { GetAllDepositsResponse } from '../../general/swagger.responses/deposits.responses/get.all.deposits.response';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@ApiTags('deposits')
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateDepositDto })
  @ApiCreatedResponse({ type: DepositResponse })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createDepositDto: CreateDepositDto): Promise<DepositResponse> {
    return this.depositsService.create(createDepositDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ type: GetAllDepositsResponse })
  @ApiParam({ name: 'walletId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':walletId')
  findAll(
    @Req() request: IRequest,
    @Param('walletId') walletId: string,
    @Query('page') page = 1,
    @Query('per_page') perPage = 10,
    @Query('status') status?: DepositsEnum,
    @Query('order_by') orderBy = 'createdAt',
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
  ): Promise<PaginationResponseI<Deposits>> {
    return this.depositsService.findAll(request.user.id, +page, +perPage, status, orderDirecrion, orderBy, walletId);
  }

  @ApiBearerAuth()
  @ApiResponse({ type: DepositResponse })
  @ApiParam({
    name: 'id',
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Deposits> {
    return this.depositsService.remove(id);
  }
}

import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Fiat, WalletValues } from '@prisma/client';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { ErrorResponse } from 'src/general/swagger.responses/errors.responses/error.response';
import { GetAllWalletValues } from 'src/general/swagger.responses/wallet.values.responses/get.all.response';

import { WalletValuesService } from './wallet-values.service';

@ApiTags('wallet-values')
@Controller('wallet-values')
export class WalletValuesController {
  constructor(private readonly walletValuesService: WalletValuesService) {}

  // Get All !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiResponse({ status: 200, type: GetAllWalletValues })
  @ApiResponse({ status: 400, type: ErrorResponse })
  @ApiQuery({
    name: 'from-date',
    required: false,
    type: String,
    description: 'Format should be yyyy-mm-dd',
  })
  @ApiQuery({
    name: 'to-date',
    required: false,
    type: String,
    description: 'Format should be yyyy-mm-dd',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Req() request: IRequest,
    @Query('from-date') fromDate?: string,
    @Query('to-date') toDate?: string,
  ): Promise<{ data: WalletValues[]; currency: Fiat }> {
    return this.walletValuesService.findAll(request.user.id, fromDate, toDate);
  }
}

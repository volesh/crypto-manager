import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Fiat } from '@prisma/client';
import { AccountValuesI } from 'src/general/interfaces/account-values/daily.volume.interface';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { GetAllWalletValues } from 'src/general/swagger.responses/daily.volume.responses/get.all.response';
import { ErrorResponse } from 'src/general/swagger.responses/errors.responses/error.response';

import { WalletValuesService } from './daily-volume.service';

@ApiTags('dailyVolume')
@Controller('dailyVolume')
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
  @ApiQuery({
    name: 'walletId',
    required: false,
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Req() request: IRequest,
    @Query('from-date') fromDate?: string,
    @Query('to-date') toDate?: string,
    @Query('walletId') walletId?: string,
  ): Promise<{ data: AccountValuesI[]; currency: Fiat }> {
    return this.walletValuesService.findAll(request.user.id, fromDate, toDate, walletId);
  }
}

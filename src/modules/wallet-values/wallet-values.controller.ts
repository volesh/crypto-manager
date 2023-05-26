import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WalletValuesService } from './wallet-values.service';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import type { WalletValues } from '@prisma/client';
import { ApiBearerAuth, ApiFoundResponse, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAllWalletValues } from 'src/general/swagger.responses/wallet.values.responses/get.all.response';
import { ErrorResponse } from 'src/general/swagger.responses/errors.responses/error.response';

@ApiTags('wallet')
@Controller('wallet')
export class WalletValuesController {
  constructor(private readonly walletValuesService: WalletValuesService) {}

  // Get All !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiResponse({ status: 200, type: [GetAllWalletValues] })
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
  ): Promise<WalletValues[]> {
    return this.walletValuesService.findAll(request.user.id, fromDate, toDate);
  }
}

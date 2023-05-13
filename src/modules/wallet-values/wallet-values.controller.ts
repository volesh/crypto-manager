import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WalletValuesService } from './wallet-values.service';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { WalletValues } from '@prisma/client';

@Controller('wallet')
export class WalletValuesController {
  constructor(private readonly walletValuesService: WalletValuesService) {}

  // Get All !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

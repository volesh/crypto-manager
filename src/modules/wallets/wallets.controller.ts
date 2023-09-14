import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IRequest } from '../../general/interfaces/request/request.interface';
import { StringresponseI } from '../../general/interfaces/responses/string.response.interface';
import { CreateWalletI } from '../../general/interfaces/wallets/createWallet';
import { GetAllWalletsI } from '../../general/interfaces/wallets/getAllWallets';
import { GetOneWalletI } from '../../general/interfaces/wallets/getWalletById';
import { Stringresponse } from '../../general/swagger.responses/auth.responses/string.response';
import { CreateWallet } from '../../general/swagger.responses/wallets.responses/createWallet.response';
import { WalletValues } from '../../general/swagger.responses/wallets.responses/getAllWallets.response';
import { GetOneWallet } from '../../general/swagger.responses/wallets.responses/getOneWallet';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @ApiResponse({ status: 200, type: CreateWallet })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createWallet(@Body() createWalletDto: CreateWalletDto, @Req() request: IRequest): Promise<CreateWalletI> {
    return this.walletsService.create(createWalletDto, request.user.id);
  }

  @ApiResponse({ status: 200, type: WalletValues })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUserWallets(@Req() request: IRequest): Promise<GetAllWalletsI> {
    return this.walletsService.findAll(request.user.id);
  }

  @ApiResponse({ status: 200, type: GetOneWallet })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':walletId')
  findOne(@Param('walletId') walletId: string): Promise<GetOneWalletI> {
    return this.walletsService.findOne(walletId);
  }

  @ApiResponse({ status: 200, type: CreateWallet })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':walletId')
  updateWallet(@Body() updateWalletDto: UpdateWalletDto, @Param('walletId') walletId: string): Promise<GetOneWalletI> {
    return this.walletsService.update(updateWalletDto, walletId);
  }

  @ApiResponse({ status: 200, type: Stringresponse })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<StringresponseI> {
    return this.walletsService.deleteWallet(id);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { currencyFileds } from 'src/general/configs';
import { CurrencyHelper } from 'src/general/helpers';
import { CreateWalletI } from 'src/general/interfaces/wallets/createWallet';
import { GetAllWalletsI } from 'src/general/interfaces/wallets/getAllWallets';
import { PrismaService } from 'src/prisma.service';

import { CoinsService } from '../coins/coins.service';
import { UserService } from '../user/user.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly coinsService: CoinsService,
  ) {}

  async create(createWalletDto: CreateWalletDto, userId: string): Promise<CreateWalletI> {
    const user = await this.userService.getOneUser(userId);
    if (!user) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }
    const isWalletExist = await this.prisma.wallets.findFirst({ where: { userId, name: createWalletDto.name } });
    if (isWalletExist) {
      throw new BadRequestException(`Wallet with name "${createWalletDto.name}" already exist`);
    }
    const invested = await this.calculateInvested(createWalletDto);
    const wallet = await this.prisma.wallets.create({
      data: {
        name: createWalletDto.name,
        invested,
        userId: userId,
      },
    });
    const promises = createWalletDto.coins.map((coin) => {
      return this.coinsService.createCoin(coin, userId, wallet.id);
    });
    createWalletDto.fiat.forEach((fiat) => {
      promises.push(this.coinsService.createFiat(fiat, userId, wallet.id));
    });
    await Promise.all(promises);
    const updatedWallet = CurrencyHelper.calculateCurrency(wallet, currencyFileds.wallet, user.currency);
    return {
      wallet: updatedWallet,
      currency: user.currency,
    };
  }

  async findAll(userId: string): Promise<GetAllWalletsI> {
    const user = await this.userService.getOneUser(userId);
    if (!user) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }
    const wallets = await this.prisma.wallets.findMany({ where: { userId } });
    const updatedWallets = wallets.map((wallet) => {
      return CurrencyHelper.calculateCurrency(wallet, currencyFileds.wallet, user.currency);
    });
    return {
      data: updatedWallets,
      currency: user.currency,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }

  async calculateInvested(data: CreateWalletDto): Promise<number> {
    let invested = 0;
    const fiatCodes = data.fiat.map((fiat) => fiat.code);
    if (fiatCodes.length > 0) {
      const fiats = await this.prisma.fiat.findMany({
        where: { code: { in: fiatCodes } },
      });
      invested = data.fiat.reduce((accum, fiat) => {
        const fiatPrice = fiats.find((elem) => elem.code === fiat.code);
        return (accum += fiat.amount / fiatPrice.price);
      }, invested);
    }

    invested = data.coins.reduce((accum, coin) => {
      return (accum += coin.spendMoney);
    }, invested);

    return invested;
  }
}

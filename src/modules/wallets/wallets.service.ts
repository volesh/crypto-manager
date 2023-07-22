import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { currencyFileds } from 'src/general/configs';
import { CoinTypeEnum } from 'src/general/enums';
import { CurrencyHelper } from 'src/general/helpers';
import { StringresponseI } from 'src/general/interfaces/responses/string.response.interface';
import { CreateWalletI } from 'src/general/interfaces/wallets/createWallet';
import { GetAllWalletsI } from 'src/general/interfaces/wallets/getAllWallets';
import { GetOneWalletI } from 'src/general/interfaces/wallets/getWalletById';
import { PrismaService } from 'src/prisma.service';
import { CoingeckoService } from 'src/services/coingecko/coingecko.service';

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

  async findOne(id: string): Promise<GetOneWalletI> {
    const { user, ...wallet } = await this.prisma.wallets.findUnique({
      where: { id },
      include: { user: { include: { currency: true } } },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet with id: ${id} not found`);
    }
    const { balance, notFixedIncome, fiat } = await this.calculateWalletBalance(id);
    const walletForResponse = {
      ...wallet,
      // balance: balance + fiat,
      balance: Number(new Decimal(balance).plus(new Decimal(fiat))),
      notFixedIncome,
      fiat,
      // totalIncome: notFixedIncome + wallet.fixedIncome,
      totalIncome: Number(new Decimal(notFixedIncome).plus(new Decimal(wallet.fixedIncome))),
    };
    return {
      wallet: CurrencyHelper.calculateCurrency(walletForResponse, currencyFileds.wallet, user.currency),
      currency: user.currency,
    };
  }

  async update(data: UpdateWalletDto, id: string): Promise<GetOneWalletI> {
    const isExist = await this.findOne(id);
    if (!isExist) {
      throw new NotFoundException(`Wallet with id: ${id} not dound`);
    }
    const updatedWallet = await this.prisma.wallets.update({ where: { id }, data });
    isExist.wallet = { ...isExist.wallet, ...updatedWallet };
    return isExist;
  }

  async deleteWallet(id: string): Promise<StringresponseI> {
    const wallet = await this.prisma.wallets.findUnique({
      where: { id },
      include: { transactions: true, coins: true, deposits: true, walletValues: true },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    const promises = [];
    const coinsIds = wallet.coins.map((coin) => coin.id);
    const transactionsIds = wallet.transactions.map((transaction) => transaction.id);
    const depositsIds = wallet.deposits.map((deposit) => deposit.id);
    const valuesId = wallet.walletValues.map((value) => value.id);
    promises.push(this.prisma.coins.deleteMany({ where: { id: { in: coinsIds } } }));
    promises.push(this.prisma.transactions.deleteMany({ where: { id: { in: transactionsIds } } }));
    promises.push(this.prisma.deposits.deleteMany({ where: { id: { in: depositsIds } } }));
    promises.push(this.prisma.walletValues.deleteMany({ where: { id: { in: valuesId } } }));
    await Promise.all(promises);
    await this.prisma.wallets.delete({ where: { id } });
    return { status: 'Wallet deleted' };
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
        // return (accum += fiat.amount / fiatPrice.price);
        return (accum = Number(
          new Decimal(accum).plus(new Decimal(fiat.amount).dividedBy(new Decimal(fiatPrice.price))).valueOf(),
        ));
      }, invested);
    }

    invested = data.coins.reduce((accum, coin) => {
      // return (accum += coin.spendMoney);
      return (accum = Number(new Decimal(accum).plus(new Decimal(coin.spendMoney)).valueOf()));
    }, invested);

    return invested;
  }

  async calculateWalletBalance(walletId: string) {
    let balance = 0;
    let notFixedIncome = 0;
    let fiat = 0;
    const coins = await this.coinsService.getWalletCoins(walletId);
    if (!coins) {
      return { balance, notFixedIncome };
    }
    const listOfCoinIdPromises = coins.map(async (coin) => {
      if (coin.type !== CoinTypeEnum.Fiat) {
        return coin.coinId;
      } else {
        const { price } = await this.prisma.fiat.findUnique({ where: { code: coin.coinId } });

        // fiat += coin.amount / price;
        fiat = Number(new Decimal(fiat).plus(new Decimal(coin.amount).dividedBy(new Decimal(price))).valueOf);
      }
    });
    const listOfCoinId = await Promise.all(listOfCoinIdPromises);
    const coinMarkets = await CoingeckoService.getCoinMarkest(listOfCoinId);
    coins.forEach((coin) => {
      const market = coinMarkets.find((item) => item.id === coin.coinId);
      if (!market || coin.type === CoinTypeEnum.Fiat) {
        return;
      }
      // balance += market.current_price * coin.amount;
      balance = Number(new Decimal(balance).plus(new Decimal(market.current_price).times(new Decimal(coin.amount))).valueOf());
      // notFixedIncome += market.current_price * coin.amount - coin.spendMoney;
      notFixedIncome = Number(
        new Decimal(notFixedIncome)
          .plus(new Decimal(market.current_price).times(new Decimal(coin.amount)))
          .minus(new Decimal(coin.spendMoney))
          .valueOf(),
      );
    });

    // balance = +balance;
    // notFixedIncome = +notFixedIncome;
    return { balance, notFixedIncome, fiat };
  }
}

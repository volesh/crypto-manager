import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { Transactions } from '@prisma/client';
import { TransactionsResponseI } from 'src/general/interfaces/transactions/transactions.response.interface';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Get All Transactions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getTransactions(
    @Req() request: IRequest,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 10,
    @Query('order_by') orderBy: string = 'createdAt',
    @Query('date') date?: string,
    @Query('coinId') coinId?: string,
  ): Promise<TransactionsResponseI> {
    return this.transactionsService.getTransactions(
      request.user.id,
      +page,
      +perPage,
      orderBy,
      date,
      coinId,
    );
  }

  // Create transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createTransaction(
    @Body() transaction: CreateTransactionDto,
    @Req() request: IRequest,
  ): Promise<Transactions> {
    return this.transactionsService.createTransaction(
      transaction,
      request.user.id,
    );
  }
}

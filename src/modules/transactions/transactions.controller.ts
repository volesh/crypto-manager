import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { TransactionStatusEnum } from 'src/general/enums/transaction.status.enum';

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
    @Query('status') status?: TransactionStatusEnum,
  ): Promise<PaginationResponseI<Transactions>> {
    return this.transactionsService.getTransactions(
      request.user.id,
      +page,
      +perPage,
      orderBy,
      date,
      coinId,
      status,
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

  // Delete Transactions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  deleteTransaction(@Param('id') id: string) {
    return this.transactionsService.deleteTransaction(id);
  }
}

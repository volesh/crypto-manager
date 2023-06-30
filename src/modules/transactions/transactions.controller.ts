import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Transactions } from '@prisma/client';
import { TransactionStatusEnum } from 'src/general/enums';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { CreateTransactionResponse } from 'src/general/swagger.responses/transactions.responses/create.transaction.response';
import { GetAllTransactionsResponse } from 'src/general/swagger.responses/transactions.responses/get.all.transactions.response';

import { PaginationResponseI } from './../../general/interfaces/pagination/pagination.response.interface';
import { Stringresponse } from './../../general/swagger.responses/auth.responses/string.response';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Get All Transactions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: GetAllTransactionsResponse })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Format should be yyyy-mm-dd',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'order_by', required: false })
  @ApiQuery({ name: 'coinId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getTransactions(
    @Req() request: IRequest,
    @Query('page') page = 1,
    @Query('per_page') perPage = 10,
    @Query('order_by') orderBy = 'createdAt',
    @Query('date') date?: string,
    @Query('coinId') coinId?: string,
    @Query('status') status?: TransactionStatusEnum,
  ): Promise<PaginationResponseI<Transactions>> {
    return this.transactionsService.getTransactions(request.user.id, +page, +perPage, orderBy, date, coinId, status);
  }

  // Create transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBody({ type: CreateTransactionDto })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateTransactionResponse })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createTransaction(@Body() transaction: CreateTransactionDto, @Req() request: IRequest): Promise<Transactions> {
    return this.transactionsService.createTransaction(transaction, request.user.id);
  }

  // Delete Transactions !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @ApiBearerAuth()
  @ApiResponse({ type: Stringresponse })
  @ApiParam({ name: 'id', required: true, type: String })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  deleteTransaction(@Param('id') id: string): Promise<Stringresponse> {
    return this.transactionsService.deleteTransaction(id);
  }
}

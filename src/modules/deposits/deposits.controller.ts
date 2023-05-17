import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { IRequest } from 'src/general/interfaces/request/request.interface';
import { Deposits } from '@prisma/client';
import { PaginationResponseI } from 'src/general/interfaces/pagination/pagination.response.interface';
import { DepositsEnum } from 'src/general/enums/deposits.enum';
import { OrderEnum } from 'src/general/enums/order.enum';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepositResponse } from 'src/general/swagger.responses/deposits.responses/deposit.response';
import { GetAllDepositsResponse } from 'src/general/swagger.responses/deposits.responses/get.all.deposits.response';

@ApiTags('deposits')
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateDepositDto })
  @ApiCreatedResponse({ type: DepositResponse })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createDepositDto: CreateDepositDto,
    @Req() request: IRequest,
  ): Promise<DepositResponse> {
    return this.depositsService.create(createDepositDto, request.user.id);
  }

  @ApiBearerAuth()
  @ApiResponse({ type: GetAllDepositsResponse })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'order_direcrion', required: false, example: 'desc' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Req() request: IRequest,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 10,
    @Query('status') status?: DepositsEnum,
    @Query('order_direcrion') orderDirecrion: OrderEnum = OrderEnum.DESC,
  ): Promise<PaginationResponseI<Deposits>> {
    return this.depositsService.findAll(
      request.user.id,
      +page,
      +perPage,
      status,
      orderDirecrion,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ type: DepositResponse })
  @ApiParam({
    name: 'id',
    type: String,
    example: '8933087a-464f-4fe1-86a5-8eae613d7485',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Deposits> {
    return this.depositsService.remove(id);
  }
}

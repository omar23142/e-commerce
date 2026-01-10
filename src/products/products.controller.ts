import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, Res, Headers, ParseIntPipe, ValidationPipe, UseGuards, Query } from "@nestjs/common";
import { ProductService } from "./products.service";
import { creatProductsDto } from "./dtos/create-Productdto.dto";
import { updateProductdto } from "./dtos/update-productdto.dto";
import type { Request, Response } from "express";
import { UserService } from "../users/User.Service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ProtectGard } from "../users/guards/Protect.guard";
import { GetCurrentUser } from "../users/decorators/current-user.decorator";
import { RestrictToGuard } from "../users/guards/RestrictTo.guard";
import { Roles } from "../users/decorators/userRole.decorator";
import { userType } from "../utils/enum";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from "@nestjs/swagger"
import { SkipThrottle } from "@nestjs/throttler";
import { user } from "../users/user.entity";

@Controller()
export class ProductController {
   //private ProductService:ProductService = new ProductService();
   private ProductService: ProductService;
   private userService: UserService;
   private config: ConfigService;
   constructor(ProductService: ProductService, config: ConfigService) {
      this.ProductService = ProductService;
      this.config = config;
   }


   @Get("/api/v1/products")
   @ApiResponse({ status: 200, description: 'fetch product successfully' })
   @ApiOperation({ summary: 'Get collection of products' })
   @ApiQuery({
      name: 'tittle',
      required: false,
      type: 'string',
      description: 'search based on product name'
   })
   @ApiQuery({
      name: 'minPrice',
      required: false,
      type: 'number',
      description: 'search based on product price',
      example: 4
   })
   @ApiQuery({
      name: 'maxPrice',
      required: false,
      type: 'number',
      description: 'search based on product price',
      example: 10000
   })
   @ApiQuery({
      name: 'sortFiled',
      required: false,
      type: 'string',
      description: 'search based on ordered filed'
   })
   @ApiQuery({
      name: 'sortOrder',
      required: false,
      type: 'string',
      description: 'search based on ordered order'
   })
   @ApiQuery({
      name: 'limit',
      required: false
   })
   @ApiQuery({
      name: 'filed',
      required: false
   })
   public getAllProduct(
      @Query() query?: any,
      @Query('tittle') tittle?: string,
      @Query('minPrice') minPrice?: number,
      @Query('maxPrice') maxPrice?: number,
      @Query('sortFiled') sortFiled?: string,
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
      @Query('limit') limit?: number,
      @Query('filed') field?: string
   ) {
      // const DB = this.config.get<string>('DB_database');
      // const DB_PORT = process.env.DB_PORT;
      //console.log(query)
      return this.ProductService.getAll(query, tittle, minPrice, maxPrice, sortFiled, sortOrder, limit, field);
   }
   @Get("/api/v1/products-express/:id")
   public getOneProductExpressWAy(@Req() req, @Res() res) {
      return this.ProductService.getOneProductExpressWAy(req, res)
   }

   @Get("/api/v1/products-express-cookies")
   public cookiesExpressWAy(@Req() req: Request, @Res() res: Response, @Headers() headers: any) {
      return this.ProductService.cookiesExpressWAy(req, res, headers);
   }

   @SkipThrottle() // to skip the rate limiter
   @Get("/api/v1/products/:id")
   public getOneProduct(@Param('id', ParseIntPipe) id: number) {
      return this.ProductService.getOne(id);
   }

   @Post('/api/v1/products')
   @ApiSecurity('bearer')
   @Roles(userType.ADMIN, userType.NORMAL_USER)
   @UseGuards(ProtectGard, RestrictToGuard)
   public creatProduct(@GetCurrentUser() user: user, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: creatProductsDto) {
      return this.ProductService.creatOne(user, body)
   }

   @Patch("/api/v1/products/:id")
   @Roles(userType.ADMIN)
   @UseGuards(ProtectGard, RestrictToGuard)
   @ApiSecurity('bearer')
   public UpdateProduct(@Param('id', ParseIntPipe) id: number, @Body() Body_dto: updateProductdto) {
      return this.ProductService.Update(id, Body_dto);
   }

   @Delete("/api/v1/products/:id")
   @Roles(userType.ADMIN)
   @UseGuards(ProtectGard, RestrictToGuard)
   @ApiSecurity('bearer')
   public DeleteProduct(@Param('id', ParseIntPipe) id: number) {
      return this.ProductService.Delete(id);
   }

}


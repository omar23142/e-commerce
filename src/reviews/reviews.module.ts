import { Injectable, forwardRef, Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { UsersModule } from "../users/users.module";
import { review } from "./review.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductModule } from "../products/products.module";
import { JwtModule } from "@nestjs/jwt";
import { Product } from "../products/Product.entity";

@Module({
    exports:[ReviewsService],
    imports:[forwardRef(() =>UsersModule),
         TypeOrmModule.forFeature([review, Product]),
         forwardRef(() =>ProductModule),
         JwtModule], 
    controllers:[ReviewsController],
    providers:[ReviewsService],
})
export class ReviewModule {

}
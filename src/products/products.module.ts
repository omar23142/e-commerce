import { forwardRef, Module } from "@nestjs/common";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";
import { UsersModule } from "../users/users.module";
import { Product } from "./Product.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ReviewModule } from "../reviews/reviews.module";

@Module({
    controllers:[ProductController],
    providers:[ProductService ],
    imports: [ 
        forwardRef(() =>UsersModule),
        TypeOrmModule.forFeature([Product]),
        forwardRef(()=> ReviewModule),
        JwtModule,
        ],
    exports: [ProductService] 
})
export class ProductModule {


}
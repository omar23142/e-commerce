import { ClassSerializerInterceptor, Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductModule } from './products/products.module';
import { ReviewModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/Product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { user } from './users/user.entity';
import { review } from './reviews/review.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { UploadsModule } from './Uploads/Uploads.Module';
import { LoggerMiddlware } from './utils/middlwares/Loger.middlware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { dataSourceOptions } from '../DB/data-source';


@Global()
@Module({
  imports: [
    UsersModule,
    ProductModule,
    ReviewModule,
    UploadsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:`.env.${process.env.NODE_ENV}` 
      
    }),
    JwtModule.registerAsync({
            inject:[ConfigService],
            useFactory: (config:ConfigService)=> {
                console.log('this is test', config.get<string>("JWT_SECRET"))
                //  if (!config.get<string>("JWT_EXPIRES_IN"))
                //      throw new error('the jwt is undifined')
                //  let x:string = `${config.get<string>("JWT_EXPIRES_IN")}`
                //  let y:number= parseInt(x)
                return {
                    global:true,
                    secret:config.get<string>("JWT_SECRET"),
                    signOptions: {expiresIn:config.get<string>("JWT_EXPIRES_IN") as StringValue }
                }}}),
    TypeOrmModule.forRoot(dataSourceOptions),
  ThrottlerModule.forRoot([ {
    name:'short',
    ttl:10000,
    limit:3
  },
  {
    name:'meduim',
    ttl:10000,
    limit:5
  },
  {
    name:'long',
    ttl:10000,
    limit:10
  },
]
)],
  controllers: [AppController],
  providers: [
    {provide:APP_INTERCEPTOR,
      useClass:ClassSerializerInterceptor
    },{
      provide:APP_GUARD,
      useClass:ThrottlerGuard
    }
    ,
    AppService
    
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddlware)   // this midllware here done by the order that given (logger, auth, ....)
    .forRoutes({ 
      // path:'*',
      // method:RequestMethod.ALL
       path:'/api/v1/users/me',
      method:RequestMethod.GET
    })
    consumer.apply(LoggerMiddlware)   
    .forRoutes(
      { 
      path:'/api/v1/products/:id',
      method:RequestMethod.GET
    },
    { 
      path:'/api/v1/products/:id',
      method:RequestMethod.DELETE
    }
  )
  }
  }

  


 // local Data Base 
  // TypeOrmModule.forRootAsync({
  //     inject: [ConfigService],
  //     useFactory: (config:ConfigService) => {  
  //       const dbUsername = config.get<string>('DB_username');
  //       const dbpass = config.get<string>('DB_password');
  //       const database = config.get<string>('DB_database');
  //       const type = config.get<string>('DB_type');
  //      return {
  //     database:config.get<string>('DB_database'),
  //     type:'postgres',
  //     username:config.get<string>('DB_username'),
  //     password:config.get<string>('DB_password'),
  //     host:'localhost',
  //     synchronize:process.env.NODE_ENV !=='production',
  //     //dropSchema: true,
  //     entities:[Product, user, review],
  //     port:config.get<number>('DB_port'),} 
  //    }
      
  //   }
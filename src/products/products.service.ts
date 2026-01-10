import { Body, Injectable, NotFoundException,Headers, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { creatProductsDto } from "./dtos/create-Productdto.dto";
import { updateProductdto } from "./dtos/update-productdto.dto";
import { UserService } from "../users/User.Service";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Like, Repository } from "typeorm";
import { Product } from "./Product.entity";
import { user } from "../users/user.entity";
import { review } from "../reviews/review.entity";
import { ApiFeature } from "../utils/ApiFeature";



// class Product { 
//      id:number;
//      name:string;
//      price:number;
// }

@Injectable()
export class ProductService {
    
    
    // private products:Product[] = [
    //     {id: 1 , name: 'car' , price: 324},
    //     {id: 2 , name: 'book' , price: 32},
    //     {id: 3 , name: 'plan' , price: 3324}
    // ];
    
constructor(
    @InjectRepository(Product)
    private readonly productRepo:Repository<Product>,
    private readonly userService:UserService ) {
    
}

public async getAll(query?:any,tittle?:string,minPrice?:number,maxPrice?:number,sortField?:string,sortOrder: 'ASC' | 'DESC' = 'DESC',limit?:number,field?:string) {
    // const { tittle, minPrice, maxPrice, sort, limit } = query;

    // const prodcts =  await this.productRepo.find({ relations: { user: true, reviews: true},
    //     where: {
    //         name: tittle ? Like(`%${tittle.toLowerCase()}%`) : undefined,
    //     }});

 
    let where = {
        ...(tittle ? {name: Like(`%${tittle}%`)} : {}),
        ...(minPrice && maxPrice ? { price: Between(minPrice, maxPrice) } : {}),
    }
    let order ={
        ...(sortField ? { [sortField]: sortOrder } : {}),
    }
    let select = field ? { [field]: true } : undefined;
    let prodcts =  await this.productRepo.find({
        where,
        order,
        take: limit,
        select,
        // relations: { user: true, reviews: true }
    });
    //prodcts = prodcts.map( p => { p.user= ''; return p; }); 
    //console.log('+++++++++', prodcts[0].user);
    let apiFeature = new ApiFeature<Product>( this.productRepo.createQueryBuilder('product'), query );
    let prodctsWitApi= await apiFeature.filter().field().build().getMany();
    //console.log(prodctsWitApi)
    return  prodctsWitApi;
    //return prodcts
}



public async getOneProductExpressWAy( @Req() req, @Res() res ) {

    console.log(req.params)
    let id = req.params.id;
    console.log(id);
    const product:Product | null = await this.productRepo.findOne({where:{ id } });
    if (!product)
        throw new NotFoundException('product id is not exist');
    res.status(200).json(product);
}


public cookiesExpressWAy(  @Req() req:Request,  @Res() res:Response , @Headers() headers:any ) {
    console.log(headers)
    console.log('req.header', req.headers)
    res.cookie('jwt', 'jwt_value', {
        httpOnly:true,
        maxAge:120
    } );
    res.status(200).json('cookie set successfuly ');
}


public async getOne( id:number) {
    console.log(id);
    console.log(typeof id);
    const product:Product | null = await this.productRepo.findOneBy( {id} );
    if (!product)
        throw new NotFoundException('product id is not exist');
    return product; 
}


public async creatOne(user:user, body_dto:creatProductsDto) {
    await this.userService.IsUserExist(user.id);
    const NewProd = this.productRepo.create( {...body_dto,
        name: body_dto.name.toLowerCase(),
        user});
    
   //return await this.productRepo.save(prod);
     return this.productRepo.save(NewProd);
}


public async Update(id:number, Body_dto:updateProductdto) {
    console.log(id)
    console.log(Body_dto)
    const product:Product | null = await this.productRepo.findOne({where:{id}});
    if (!product)
        throw new NotFoundException('product id is not exist');
    let UpdatedProd;
    product.name= Body_dto.name ?? product.name;
    product.price= Body_dto.price?? product.price;
    product.discription = Body_dto.discription?? product.discription; 
    UpdatedProd = product;
    return await this.productRepo.save(UpdatedProd);
      
}


public async Delete( id:number ) {
    console.log(id)
    const product:Product | null =await this.productRepo.findOne({ where: {id} });
    if (!product)
        throw new NotFoundException('product id is not exist');
    return await this.productRepo.remove(product);
    
}
}
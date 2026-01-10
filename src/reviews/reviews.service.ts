import { ForbiddenException, Inject, NotFoundException } from "@nestjs/common";
import { Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductService } from "nest-proj/src/products/products.service";
import { UserService } from "../users/User.Service";
import { review } from "./review.entity";
import { Repository } from "typeorm";
import { createReviewDto } from "./dtos/createReview.dtw";
import { Product } from "../products/Product.entity";

import { updateReviewDto } from "./dtos/updateReviewDto.dto";
import { userType } from "../utils/enum";
import {user} from '../users/user.entity'


@Injectable()
export class ReviewsService {
 
   
    constructor(
         @Inject(forwardRef (()=>UserService) )  
        private readonly UserService:UserService,
        //   @Inject(forwardRef(() => ProductService))
        // private readonly productService: ProductService,
         @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
        @InjectRepository(review)
        private readonly ReviewRepo:Repository<review>) {}

    public getAll(reviewPerPage:number, pageNumber?:number) {
        return this.ReviewRepo.find( { 
            order: {createdAt:'DESC'} ,
            skip: reviewPerPage * (pageNumber? pageNumber - 1 : 0),
            take:reviewPerPage});
    }
    public async createReview(userId:number, ProductId:number, dto:createReviewDto) {
        const product= await this.productRepo.findOne({where: {id:ProductId}})
        let newReview = this.ReviewRepo.create({...dto, user: { id: userId }, product:{id: ProductId}});
        if (!product)
            throw new NotFoundException('this product is no longer exist')
        // console.log('after')
        await this.ReviewRepo.save(newReview);
        return newReview;
    }
    private async getOndeReview(reviewId:number) {
        let review = await this.ReviewRepo.findOne({where:{id: reviewId},relations: ['user'] } );
        //console.log('reveiw from get one: ',review?.user)
        // console.log('reveiw', review.user)
        if (!review)
            throw new NotFoundException(`this review with id ${reviewId} not exist`);
        return review;
    } 
    public async updateReview(userId:number, reviewId:number, dto:updateReviewDto) {
        console.log(reviewId)
    //      const result = await this.ReviewRepo
    //     .createQueryBuilder()
    //     .update(review)
    //     .set(dto)
    //     .where('id = :id', { id: reviewId })
    //     .execute();
    //       console.log(result)
    // if (result.affected === 0) {
    //     throw new NotFoundException(`this review with id ${reviewId} not exist`);
    // }
    
    // return await this.ReviewRepo.findOne({
    //     where: { id: reviewId },
    //     relations: ['user', 'product']
    // });
        let review = await this.getOndeReview(reviewId);
        // console.log('this is ', review.rating)
        if(userId !== review.user.id)
            throw new ForbiddenException('you are not allow to update a review you are not created');
        let newReview = review;
        newReview.rating = dto.rating?? review.rating
        newReview.review = dto.review?? review.review
        return this.ReviewRepo.save(review);
    }

    public async deleteReview(user:user, reviewId:number) {
        let review = await this.getOndeReview(reviewId);
        if (user.id === review.user.id || user.role === userType.ADMIN) {
            await this.ReviewRepo.remove(review);
             return {message:'review has been deleted succussfuly'}
        }
        throw new ForbiddenException('you are not allow to delete a review you are not created')
       
    }
    


}
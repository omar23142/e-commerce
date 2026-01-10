import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { UserService } from "../users/User.Service";
import { ProtectGard } from "../users/guards/Protect.guard";
import { GetCurrentUser } from "../users/decorators/current-user.decorator";
import { user } from "../users/user.entity";
import { createReviewDto } from "../reviews/dtos/createReview.dtw";
import { RestrictToGuard } from "../users/guards/RestrictTo.guard";
import { Roles } from "../users/decorators/userRole.decorator";
import { userType } from "../utils/enum";
import { updateReviewDto } from "./dtos/updateReviewDto.dto";


@Controller()
export class ReviewsController {
    private readonly ReviewService:ReviewsService;
    private readonly UserService:UserService;
    constructor(reviewService:ReviewsService, usersService:UserService) {
        this.ReviewService = reviewService;
        this.UserService = usersService;
    }
@Get('/api/v1/reviews')
@Roles(userType.ADMIN, userType.NORMAL_USER) 
@UseGuards(ProtectGard)
    //, RestrictToGuard)
public getAllReviews(
    @Query('limit',ParseIntPipe) reviewPerPage:number , //ParseIntPipe to make sure the user is give reviewPerPage (not optional) and is number
    @Query('page') pageNumber?: number ) {
    const reviews =  this.ReviewService.getAll(reviewPerPage, pageNumber? pageNumber : 1);
    return reviews
}

@Post('/api/v1/reviews/:productId')
@UseGuards(ProtectGard)

public creatReview(@GetCurrentUser() user:user , @Param('productId', ParseIntPipe) id:number, @Body() bodyDto:createReviewDto) {
    console.log(bodyDto);
    return this.ReviewService.createReview(user.id, id, bodyDto);
}
@Patch('/api/v1/reviews/:reviewId')
@UseGuards(ProtectGard)
public updateReview(@GetCurrentUser() user:user, @Param('reviewId',ParseIntPipe) id:number, @Body() bodyDto:updateReviewDto) {
return this.ReviewService.updateReview(user.id, id, bodyDto);
}

@Delete('api/v1/reviews/:reviewId')
@UseGuards(ProtectGard)
public deleteReview(@GetCurrentUser() user:user, @Param('reviewId', ParseIntPipe) reviewId) {
return this.ReviewService.deleteReview(user, reviewId );
}

}
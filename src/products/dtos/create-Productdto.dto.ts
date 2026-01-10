
import { ApiProperty } from '@nestjs/swagger';
import  { IsString, IsNumber, IsNotEmpty, Min, Max, Length, MaxLength, MinLength } from 'class-validator'

export class creatProductsDto {
    @IsString( {message: 'the name must be a string value'})
    @IsNotEmpty()
    // @MinLength(2)
    // @MaxLength(90)
    @Length(2,150)
    @ApiProperty({description:'the name of product'})
    name:string;
    @IsNotEmpty()
    @IsString()
    @Length(2,150)
    @ApiProperty({description:'the discription of product'})
    discription:string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(1000)
    @ApiProperty({description:'the price of product'})
    price:number;

}
import { Length, Max, Min } from "class-validator";
import { Product } from "../products/Product.entity";
import { user } from "../users/user.entity";
import { CURENT_TIME_STAMP } from "../utils/constants";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('reviews')
export class review {
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'int'})
    @Min(1)
    @Max(5)
    rating:number;
    @Column()
    @Length(3,100)
    review:string;
    @CreateDateColumn({ type:'timestamp', default:()=> CURENT_TIME_STAMP})
    createdAt:Date;
    @UpdateDateColumn( { type:'timestamp', default:()=> CURENT_TIME_STAMP, onUpdate:CURENT_TIME_STAMP})
    updatedAt:Date;
    @ManyToOne( ()=> Product, (products)=>products.reviews ,{
        onDelete:'CASCADE'
    })
    product:Product
    @ManyToOne( ()=> user,(users)=>users.reviews , {
        eager:true,
        onDelete:'CASCADE'})  // when user is deleted all his reviews will be deleted
    user:user
    




}
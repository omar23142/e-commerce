
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import {CURENT_TIME_STAMP} from '../utils/constants'
import { review } from "../reviews/review.entity";
import { user } from "../users/user.entity";
import { Exclude } from "class-transformer";

@Entity('products')
export class Product {
@PrimaryGeneratedColumn()
id:number;

@Column({type:'varchar', length:150})
name:string;

@Column( {type:'float'})
price:number;
@Column({ nullable: false })
discription:string;
@CreateDateColumn({ type:'timestamp', default:()=> CURENT_TIME_STAMP})
createdAt:Date;
@UpdateDateColumn( { type:'timestamp', default:()=> CURENT_TIME_STAMP, onUpdate:CURENT_TIME_STAMP})
updatedAt:Date;

 
@OneToMany(()=>review, (reviews)=> reviews.product, //{eager:true}
)

reviews:review[]
@ManyToOne(()=> user, (users)=> users.products, //{eager:true} 
)
user:user

}
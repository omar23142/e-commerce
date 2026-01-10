 

import { Product } from "../src/products/Product.entity";
import { review } from "../src/reviews/review.entity";
import { user } from "../src/users/user.entity";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from 'dotenv';

config( {path: '.env'})
export const dataSourceOptions: DataSourceOptions = {
    type:'postgres',
    url:process.env.DATA_BASE_LINK,
    entities: [user, Product, review],
    migrations: ['dist/DB/migrations/*.js']
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
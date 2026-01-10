
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import request from 'supertest';
import { AppModule } from '../src/app.module'
import { Product } from '../src/products/Product.entity'
import { creatProductsDto } from 'src/products/dtos/create-Productdto.dto';
import { user } from '../src/users/user.entity';
import { userType } from '../src/utils/enum';
import bcrypt from 'bcryptjs'
import { updateProductdto } from 'src/products/dtos/update-productdto.dto';
const productDto: creatProductsDto = { name: 'book', discription: 'about this book', price: 12 }
const updateProductDto: updateProductdto = { name: 'updatedbook', discription: 'about this book', price: 10 }
const productsToSave = [
    { name: 'book', discription: 'about this book', price: 10 },
    { name: 'car', discription: 'about this car', price: 10000 },
    { name: 'laptop', discription: 'about this laptop', price: 1000 },
    { name: 'mobile', discription: 'about this mobile', price: 100 },
]
let admin_user = { userName: 'omarr', email: 'admin@email.com', password: '12345678', role: userType.ADMIN, isVerified: true };

describe('productController(e2e)', () => {
    let dataSource: DataSource;
    let app: INestApplication;
    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule] // import AppModule instead of the productController make the dependency in the productController auto loaded 
            ,
        }).compile();
        app = module.createNestApplication();  // this instead we run the acuall server with actyall port , we create object in the main memory represent the nestApp with all service and controller (fack server) and we send a fack request to it useint the supertest
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        await app.init();
        dataSource = app.get(DataSource);  // for conection and dealing with the database 
        const salut = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash('12345678', salut)
        admin_user.password = hashed;
        console.log('hhhhh', hashed)
        await dataSource.createQueryBuilder().insert().into(user).values([{ userName: 'omar', email: 'admin@email.com', password: hashed, role: userType.ADMIN, isVerified: true }]
        ).execute();
        await dataSource.createQueryBuilder().insert().into(user).values([{ userName: 'omarr', email: 'regularuser@email.com', password: hashed, role: userType.NORMAL_USER, isVerified: true }]
        ).execute();
    });

    afterEach(async () => {
        await dataSource.createQueryBuilder().delete().from(Product).execute();
        await dataSource.createQueryBuilder().delete().from(user).execute();
        await app.close();
    })
    describe('GET', () => {
        it('should return all the products', async () => {
            await dataSource.createQueryBuilder().insert().into(Product).values(productsToSave).execute();
            const results = await request(app.getHttpServer()).get('/api/v1/products');
            expect(results).toBeDefined()
            expect(results.status).toBe(200)
            expect(results.body).toHaveLength(4);
        })
        it('should return  products based on title', async () => {
            await dataSource.createQueryBuilder().insert().into(Product).values(productsToSave).execute();
            const results = await request(app.getHttpServer()).get('/api/v1/products?tittle=book');
            expect(results).toBeDefined()
            expect(results.status).toBe(200)
            expect(results.body).toHaveLength(1);
        })
        it('should return  products that have price between 100 and 1000', async () => {
            await dataSource.createQueryBuilder().insert().into(Product).values(productsToSave).execute();
            const results = await request(app.getHttpServer()).get('/api/v1/products?minPrice=100&maxPrice=1000');
            expect(results).toBeDefined()
            expect(results.status).toBe(200)
            expect(results.body).toHaveLength(2);
        })
    })

    describe('POST', () => {
        it('should create a new product on the database', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' })
            // console.log('body', res.body)
            // console.log('Full Signin Response Body:', JSON.stringify(res.body, null, 2));
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            expect(response).toBeDefined();
            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body).toMatchObject(productDto);
        })
        it('should return 401 for no Barer token ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' })
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .send(productDto);
            expect(response).toBeDefined();
            expect(response.status).toBe(401);

        })
        it('should return badRequest exptions when the req do not match with validationpip ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' })
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send({ name: 'e', price: -1, discription: 'avout' });
            expect(response).toBeDefined();
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual([
                'name must be longer than or equal to 2 characters',
                'price must not be less than 0',
            ]);
        })
    });
    describe('getOneProduct() by id', () => {
        it('should return one product based on the id ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            console.log('rrrrrrrrr', response.body)
            console.log('rrrrrrrrr', typeof response.body.id)
            const product = await request(app.getHttpServer()).get(`/api/v1/products/${parseInt(response.body.id)}`);
            //console.log('ppppppppp', product)
            expect(product).toBeDefined();
            expect(product.status).toBe(200);
            expect(product.body.id).toBe(response.body.id);

        });
        it('should return badRequest exception when the id is not number ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            const product = await request(app.getHttpServer()).get(`/api/v1/products/abc`);
            //console.log('ppppppppp', product)
            expect(product).toBeDefined();
            expect(product.status).toBe(400);
            expect(product.body.message).toContain('Validation failed (numeric string is expected)');

        });
        it('should return NotFound exception when the id is not exist on database ', async () => {

            const product = await request(app.getHttpServer()).get(`/api/v1/products/1`);
            //console.log('ppppppppp', product)
            expect(product).toBeDefined();
            expect(product.status).toBe(404);
            expect(product.body.message).toContain('product id is not exist');

        });



    })

    describe('UpdateProduct() by id', () => {
        it('should return one updated product based on the id ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            const product = await request(app.getHttpServer()).patch(`/api/v1/products/${parseInt(response.body.id)}`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(updateProductDto);

            expect(product).toBeDefined();
            expect(product.status).toBe(200);
            expect(product.body.name).toBe(updateProductDto.name);

        });
        it('should return badRequest exception when the id is not number ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            const product = await request(app.getHttpServer()).patch(`/api/v1/products/abc`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(updateProductDto);
            expect(product).toBeDefined();
            expect(product.status).toBe(400);
            expect(product.body.message).toContain('Validation failed (numeric string is expected)');

        });
        it('should return NotFound exception when the id is not exist on database ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).patch(`/api/v1/products/1`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(updateProductDto);
            expect(product).toBeDefined();
            expect(product.status).toBe(404);
            expect(product.body.message).toContain('product id is not exist');

        });

        it('should return NotAuthorized exception when no token provided ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).patch(`/api/v1/products/1`)

                .send(updateProductDto);
            expect(product).toBeDefined();
            expect(product.status).toBe(401);
            expect(product.body.message).toContain('access denied , invalid token or expired');

        });

        it('should return Forbidden exception 403  when user is not admin ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'regularuser@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).patch(`/api/v1/products/1`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(updateProductDto);
            expect(product).toBeDefined();
            expect(product.status).toBe(403);
            expect(product.body.message).toContain('you are not allowed to do this ');

        });


    });




    describe('DeleteProduct() by id', () => {
        it('should return one deleted product based on the id ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            const product = await request(app.getHttpServer()).delete(`/api/v1/products/${parseInt(response.body.id)}`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
            expect(product).toBeDefined();
            expect(product.status).toBe(200);
            expect(product.body.name).toBe(productDto.name);

        });
        it('should return badRequest exception when the id is not number ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const response = await request(app.getHttpServer()).post('/api/v1/products')
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send(productDto);
            const product = await request(app.getHttpServer()).delete(`/api/v1/products/abc`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
            expect(product).toBeDefined();
            expect(product.status).toBe(400);
            expect(product.body.message).toContain('Validation failed (numeric string is expected)');

        });
        it('should return NotFound exception when the id is not exist on database ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).delete(`/api/v1/products/1`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
            expect(product).toBeDefined();
            expect(product.status).toBe(404);
            expect(product.body.message).toContain('product id is not exist');

        });

        it('should return NotAuthorized exception when no token provided ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).delete(`/api/v1/products/1`)
            expect(product).toBeDefined();
            expect(product.status).toBe(401);
            expect(product.body.message).toContain('access denied , invalid token or expired');

        });

        it('should return Forbidden exception 403  when user is not admin ', async () => {
            const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'regularuser@email.com', password: '12345678' });
            const product = await request(app.getHttpServer()).delete(`/api/v1/products/1`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
            expect(product).toBeDefined();
            expect(product.status).toBe(403);
            expect(product.body.message).toContain('you are not allowed to do this ');

        });


    })

})
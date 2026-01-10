


import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import { DataSource } from 'typeorm'
import request from 'supertest';
import { AppModule } from '../src/app.module'
import { Product } from '../src/products/Product.entity'
import { user } from '../src/users/user.entity';
import { userType } from '../src/utils/enum';
import bcrypt from 'bcryptjs'
import { createReviewDto } from '../src/reviews/dtos/createReview.dtw';
import { review } from '../src/reviews/review.entity';
import { creatProductsDto } from '../src/products/dtos/create-Productdto.dto';

let admin_user = { userName: 'omarr', email: 'admin@email.com', password: '12345678', role: userType.ADMIN, isVerified: true };
let createreviewDto : createReviewDto;
const productDto: creatProductsDto = { name: 'book', discription: 'about this book', price: 12 }
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
        console.log('hhhhh', hashed);
        createreviewDto = { review:'nice', rating:3 }
        
        await dataSource.createQueryBuilder().insert().into(user).values([{ userName: 'omar', email: 'admin@email.com', password: hashed, role: userType.ADMIN, isVerified: true }]
        ).execute();
        await dataSource.createQueryBuilder().insert().into(user).values([{ userName: 'omarr', email: 'regularuser@email.com', password: hashed, role: userType.NORMAL_USER, isVerified: true }]
        ).execute();
    });

    afterEach(async () => {
        await dataSource.createQueryBuilder().delete().from(Product).execute();
        await dataSource.createQueryBuilder().delete().from(user).execute();
        await dataSource.createQueryBuilder().delete().from(review).execute();
        await app.close();
    });

    describe('POST ',  ()=>{
        it(' should return the review that created with 201 status code ', async ()=>{
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
            //console.log('pppppp', prod.body)
            const response = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
           // console.log('rrrrrr', response.body)
        expect(response.status).toBe(201)
        expect(response.body.id).toBeDefined();
        expect(response.body).toMatchObject(createreviewDto)
        expect(response.body.review).toBe('nice')
        expect(response.body.rating).toBe(3)
        })

        it('should return 401 for no Barer token ', async () => {
                    const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' })
                     const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
                    const response = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                   .send(createreviewDto);       
                    expect(response).toBeDefined();
                    expect(response.status).toBe(401);
        
                })
                it('should return badRequest exptions when the req do not match with validationpip ', async () => {
                    const res = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' })
                    const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);

                    const response = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                    .set('Authorization', `Bearer ${res.body.accessToken}`)
                   .send({ rating: -1, review: 8342}); 

                    expect(response).toBeDefined();
                    expect(response.status).toBe(400);
                    expect(response.body.message).toEqual([
                        'rating must not be less than 1',
                        'review must be a string',
                    ]);
                })

                 it('should return NotFound exception when user try to create reveiw for not exist product ', async () => {
                             const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                                const prod = await request(app.getHttpServer()).post('/api/v1/products')
                                            .set('Authorization', `Bearer ${res.body.accessToken}`)
                                            .send(productDto);
                                const response = await request(app.getHttpServer()).post(`/api/v1/reviews/346`)
                                .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                                            expect(response).toBeDefined();
                                            expect(response.status).toBe(404);
                                            expect(response.body.message).toContain('this product is no longer exist');
                 
                         });
                 
        
    })

     describe('GET', () => {
            it('should return all reviews in the data base ', async () => {
                const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).get(`/api/v1/reviews?limit=10`)
                .set('Authorization', `Bearer ${res.body.accessToken}`)
                console.log(review.body)
                expect(review).toBeDefined();
                expect(review.status).toBe(200);
                
    
            });
           
           
        })


        describe('PATCH', () => {
        it('should return one updated review based on the id ', async () => {
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).patch(`/api/v1/reviews/${ postedReview.body.id }`)
                .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                console.log(review.body)
                expect(review).toBeDefined();
                expect(review.status).toBe(200);
                expect(review.body.review).toBe('updated');
                expect(review.body.rating).toBe(5);

        });
        it('should return badRequest exception when the id is not number ', async () => {
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).patch(`/api/v1/reviews/dhs`)
                .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                console.log(review.body)
            expect(review).toBeDefined();
            expect(review.status).toBe(400);
            expect(review.body.message).toContain('Validation failed (numeric string is expected)');

        });
        it('should return NotFound exception when the id is not exist on database ', async () => {
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            // const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            // .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).patch(`/api/v1/reviews/1`)
                .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                console.log(review.body)
            expect(review).toBeDefined();
            expect(review.status).toBe(404);
            expect(review.body.message).toContain('this review with id 1 not exist');

        });
it('should return NotAuthorized exception when no token provided ', async () => {
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).patch(`/api/v1/reviews/${postedReview.body.id}`)
                // .set('Authorization', `Bearer ${res.body.accessToken}`)
                .send({review:'updated', rating:5})
                console.log(review.body)


            expect(review).toBeDefined();
            expect(review.status).toBe(401);
            expect(review.body.message).toContain('access denied , invalid token or expired');

        });

        it('should return Forbidden exception 403  when the user is trying to update the review is not the same who created ', async () => {
            const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
            const regUser = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'regularuser@email.com', password: '12345678' })
            const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).patch(`/api/v1/reviews/${ postedReview.body.id }`)
                .set('Authorization', `Bearer ${regUser.body.accessToken}`).send({review:'updated', rating:5})
                console.log(review.body)
            expect(review).toBeDefined();
            expect(review.status).toBe(403);
            expect(review.body.message).toBe('you are not allow to update a review you are not created');
        })
             describe('DELETE', () => {
                    it('should return one deleted review based on the id ', async () => {
                        const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                        const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
            const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                const review = await request(app.getHttpServer()).delete(`/api/v1/reviews/${ postedReview.body.id }`)
                .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                console.log(review.body)
                        expect(review).toBeDefined();
                        expect(review.status).toBe(200);
                        expect(review.body.name).toBe(postedReview.body.name);            
                    });
                    it('should return badRequest exception when the id is not number ', async () => {
                         const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                        const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
                        const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                        .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                            const review = await request(app.getHttpServer()).delete(`/api/v1/reviews/uryew`)
                            .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                            console.log(review.body)
                        expect(review).toBeDefined();
                        expect(review.status).toBe(400);
                        expect(review.body.message).toContain('Validation failed (numeric string is expected)');
            
                    });

                    it('should return NotFound exception when the id is not exist on database ', async () => {
                        const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                        const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
           
                        // const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                        // .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                            const review = await request(app.getHttpServer()).delete(`/api/v1/reviews/123`)
                            .set('Authorization', `Bearer ${res.body.accessToken}`).send({review:'updated', rating:5})
                            console.log(review.body)


                        expect(review).toBeDefined();
                        expect(review.status).toBe(404);
                        expect(review.body.message).toContain('this review with id 123 not exist');
            
                    });
            
                    it('should return NotAuthorized exception when no token provided ', async () => {
                        const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                        const prod = await request(app.getHttpServer()).post('/api/v1/products')
                           .set('Authorization', `Bearer ${res.body.accessToken}`)
                           .send(productDto);
                    
                        const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                        .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                            const review = await request(app.getHttpServer()).delete(`/api/v1/reviews/${ postedReview.body.id }`)
                            //.set('Authorization', `Bearer ${res.body.accessToken}`)
                            .send({review:'updated', rating:5})
                            console.log(review.body)
                        expect(review).toBeDefined();
                        expect(review.status).toBe(401);
                        expect(review.body.message).toContain('access denied , invalid token or expired');
            
                    });
            
                    it('should return Forbidden exception 403  when the user is trying to delete the review he is not the same created ', async () => {
                         const res = (await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'admin@email.com', password: '12345678' }));
                        const regUser = await request(app.getHttpServer()).post('/api/v1/users/auth/signin').send({ email: 'regularuser@email.com', password: '12345678' })
                        const prod = await request(app.getHttpServer()).post('/api/v1/products')
                                    .set('Authorization', `Bearer ${res.body.accessToken}`)
                                    .send(productDto);
                    
                        const postedReview = await request(app.getHttpServer()).post(`/api/v1/reviews/${prod.body.id}`)
                        .set('Authorization', `Bearer ${res.body.accessToken}`).send(createreviewDto);
                            const review = await request(app.getHttpServer()).delete(`/api/v1/reviews/${ postedReview.body.id }`)
                            .set('Authorization', `Bearer ${regUser.body.accessToken}`).send({review:'updated', rating:5})
                            console.log(review.body)

                        expect(review).toBeDefined();
                        expect(review.status).toBe(403);
                        expect(review.body.message).toContain('you are not allow to delete a review you are not created');
            
                    });

        });


    });

})

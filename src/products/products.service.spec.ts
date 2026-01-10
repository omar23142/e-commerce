
import {Test, TestingModule} from '@nestjs/testing'
import { ProductService } from './products.service'
import { UserService } from '../users/User.Service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './Product.entity';
import { Not, Repository } from 'typeorm';
import { creatProductsDto } from './dtos/create-Productdto.dto';
import { user } from '../users/user.entity';
import { review } from 'src/reviews/review.entity';
import { NotFoundException } from '@nestjs/common';
import { updateProductdto } from './dtos/update-productdto.dto';

type productTestType  = {name:string; describe:string; price:number,id?:number};
type OptionTest = {name?:string, minPrice?:number, maxPrice?:number}

describe('ProductsService', ()=> {
    let productService:ProductService;
    let productRepo:Repository<Product>;
    let RepositoryToken = getRepositoryToken(Product);
    const mockuser = { id:1, userName:'omar', role:'admin' } as user
    const dto:creatProductsDto = {name:'book', price:10, discription:'ice and fire'}
    const update_dto:updateProductdto = {name:'updated book',discription:'java book',price:20};
      let where:OptionTest = { name:'book' };
        let products: productTestType[] = [ 
            {name:'book', describe:'about', price:10,id:1},
            {name:'pen', describe:'about', price:2, id:2},
            {name:'car', describe:'about', price:1000, id:3}

        ]
      
    beforeEach( async() => {
        

        const module:TestingModule = await Test.createTestingModule({
            providers:[
                ProductService,
                { provide:UserService , useValue: {
                    IsUserExist:jest.fn((UserId:number)=>{
                       return Promise.resolve({id:UserId});
                    })
                } } ,  // local module 
                { provide: getRepositoryToken(Product), useValue: {
                    create:jest.fn((body_dto:creatProductsDto)=> {
                       return {...body_dto,
                    name: body_dto.name.toLowerCase(),
                    }
                    }),
                    save:jest.fn((body_dto:creatProductsDto)=>{  return Promise.resolve({
                        ...body_dto,
                        name: body_dto.name.toLowerCase(),
                        id:10
                    })}),
                   
                    find:jest.fn((query?:any,tittle?:string,minPrice?:number,maxPrice?:number,sortField?:string,sortOrder: 'ASC' | 'DESC' = 'DESC',limit?:number,field?:string  )=>{
                        console.log(query)
                         const where = query?.where ?? {};
                        if (where.name) {
                        return Promise.resolve([products[0]]);
                    }
                    if (where.price) {
                        return Promise.resolve([products[1]]);
                    }
                    return Promise.resolve(products);
                                      }),
                    findOneBy:jest.fn( async (option:{id:number})=>{
                        return Promise.resolve( products.find(p=> { if (p.id === option.id) return p }))
                        
                    })
                }
                 }  // Repoisyitory module 

            ]
        }).compile();   // make sure the ready of DI container
        productService = module.get<ProductService>(ProductService)  // get the instance from the DI container
        productRepo = module.get<Repository<Product>>(RepositoryToken);
    })

    it('should productService to be define', ()=>{
        expect(productService).toBeDefined();
    })
     it('should productRepo to be define', ()=>{
        expect(productRepo).toBeDefined();
    });
    describe('creatOne()', ()=> {
        it('should call the create methode in the ProductService', async ()=>{
            await productService.creatOne(mockuser, dto);
            expect(productRepo.create).toHaveBeenCalled();
            expect(productRepo.create).toHaveBeenCalledTimes(1);
           
        })
        it('should call the save methode in the ProductService', async ()=>{
            await productService.creatOne(mockuser, dto);
            expect(productRepo.save).toHaveBeenCalled();
            expect(productRepo.save).toHaveBeenCalledTimes(1);
        });
        it('should create new product',async ()=> {
            const result = await productService.creatOne(mockuser, dto);
            expect(result).toBeDefined();
            expect(result).toMatchObject( {name:'book', price:10, discription:'ice and fire'})
            expect(result.id).toBe(10)
            expect(result.name).toBe('book');
        });

        describe.skip('getAllProduct()', ()=> {
            it('should call the getAll() methode', async()=>{
                await productService.getAll({});
                expect(productRepo.find).toHaveBeenCalled();
                expect(productRepo.find).toHaveBeenCalledTimes(1)
            })
            it('should return 3 elemnt if there is no argument',async ()=> {
                const result = await productService.getAll({});
                    expect(result).toHaveLength(3);
                    expect(result).toMatchObject(
                        [
                            {name:'book', describe:'about', price:10},
                            {name:'pen', describe:'about', price:2},
                            {name:'car', describe:'about', price:1000}
                        ])
        }),
         it('should return 1 elemnt if there where argument with tittle book',async ()=> {
            console.log(where)
                const result = await productService.getAll(null,'book');
                expect(result).toHaveLength(1);
               expect(result[0]).toMatchObject({name:'book', describe:'about', price:10});
                expect(result[0]).toBe(products[0])

})
 it('should return 1 elemnt if there where argument with minPrice',async ()=> {
                const result = await productService.getAll(null,'',2,1000);
                expect(result).toHaveLength(1);
                expect(result[0]).toMatchObject(
                    {name:'pen', describe:'about', price:2},
                    
                );
                expect(result[0]).toBe(products[1])

})
})
describe('getOneBy()',()=>{
    it('shold call the findOneBy from productRepo',async ()=> {
       await productService.getOne(1); 
       expect(  productRepo.findOneBy).toHaveBeenCalled();
       expect(  productRepo.findOneBy).toHaveBeenCalledTimes(1);
    })
    it('shold get one product',async ()=> {
       const product = await productService.getOne(1); 
       expect( product).toMatchObject( {name:'book', describe:'about', price:10,id:1});
    });
     it('shold throw an error if is no product with this id',async ()=> {
       await expect(productService.getOne(234)).rejects.toThrow(NotFoundException)
       
    });
});

describe("UpdateOne()",()=>{
    it('should call the save and findOne methode in the productsRepo', async()=> {
        productRepo.findOne = jest.fn().mockResolvedValue(products[0]); // the mock implemintation for findOne()
        await productService.Update(1, update_dto);
        expect(productRepo.save).toHaveBeenCalled();
        expect(productRepo.save).toHaveBeenCalledTimes(1);
        expect(productRepo.findOne).toHaveBeenCalled();
        expect(productRepo.findOne).toHaveBeenCalledTimes(1);

    });
    it('should return the updated product after the save',async()=>{
        productRepo.findOne = jest.fn().mockResolvedValue(update_dto);
        const Updated_product = await productService.Update(1, update_dto); 
        expect(Updated_product).toStrictEqual({name:'updated book',discription:'java book',price:20,"id": 10})
    })
     it('should throw error if  product does not exist', async()=> {
        productRepo.findOne = jest.fn().mockResolvedValue(null);
        //const Updated_product = await productService.Update(3253, update_dto); 
        await expect(productService.Update(3253, update_dto)).rejects.toThrow(NotFoundException) })
});

describe('Delete()', ()=>{
    it('sholud call the findOne() method and remove() methode from the productService',async()=>{
        productRepo.remove = jest.fn().mockResolvedValue(products[0]);
        productRepo.findOne = jest.fn().mockResolvedValue(products[0]);
        await productService.Delete(1);
        expect(productRepo.remove).toHaveBeenCalled();
        expect(productRepo.remove).toHaveBeenCalledTimes(1);
        expect(productRepo.findOne).toHaveBeenCalled();
        expect(productRepo.findOne).toHaveBeenCalledTimes(1);
    });
    it ('sholud return the product that we are successfully deleted', async ()=>{
        productRepo.remove = jest.fn().mockResolvedValue(products[0]);
        productRepo.findOne = jest.fn().mockResolvedValue(products[0]);
        const deleted_Product = await productService.Delete(1);
        expect(deleted_Product).toBe(products[0]);
    });
    it ('sholud throw exption if there is no products to delete with the given id ',async()=>{
        productRepo.findOne = jest.fn().mockResolvedValue(null);
        productRepo.remove = jest.fn().mockResolvedValue(products[0]);
        await expect(productService.Delete(1)).rejects.toThrow(NotFoundException);
    })

})
}) })


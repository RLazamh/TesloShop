import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { PagintationDto } from '../common/dtos';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [] , ...productDetail } = createProductDto 
      const product= this.productRepository.create({
        ...productDetail,
        images: images.map( (image) => this.productImageRepository.create({ url: image })) 
      });
      await this.productRepository.save(product);

      return {...product, images};

    } catch (error) {
      this.handleDBError( error )
    }
  }

  async findAll( pagintationDto: PagintationDto) {
    const { limit = 10 , offset = 0 } = pagintationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images: true,
      }
    });

    return products.map( product => {
      const newProduct = {
        ...product,
        images: product.images.map(image => image.url)
      } 
      return newProduct;
    })
  }
  
  async findOne(term: string) : Promise<Product> {
    let product: Product;
    if( isUUID(term) ){
      product =  await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('product'); // alias of table 
      product =  await query
        .where('LOWER(title) =LOWER(:title) or slug =:slug',{
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('product.images','productImages')
        .getOne();
    }
    if( !product )
      throw new NotFoundException(`Product with term ${ term } not exists`)
    return product;
  }

  async findOnePlane(term : string) {
    const { images=[] , ...rest } = await this.findOne( term );

    return {
      ...rest,
      images: images.map( image => image.url )

    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images , ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id: id, ...toUpdate });
    if( !product ) throw new NotFoundException(`Product with id ${ id } not exists`);

    const queryRunner = this.dataSource.createQueryRunner();

    queryRunner.connect();
    queryRunner.startTransaction();

    try {

      if( images ) {
        await queryRunner.manager.delete(ProductImage , { product : id });
        product.images = images.map( (image) => 
          queryRunner.manager.create( ProductImage , { url: image })
        ); 
      } else {

      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save(product);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBError( error )      
    }
    return this.findOnePlane( id );
  }

  async remove(id: string) {
    try {
      const product = await this.findOne( id );
      this.productRepository.remove( product );
    } catch (error) {
      this.handleDBError( error );
      
    }
  }

  handleDBError( error: any ){
    if(error.code === '23505')
      throw new BadRequestException(error.detail)
    
    this.logger.error(error);
    throw new BadRequestException(`Unexpected error, verify logs`);
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      query
        .delete()
        .where({})
        .execute();

      return true;
      
    } catch (error) {
      this.handleDBError(error);
    }
    
  }
}

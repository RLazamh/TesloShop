import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'
import { PagintationDto } from '../common/dtos';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create( createProductDto );
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBError( error )
    }
  }

  findAll( pagintationDto: PagintationDto) {
    const { limit = 10 , offset = 0 } = pagintationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO Relationship
    });
  }

  async findOne(term: string) : Promise<Product> {
    let product: Product;
    if( isUUID(term) ){
      product =  await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder();
      product =  await query
        .where('LOWER(title) =LOWER(:title) or slug =:slug',{
          title: term,
          slug: term,
        }).getOne();
    }
    if( !product )
      throw new NotFoundException(`Product with term ${ term } not exists`)
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })
    if( !product ) throw new NotFoundException(`Product with id ${ id } not exists`)

    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBError( error )      
    }
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    this.productRepository.remove( product );
  }

  handleDBError( error: any ){
    if(error.code === '23505')
      throw new BadRequestException(error.detail)
    
    this.logger.error(error);
    throw new BadRequestException(`Unexpected error, verify logs`);
  }
}

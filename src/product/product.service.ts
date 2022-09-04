import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findAll() {
    return this.productRepository.find();
  }

  async findOne(id: string) : Promise<Product> {
    const product =  await this.productRepository.findOneBy({ id });
    if( !product )
      throw new NotFoundException(`Product with uuid ${ id } no exists`)
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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

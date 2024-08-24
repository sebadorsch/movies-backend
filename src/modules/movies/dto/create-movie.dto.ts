import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateMovieDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  director: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  episode_id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  opening_crawl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  producer?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  release_date?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  species: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  starships: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  vehicles: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  characters: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  planets: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;
}

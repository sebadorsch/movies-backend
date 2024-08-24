import { ApiProperty, OmitType } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class MovieDto {
  @ApiProperty({ description: 'The unique identifier for the movie' })
  id: number;

  @ApiProperty({ description: 'The title of this film' })
  title: string;

  @ApiProperty({ description: 'The episode number of this film' })
  episode_id: number;

  @ApiProperty({
    description: 'The opening paragraphs at the beginning of this film',
  })
  opening_crawl: string;

  @ApiProperty({ description: 'The name of the director of this film' })
  director: string;

  @ApiProperty({
    description: 'The name(s) of the producer(s) of this film. Comma separated',
  })
  producer: string;

  @ApiProperty({
    description:
      'The ISO 8601 date format of film release at original creator country',
  })
  release_date: string;

  @ApiProperty({
    description: 'An array of species resource URLs that are in this film',
  })
  species: string[];

  @ApiProperty({
    description: 'An array of starship resource URLs that are in this film',
  })
  starships: string[];

  @ApiProperty({
    description: 'An array of vehicle resource URLs that are in this film',
  })
  vehicles: string[];

  @ApiProperty({
    description: 'An array of people resource URLs that are in this film',
  })
  characters: string[];

  @ApiProperty({
    description: 'An array of planet resource URLs that are in this film',
  })
  planets: string[];

  @ApiProperty({ description: 'The hypermedia URL of this resource' })
  url: string;

  @ApiProperty({
    description:
      'The ISO 8601 date format of the time that this resource was created',
    type: Date,
  })
  created: Date;

  @ApiProperty({
    description:
      'The ISO 8601 date format of the time that this resource was edited',
    type: Date,
  })
  edited: Date;
}

export class CreateMovieDto extends OmitType(MovieDto, [
  'id',
  'created',
  'edited',
] as const) {}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

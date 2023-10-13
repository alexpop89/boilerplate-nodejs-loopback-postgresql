import {Entity, model, property} from '@loopback/repository';

@model()
export class Timestampable extends Entity {
  @property({
    type: 'date',
    default: '$now',
    postgresql: {
      columnName: 'created_at',  // this is where the magic happens
    },
  })
  createdAt?: string;

  @property({
    type: 'date',
    default: '$now',
    postgresql: {
      columnName: 'updated_at',  // this is where the magic happens
    },
  })
  updatedAt?: string;


  constructor(data?: Partial<Timestampable>) {
    super(data);
  }
}

export interface TimestampableRelations {
  // describe navigational properties here
}

export type TimestampableWithRelations = Timestampable & TimestampableRelations;

import {model, property, belongsTo} from '@loopback/repository';
import {Timestampable} from '.';
import {User} from './user.model';

@model({
  settings: {
    postgresql: {schema: 'public', table: 'refresh_tokens'},
  },
})
export class RefreshToken extends Timestampable {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  value: string;

  @property({
    type: 'date',
  })
  expires?: Date;

  @belongsTo(() => User, {name: 'user', keyTo: 'user_id'})
  userId: number;

  user: User;

  constructor(data?: Partial<RefreshToken>) {
    super(data);
  }
}

export interface RefreshTokenRelations {
  // describe navigational properties here
}

export type RefreshTokenWithRelations = RefreshToken & RefreshTokenRelations;

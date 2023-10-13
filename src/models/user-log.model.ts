import {model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Timestampable} from './__timestampable.model';

@model({
  settings: {
    postgresql: {schema: 'public', table: 'user_logs'},
  },
})
export class UserLog extends Timestampable {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'object',
  })
  data?: object;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<UserLog>) {
    super(data);
  }
}

export interface UserLogRelations {
  // describe navigational properties here
}

export type UserLogWithRelations = UserLog & UserLogRelations;

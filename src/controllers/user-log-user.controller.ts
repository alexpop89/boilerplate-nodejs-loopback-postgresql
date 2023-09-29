import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserLog,
  User,
} from '../models';
import {UserLogRepository} from '../repositories';

export class UserLogUserController {
  constructor(
    @repository(UserLogRepository)
    public userLogRepository: UserLogRepository,
  ) { }

  @get('/user-logs/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserLog',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof UserLog.prototype._id,
  ): Promise<User> {
    return this.userLogRepository.user(id);
  }
}

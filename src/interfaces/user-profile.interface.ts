import { UserProfile as LoopbackUserProfile } from '@loopback/security';
import {Role} from '../models';

export interface UserProfile extends LoopbackUserProfile {
  id: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  roles?: Role[];
}
import {Role} from '../../models';
import {Context, CoreBindings, InvocationContext} from '@loopback/core';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {DefaultCrudRepository} from '@loopback/repository';

/**
 * `OwnershipCheckerUtil` is a utility class designed to handle permission
 * checking for different resources within the application. It is especially
 * useful in Loopback-based applications for its ability to dynamically resolve
 * repositories and permissions.
 *
 * @class OwnershipCheckerUtil
 */
export class OwnershipCheckerUtil {
  /**
   * Constructor that initializes the Loopback context.
   *
   * @param {Context} ctx - Injected Loopback context.
   */
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) protected ctx: Context) {}

  /**
   * Checks permission for resources that are not owned by the current user.
   *
   * @param {Role} role - Role object containing conditions and permissions.
   * @param {string} modelName - Name of the model being accessed.
   * @param {number} currentUserId - ID of the current user.
   * @param {InvocationContext} invocationContext - Context in which the method is called.
   *
   * @returns {Promise<boolean>} - True if access is allowed, false otherwise.
   */
  protected async isPermissionAllowedByOtherOwnership(role: Role, modelName: string, currentUserId: number, invocationContext: InvocationContext): Promise<boolean> {
    // Get dynamic repository based on model name
    const dynamicRepo = await this.getDynamicRepo(modelName, invocationContext.target);
    const entityId = parseInt(invocationContext.args[0], 10);

    let allowed = false;
    for (const condition of role.conditions) {
      allowed = allowed || (await this.checkPermission(dynamicRepo, entityId, currentUserId, condition.ownershipField, condition.value).catch(() => false));
    }

    return allowed;
  }

  /**
   * Checks permission for resources that are owned by the current user by ID.
   *
   * @param {Role} role - Role object containing conditions and permissions.
   * @param {string} modelName - Name of the model being accessed.
   * @param {string} httpMethod - HTTP method being used.
   * @param {number} currentUserId - ID of the current user.
   * @param {string} methodName - Name of the method being accessed.
   * @param {InvocationContext} invocationContext - Context in which the method is called.
   *
   * @returns {Promise<boolean>} - True if access is allowed, false otherwise.
   */
  protected async isPermissionAllowedByIdOwnership(
    role: Role,
    modelName: string,
    httpMethod: string,
    currentUserId: number,
    methodName: string,
    invocationContext: InvocationContext,
  ): Promise<boolean> {
    let targetId: number = -1;
    if (methodName.includes('ById')) {
      targetId = parseInt(invocationContext.args[0], 10);
    }

    for (const condition of role.conditions) {
      if ((condition.modelName === modelName || condition.modelName === '*') && (condition.permissions.includes(httpMethod) || condition.permissions.includes('*'))) {
        if (condition.ownershipField === 'id' && condition.value === '$currentUserId') {
          if (currentUserId === targetId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Core method that checks if a user has permission to access a resource.
   *
   * @param {DefaultCrudRepository} dynamicRepo - Dynamic repository resolved based on model name.
   * @param {number} id - ID of the entity.
   * @param {number} currentUserId - ID of the current user.
   * @param {string} ownershipField - Field to check ownership against.
   * @param {string | undefined} ownershipValue - Value to compare for ownership.
   *
   * @returns {Promise<boolean>} - True if access is allowed, false otherwise.
   */
  private async checkPermission(
    dynamicRepo: DefaultCrudRepository<never, never, never>,
    id: number,
    currentUserId: number,
    ownershipField: string,
    ownershipValue: string | undefined,
  ) {
    if (ownershipValue === '*' && ownershipField === '*') {
      return true;
    }

    // Fetch the record based on ID and ownership field
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const entityRecord = await dynamicRepo.findById(id, {
      fields: [ownershipField],
    });

    // Check if ownership values match
    if (ownershipValue === '$currentUserId') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (entityRecord[ownershipField] !== currentUserId) {
        throw new HttpErrors.Forbidden('You are not allowed to access this resource');
      }
    }

    return true;
  }

  /**
   * Dynamically resolve and return a repository based on the model name.
   *
   * @param {string} modelName - Name of the model.
   * @param {ControllerClass} invocationContextTarget - The invocation context loopback target
   *
   * @returns {Promise<DefaultCrudRepository>} - Resolved repository.
   */
  private async getDynamicRepo(modelName: string, invocationContextTarget: unknown): Promise<DefaultCrudRepository<never, never, never>> {
    try {
      return await this.ctx.get(`repositories.${modelName}Repository`);
    } catch (ignore) {
      // If the repository could not be found it's probably because we're dealing with a relationship
      // for example User -> Role, but there is no UserRole repository. However, there is a UserRole model
      // In this case, we check access to the first repository in the invocation context target
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const repositoryName = Object.keys(invocationContextTarget)[0];
      return await this.ctx.get(`repositories.${capitalize(repositoryName)}`);
    }
  }
}

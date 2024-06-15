import {
  IsUUID,
  ValidateNested,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isUUID,
  registerDecorator,
} from 'class-validator';
import { TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { APIOutput } from '@takaro/http';

export class ParamId {
  @IsUUID('4')
  id!: string;
}

export class ParamIdAndRoleId extends ParamId {
  @IsUUID('4')
  roleId!: string;
}

export class PogParam {
  @IsUUID('4')
  gameServerId!: string;

  @IsUUID('4')
  playerId!: string;
}

export class IdUuidDTO extends TakaroDTO<IdUuidDTO> {
  @IsUUID('4')
  id!: string;
}

export class IdUuidDTOAPI extends APIOutput<IdUuidDTO> {
  @Type(() => IdUuidDTO)
  @ValidateNested()
  declare data: IdUuidDTO;
}

@ValidatorConstraint({ async: true })
export class IsTypeOrArrayOfType<T> implements ValidatorConstraintInterface {
  private typeCheck: (value: unknown) => value is T;

  constructor(typeCheck: (value: unknown) => value is T) {
    this.typeCheck = typeCheck;
  }

  public async validate(value: unknown) {
    return this.typeCheck(value) || (Array.isArray(value) && value.every(this.typeCheck));
  }
}

function createTypeOrArrayOfTypeDecorator<T>(
  typeCheck: (value: unknown) => value is T
): (validationOptions?: ValidationOptions) => PropertyDecorator {
  return (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string | symbol) => {
      registerDecorator({
        target: object.constructor,
        propertyName: String(propertyName),
        options: validationOptions,
        constraints: [],
        validator: new IsTypeOrArrayOfType<T>(typeCheck),
      });
    };
  };
}

export const IsStringOrArrayOfString = createTypeOrArrayOfTypeDecorator<string>(
  (value): value is string => typeof value === 'string'
);
export const IsNumberOrArrayOfNumber = createTypeOrArrayOfTypeDecorator<number>(
  (value): value is number => typeof value === 'number'
);
export const IsBooleanOrArrayOfBoolean = createTypeOrArrayOfTypeDecorator<boolean>(
  (value): value is boolean => typeof value === 'boolean'
);
export const IsUUIDOrArrayOfUUID = createTypeOrArrayOfTypeDecorator<string>(
  (value): value is string => typeof value === 'string' && isUUID(value)
);

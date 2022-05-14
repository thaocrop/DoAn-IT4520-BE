import { ReflectMetaKeyEnum } from 'src/enums';

// decorators/Controller.decorators.ts
export const Controller = (prefix: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(ReflectMetaKeyEnum.Prefix, prefix, target);
    if (!Reflect.hasMetadata(ReflectMetaKeyEnum.Routes, target)) {
      Reflect.defineMetadata(ReflectMetaKeyEnum.Routes, [], target);
    }
  };
};

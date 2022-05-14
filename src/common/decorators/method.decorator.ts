// decorators/Get.decorator.ts

import { ReflectMetaKeyEnum, MethodEnum } from 'src/enums';
import { IRouteDefinition } from 'src/interfaces';

export const Get = (path: string): MethodDecorator => {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata(ReflectMetaKeyEnum.Routes, target.constructor)) {
      Reflect.defineMetadata(ReflectMetaKeyEnum.Routes, [], target.constructor);
    }

    const routes: IRouteDefinition[] = Reflect.getMetadata(ReflectMetaKeyEnum.Routes, target.constructor);
    routes.push({
      requestMethod: MethodEnum.GET,
      path,
      methodName: propertyKey,
    });

    Reflect.defineMetadata(ReflectMetaKeyEnum.Routes, routes, target.constructor);
  };
};

export const Post = (path: string): MethodDecorator => {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata(ReflectMetaKeyEnum.Routes, target.constructor)) {
      Reflect.defineMetadata(ReflectMetaKeyEnum.Routes, [], target.constructor);
    }

    const routes: IRouteDefinition[] = Reflect.getMetadata(ReflectMetaKeyEnum.Routes, target.constructor);
    routes.push({
      requestMethod: MethodEnum.POST,
      path,
      methodName: propertyKey,
    });

    Reflect.defineMetadata(ReflectMetaKeyEnum.Routes, routes, target.constructor);
  };
};

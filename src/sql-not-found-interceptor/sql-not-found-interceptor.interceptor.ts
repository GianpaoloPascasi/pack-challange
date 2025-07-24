import { NoSuchKey } from "@aws-sdk/client-s3";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from "@nestjs/common";
import { NoResultError } from "kysely";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class SqlNotFoundInterceptorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: Error) =>
        throwError(() => {
          if (err instanceof NoResultError || err instanceof NoSuchKey) {
            return new NotFoundException();
          } else {
            return err;
          }
        }),
      ),
    );
  }
}

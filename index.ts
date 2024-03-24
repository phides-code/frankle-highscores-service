import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';

import { router } from './router';
import { LambdaHandlerParams } from './types';

export const lambdaHandler = (
    event: APIGatewayEvent,
    _context: Context,
    callback: APIGatewayProxyCallback
): void => {
    const handlerParams: LambdaHandlerParams = {
        callback,
        event,
    };

    router(handlerParams);
};

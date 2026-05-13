import { Context, APIGatewayEvent } from 'aws-lambda';

import { router } from './router';
import { LambdaHandlerParams } from './types';

export const lambdaHandler = (
    event: APIGatewayEvent,
    _context: Context,
): void => {
    const handlerParams: LambdaHandlerParams = {
        event,
    };

    router(handlerParams);
};

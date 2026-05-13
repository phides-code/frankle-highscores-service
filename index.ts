import { Context, APIGatewayEvent } from 'aws-lambda';

import { router } from './router';
import { LambdaHandlerParams } from './types';

export const lambdaHandler = async (
    event: APIGatewayEvent,
    _context: Context,
) => {
    const handlerParams: LambdaHandlerParams = {
        event,
    };

    return router(handlerParams);
};

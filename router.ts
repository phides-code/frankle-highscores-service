import { ApiPath, headers, localMode } from './constants';
import { insertEntity, listEntities } from './database';
import {
    clientError,
    handleError,
    serverError,
    validateEntity,
} from './helpers';
import { Entity, LambdaHandlerParams, ResponseStructure } from './types';

export const router = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;

    if (!localMode) {
        const awsCfToken = process.env.AWS_CF_TOKEN;

        if (awsCfToken === '') {
            return serverError('Error reading token');
        }

        const providedCfToken = event.headers['X-CF-Token'];

        if (!providedCfToken || providedCfToken !== awsCfToken) {
            return clientError(403, 'token mismatch');
        }
    }

    switch (event.httpMethod) {
        case 'GET':
            return processGet();
        case 'POST':
            return processPost(handlerParams);
        case 'OPTIONS':
            return processOptions();
        default:
            return clientError(405, 'method not allowed');
    }
};

const processGet = async () => {
    try {
        const entities: Entity[] = (await listEntities()) as Entity[];

        const response: ResponseStructure = {
            data: entities,
            errorMessage: null,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers,
        };
    } catch (err) {
        return handleError('processGet', err as Error);
    }
};

const processPost = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;
    try {
        const newEntity = JSON.parse(event.body as string);

        if (!validateEntity(newEntity)) {
            console.log('invalid newEntity');
            return clientError(400, 'invalid entity');
        }

        const entity: Entity = (await insertEntity(handlerParams)) as Entity;

        const response: ResponseStructure = {
            data: entity,
            errorMessage: null,
        };

        const locationHeader = {
            Location: `/${ApiPath}/${entity.id}`,
        };

        return {
            statusCode: 201,
            body: JSON.stringify(response),
            headers: { ...headers, ...locationHeader },
        };
    } catch (err) {
        return handleError('processPost', err as Error);
    }
};

const processOptions = async () => {
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': '3600',
    };

    return {
        statusCode: 200,
        body: '',
        headers: { ...headers, ...corsHeaders },
    };
};

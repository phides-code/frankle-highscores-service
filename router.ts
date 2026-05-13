import { APIGatewayProxyCallback } from 'aws-lambda';
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
    const { event, callback } = handlerParams;

    if (!localMode) {
        const awsCfToken = process.env.AWS_CF_TOKEN;

        if (awsCfToken === '') {
            return serverError('Error reading token', callback);
        }

        const providedCfToken = event.headers['X-CF-Token'];

        if (!providedCfToken || providedCfToken !== awsCfToken) {
            return clientError(403, 'token mismatch', callback);
        }
    }

    switch (event.httpMethod) {
        case 'GET':
            return processGet(handlerParams);
        case 'POST':
            return processPost(handlerParams);
        case 'OPTIONS':
            return processOptions(callback);
        default:
            return clientError(405, 'method not allowed', callback);
    }
};

const processGet = async (handlerParams: LambdaHandlerParams) => {
    const { callback } = handlerParams;
    try {
        const entities: Entity[] = (await listEntities()) as Entity[];

        const response: ResponseStructure = {
            data: entities,
            errorMessage: null,
        };

        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(response),
            headers,
        });
    } catch (err) {
        handleError('processGet', err as Error, callback);
    }
};

const processPost = async (handlerParams: LambdaHandlerParams) => {
    const { callback, event } = handlerParams;
    try {
        const newEntity = JSON.parse(event.body as string);

        if (!validateEntity(newEntity)) {
            console.log('invalid newEntity');
            return clientError(400, 'invalid entity', callback);
        }

        const entity: Entity = (await insertEntity(handlerParams)) as Entity;

        const response: ResponseStructure = {
            data: entity,
            errorMessage: null,
        };

        const locationHeader = {
            Location: `/${ApiPath}/${entity.id}`,
        };

        return callback(null, {
            statusCode: 201,
            body: JSON.stringify(response),
            headers: { ...headers, ...locationHeader },
        });
    } catch (err) {
        handleError('processPost', err as Error, callback);
    }
};

const processOptions = async (callback: APIGatewayProxyCallback) => {
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': '3600',
    };

    return callback(null, {
        statusCode: 200,
        body: '',
        headers: { ...headers, ...corsHeaders },
    });
};

import { APIGatewayProxyCallback } from 'aws-lambda';
import * as http from 'http';
import { NewOrUpdatedEntity, ResponseStructure } from './types';
import { headers, InvalidItemError } from './constants';

const ExampleNewOrUpdatedEntity: NewOrUpdatedEntity = {
    playername: '',
    wintime: 0,
    word: '',
};

export const validateEntity = (entity: any): boolean => {
    const entityKeys = Object.keys(entity);
    const interfaceKeys = Object.keys(ExampleNewOrUpdatedEntity);

    if (entityKeys.length !== interfaceKeys.length) {
        return false;
    }

    for (const key of entityKeys) {
        if (!interfaceKeys.includes(key)) {
            return false;
        }
    }

    return true;
};

export const handleError = (
    process: string,
    error: Error,
    callback: APIGatewayProxyCallback
) => {
    const errorMessage = error.message;
    console.log(process, 'caught error:', errorMessage);

    if (errorMessage === InvalidItemError) {
        return clientError(400, callback);
    }

    return serverError(callback);
};

export const clientError = (
    httpStatus: number,
    callback: APIGatewayProxyCallback
) => {
    console.log('send client error message');
    const errorMessage: string =
        http.STATUS_CODES[httpStatus] || 'Unknown Status';

    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return callback(null, {
        statusCode: httpStatus,
        body: JSON.stringify(response),
        headers,
    });
};

export const serverError = (callback: APIGatewayProxyCallback) => {
    console.log('send server error message');
    const errorMessage: string = http.STATUS_CODES[500] as string;

    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return callback(null, {
        statusCode: 500,
        body: JSON.stringify(response),
        headers,
    });
};

export const buildEntityFields = () => {
    let entityFields = 'id,';

    for (const prop in ExampleNewOrUpdatedEntity) {
        entityFields += ` ${prop},`;
    }

    return entityFields.slice(0, -1);
};

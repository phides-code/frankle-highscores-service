import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Entity, LambdaHandlerParams, NewOrUpdatedEntity } from './types';
import { buildEntityFields } from './helpers';
import { InvalidItemError, TableName } from './constants';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const listEntities = async () => {
    const entityFields = buildEntityFields();
    const command = new ScanCommand({
        ProjectionExpression: entityFields,
        TableName: TableName,
    });

    const response = await docClient.send(command);

    return response.Items as Entity[];
};

export const insertEntity = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;

    const newEntity: NewOrUpdatedEntity = JSON.parse(event.body as string);

    const newEntityWithId: Entity = {
        id: randomUUID(),
        ...newEntity,
    };

    const command = new PutCommand({
        TableName: TableName,
        Item: newEntityWithId,
    });

    await docClient.send(command);

    return newEntityWithId;
};

export const deleteEntity = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;
    const id: string = event.pathParameters?.id as string;

    const command = new DeleteCommand({
        TableName: TableName,
        Key: {
            id,
        },
        ReturnValues: 'ALL_OLD',
    });

    const response = await docClient.send(command);

    if (!response.Attributes) {
        throw new Error(InvalidItemError);
    }

    return response.Attributes as Entity;
};

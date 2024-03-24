import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Entity, LambdaHandlerParams, NewOrUpdatedEntity } from './types';
import { buildEntityFields } from './helpers';
import { TableName } from './constants';
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

const getWorstHighScore = async (): Promise<Entity | null> => {
    const allHighScores = await listEntities();

    if (allHighScores.length < 20) {
        return null;
    }

    return allHighScores.reduce((a, b) => (b.wintime > a.wintime ? b : a));
};

const deleteWorstHighscore = async () => {
    const worstHighscore = await getWorstHighScore();

    if (!worstHighscore) {
        return;
    }

    console.log('deleting worstHighscore:', worstHighscore);

    const command = new DeleteCommand({
        TableName: TableName,
        Key: { id: worstHighscore.id },
    });

    await docClient.send(command);
};

export const insertEntity = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;

    const newEntity: NewOrUpdatedEntity = JSON.parse(event.body as string);

    const newEntityWithId: Entity = {
        id: randomUUID(),
        ...newEntity,
    };

    await deleteWorstHighscore();

    const command = new PutCommand({
        TableName: TableName,
        Item: newEntityWithId,
    });

    await docClient.send(command);

    return newEntityWithId;
};

import { APIGatewayEvent } from 'aws-lambda';

export interface NewOrUpdatedEntity {
    playername: string;
    wintime: number;
    word: string;
}

export interface Entity extends NewOrUpdatedEntity {
    id: string;
}

export interface LambdaHandlerParams {
    event: APIGatewayEvent;
}

export interface ResponseStructure {
    data: Entity[] | Entity | null;
    errorMessage: string | null;
}

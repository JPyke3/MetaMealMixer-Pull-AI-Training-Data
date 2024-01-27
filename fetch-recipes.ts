import { fromSSO } from '@aws-sdk/credential-provider-sso';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ConfiguredRetryStrategy } from '@aws-sdk/util-retry';
import fs from 'fs';
import { sleep } from 'openai/core';

const credentials = await fromSSO({ profile: 'inspire-wellness' })();
const client = new DynamoDBClient({
	region: 'ap-southeast-2',
	credentials: credentials,
	retryStrategy: new ConfiguredRetryStrategy(6, 200)
});
const docClient = DynamoDBDocumentClient.from(client);
const recipies = [];
var lastEvaluatedKey = undefined;
var success = false;

while (!success) {
    try {
        do {
            const command: ScanCommand = new ScanCommand({
                TableName: 'recipes',
                FilterExpression: 'attribute_exists(originalPrompt)',
                ExclusiveStartKey: lastEvaluatedKey
            });
            const response = await docClient.send(command);
            if (!response.Items) {
                throw new Error('No items returned');
            }
            for (const item of response.Items) {
                recipies.push(item);
            }
            lastEvaluatedKey = response.LastEvaluatedKey;
            success = true; // If the command is successful, set success to true to exit the loop
        } while (lastEvaluatedKey);
    } catch (e: any) {
        if (e.name === 'ProvisionedThroughputExceededException') {
            await sleep(1000); // If the exception is thrown, sleep for a second and then retry
            success = false; // Set success to false to retry the command
        } else {
            throw e; // If the exception is not ProvisionedThroughputExceededException, rethrow it
        }
    }
}

fs.writeFileSync('recipes.json', JSON.stringify(recipies, null, 2));

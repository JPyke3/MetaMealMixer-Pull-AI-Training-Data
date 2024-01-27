import { fromSSO } from '@aws-sdk/credential-provider-sso';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import fs from 'fs';

const credentials = await fromSSO({ profile: 'inspire-wellness'})();
const client = new DynamoDBClient({
	region: 'ap-southeast-2',
	credentials: credentials
});
const docClient = DynamoDBDocumentClient.from(client);

const command = new ScanCommand({
	TableName: 'recipes',
	FilterExpression: 'attribute_exists(originalPrompt)'
});

const response = await docClient.send(command);
const recipes = response.Items;
fs.writeFileSync('recipes.json', JSON.stringify(recipes, null, 2));

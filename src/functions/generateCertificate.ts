import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from 'src/services/dynamoClient';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ICreateCertificate {
	id: string;
	name: string;
	grade: string;
}

interface ITemplate {
	id: string;
	name: string;
	grade: string;
	medal: string;
	date: string;
}

const compile = async (data: ITemplate) => {
	const filePath = path.join(
		process.cwd(),
		'src',
		'templates',
		'certifications.hbs'
	);

	const html = readFileSync(filePath, 'utf-8');

	return handlebars.compile(html)(data);
};

export const handler: APIGatewayProxyHandler = async (event) => {
	const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

	const Item = {
		id,
		name,
		grade,
		created_at: new Date(),
	};

	await document
		.put({
			TableName: 'users_certificate',
			Item,
		})
		.promise();

	const response = await document
		.query({
			TableName: 'users_certificate',
			KeyConditionExpression: 'id=id',
			ExpressionAttributeValues: {
				id: id,
			},
		})
		.promise();

	const medalPath = join(process.cwd(), 'src', 'templates', 'selo.png');

	const medal = readFileSync(medalPath, 'base64');

	const data: ITemplate = {
		name,
		id,
		grade,
		date: Item.created_at.toLocaleDateString(),
		medal,
	};

	await compile(data);

	return {
		statusCode: 201,
		body: JSON.stringify(response.Items[0]),
	};
};

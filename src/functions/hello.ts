import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async ()=>{
    return {
        statusCode: 201,
        body:JSON.stringify({
            message:'Hello world serverless'
        })
    }

}
import { DynamoDB } from "aws-sdk";

export const findByAccountIdAndScheduledDay = async (
  dynamodb: DynamoDB,
  accountId: string,
  scheduledDay: string
) => {
  const params: DynamoDB.QueryInput = {
    TableName: "scheduled-drugs-2",
    KeyConditionExpression:
      "scheduledDay = :scheduledDay and begins_with(accountDrugDoseIdentifier, :accountId)",
    ExpressionAttributeValues: {
      ":scheduledDay": { S: scheduledDay },
      ":accountId": { S: accountId },
    },
  };

  return dynamodb.query(params).promise();
};

export const findForAllAccountsByScheduledDateTime = async (
  dynamodb: DynamoDB,
  scheduledDateTime: string
) => {
  const params: DynamoDB.QueryInput = {
    TableName: "scheduled-drugs-2",
    IndexName: "ScheduledTimeIndex",
    KeyConditionExpression: "scheduledTime = :scheduledTime",
    ExpressionAttributeValues: {
      ":scheduledTime": { S: scheduledDateTime },
    },
  };

  return dynamodb.query(params).promise();
};

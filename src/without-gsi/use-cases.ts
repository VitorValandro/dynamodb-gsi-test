import { DynamoDB } from "aws-sdk";

export const findByAccountIdAndScheduledDay = async (
  dynamodb: DynamoDB,
  accountId: string,
  scheduledDay: string
) => {
  const params: DynamoDB.QueryInput = {
    TableName: "scheduled-drugs-1",
    KeyConditionExpression:
      "scheduledDay = :scheduledDay and begins_with(accountDrugDoseIdentifier, :accountId)",
    ExpressionAttributeValues: {
      ":scheduledDay": { S: scheduledDay },
      ":accountId": { S: accountId },
    },
  };

  return dynamodb.query(params).promise();
};

export const findForAllAccountsByScheduledDay = async (
  dynamodb: DynamoDB,
  scheduledDay: string
) => {
  const params: DynamoDB.QueryInput = {
    TableName: "scheduled-drugs-1",
    KeyConditionExpression: "scheduledDay = :scheduledDay",
    ExpressionAttributeValues: {
      ":scheduledDay": { S: scheduledDay },
    },
  };

  return dynamodb.query(params).promise();
};

export const findForAllAccountsByScheduledDateTime = async (
  dynamodb: DynamoDB,
  scheduledDateTime: string
) => {
  const scheduledDay = scheduledDateTime.split("T")[0];
  const scheduledTimeHour = scheduledDateTime.split(":")[0];

  const params: DynamoDB.QueryInput = {
    TableName: "scheduled-drugs-1",
    KeyConditionExpression: "scheduledDay = :scheduledDay",
    FilterExpression: "begins_with(scheduledTime, :scheduledTimeHour)",
    ExpressionAttributeValues: {
      ":scheduledDay": { S: scheduledDay },
      ":scheduledTimeHour": { S: scheduledTimeHour },
    },
  };

  return dynamodb.query(params).promise();
};

import express from "express";
import { DynamoDB } from "aws-sdk";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  findByAccountIdAndScheduledDay,
  findForAllAccountsByScheduledDateTime,
} from "./use-cases";
import { deleteTable, fillTable, getAllItems } from "../common";

const app = express();
const port = 3001;

const dynamoDBConfig = {
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "local",
  secretAccessKey: "local",
};
const dynamoDB = new DynamoDB(dynamoDBConfig);
const tableName = "scheduled-drugs-2";

app.get("/delete-table", (req, res) => deleteTable(res, tableName, dynamoDB));
app.get("/fill-table", async (req, res) => fillTable(res, tableName, dynamoDB));
app.get("/get-all-items", async (req, res) =>
  getAllItems(res, tableName, dynamoDB)
);

/**
 * This creates a table with a composite key and a global secondary index
 */
app.get("/create-table", async (req, res) => {
  try {
    const createTableParams: DynamoDB.CreateTableInput = {
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: "scheduledDay", AttributeType: "S" },
        { AttributeName: "accountDrugDoseIdentifier", AttributeType: "S" },
        { AttributeName: "scheduledTime", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "scheduledDay", KeyType: "HASH" },
        { AttributeName: "accountDrugDoseIdentifier", KeyType: "RANGE" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: "ScheduledTimeIndex",
          KeySchema: [{ AttributeName: "scheduledTime", KeyType: "HASH" }],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
    };

    await dynamoDB.createTable(createTableParams).promise();
    res.json({ message: `Table ${tableName} created successfully` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Use case 1: Fetch scheduled drugs for the mobile app
 * Should get all medications scheduled for a specific account in a given day
 * Filters by accountId and scheduledDay
 */
app.get("/fetch-for-app", async (req, res) => {
  const { accountId, scheduledDay } = req.query as {
    accountId: string;
    scheduledDay: string;
  };
  try {
    const result = await findByAccountIdAndScheduledDay(
      dynamoDB,
      accountId,
      scheduledDay
    );

    const items = result.Items?.map((item) => unmarshall(item));
    res.json({ items });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Use case 2: Fetch scheduled drugs for the push notifications
 * Should get all medications scheduled for all accounts in a given hour
 * Filters by scheduledDateTime
 *
 * this uses the GSI to filter by hour
 */
app.get("/fetch-for-push-notifications", async (req, res) => {
  const { scheduledDateTime } = req.query as { scheduledDateTime: string };
  const date = new Date(scheduledDateTime);
  const scheduledTimeHours = date.getHours();
  date.setHours(scheduledTimeHours, 0, 0, 0);

  try {
    const result = await findForAllAccountsByScheduledDateTime(
      dynamoDB,
      date.toISOString()
    );

    const items = result.Items?.map((item) => unmarshall(item));
    res.json({ items });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

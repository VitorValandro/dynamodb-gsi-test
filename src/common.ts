import { DynamoDB } from "aws-sdk";
import { Response } from "express";
import { scheduledDrugs } from "./data";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const deleteTable = async (
  res: Response,
  tableName: string,
  dynamoDB: DynamoDB
) => {
  try {
    await dynamoDB.deleteTable({ TableName: tableName }).promise();
    res.json({ message: `Table ${tableName} deleted successfully` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fillTable = async (
  res: Response,
  tableName: string,
  dynamoDB: DynamoDB
) => {
  for (const drug of scheduledDrugs) {
    const scheduledDay = drug.scheduledTime.toISOString().split("T")[0];

    const accountDrugDoseIdentifier = `${
      drug.accountId
    }_${drug.scheduledTime.toISOString()}_${drug.medicationCategoryId}_${
      drug.drugId
    }`;

    const itemParams: DynamoDB.PutItemInput = {
      TableName: tableName,
      Item: {
        scheduledDay: { S: scheduledDay },
        accountDrugDoseIdentifier: { S: accountDrugDoseIdentifier },
        scheduledTime: { S: drug.scheduledTime.toISOString() }, // we need this to alternative 2 for use case 2
      },
    };

    try {
      await dynamoDB.putItem(itemParams).promise();
      console.log(`Item added to table: ${JSON.stringify(itemParams)}`);
    } catch (error) {
      console.error("Error adding item to table:", error);
    }
  }
  res.json({ message: "Items added to table" });
};

export const getAllItems = async (
  res: Response,
  tableName: string,
  dynamoDB: DynamoDB
) => {
  try {
    const scanParams: DynamoDB.ScanInput = {
      TableName: tableName,
    };
    const result = await dynamoDB.scan(scanParams).promise();
    const items = result.Items?.map((item) => unmarshall(item));
    res.json({ items });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

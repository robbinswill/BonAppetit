import os
import json
import boto3
url_table = os.environ['URL_TABLE']
recipe_table = os.environ['RECIPE_TABLE']
dynamodb = boto3.resource('dynamodb')


def handler(event, context):

    # get recipe table to write data to
    recipe_table = dynamodb.Table('dynamodb-recipe-table')

    # get important event info: id, user, recipe URL
    print(str(event["Records"][0]["dynamodb"]["NewImage"]))
    newImage = event["Records"][0]["dynamodb"]["NewImage"]
    owner = newImage['owner']['S']
    id = newImage['id']['S']
    url = newImage['url']['S']
    print(owner)
    print(id)
    print(url)



    return {
        'statusCode': 200,
        'body': {}
    }
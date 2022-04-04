import os
import json
import sys

sys.path.append('./boto3-layer')
sys.path.append('./scraper-layer')

import boto3
# https://github.com/hhursev/recipe-scrapers
from recipe_scrapers import scrape_me

url_table = os.environ['URL_TABLE']
dynamodb = boto3.resource('dynamodb')


def handler(event, context):

    event_name = event['Records'][0]['eventName']

    if event_name == "INSERT":

        # print(str(event))
        # print(str(event['Records'][0]['dynamodb']['NewImage']))

        table = dynamodb.Table('dynamodb-url-table')
        newImage = event['Records'][0]['dynamodb']['NewImage']
        owner = newImage['id']['S']
        id = newImage['id']['S']
        url = newImage['url']['S']

        scraper = scrape_me(url)
        title = scraper.title()
        ingredients = scraper.ingredients()
        instructions = scraper.instructions()

        print(owner)
        print(id)
        print(url)
        print(title)
        print(ingredients)
        print(instructions)

        table.put_item(
            Item={
                'id': id,
                'url': url,
                'owner': owner,
                'title': title,
                'ingredients': ingredients,
                'instructions': instructions
            }
        )


    return {
        'statusCode': 200,
        'body': {}
    }
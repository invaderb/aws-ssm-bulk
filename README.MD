# AWS ParamStore Bulk Create

NodeJS script that uses the aws sdk to bulk create/update parameters in aws paramstore

This could refactored to bulk create pretty much anything from the sdk for aws system store.

## getting started

Checkout the project

ensure you have the aws cli and loged into a admin profile or a profile that has the needed iam permissions to create system manager items.

install the dependencies
```
npm ci
```

Take a look at the params-example.json for a super simple example, add what ever you are trying to add.

run the script

```
node index.js --name {name 1} {name 2} --stage {stage 1} {stage 2} {stage 3} --path ./params-example.json
```

You can pass in the individual names and environments you want to create or don't pass anything and it will try to deploy all of them.

note path is a requirment.

### example config
```
[
	{
		"name": "example-service-name",
		"dev": [{
				Name: 'STRING_VALUE', /* required */
				Value: 'STRING_VALUE', /* required */
				AllowedPattern: 'STRING_VALUE',
				DataType: 'STRING_VALUE',
				Description: 'STRING_VALUE',
				KeyId: 'STRING_VALUE',
				Overwrite: true || false,
				Policies: 'STRING_VALUE',
				Tags: [
					{
						Key: 'STRING_VALUE', /* required */
						Value: 'STRING_VALUE' /* required */
					},
					/* more items */
				],
				Tier: Standard | Advanced | Intelligent-Tiering,
				Type: String | StringList | SecureString
			}
			/* more items */
		],
		"stage": [],
		"prod": []
	}
]
```

## TODO
- define aws config
- define path to params file
- unit test

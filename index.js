const ora = require('ora');
const spinner = ora('Loading Params').start();
const AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});
const ssm = new AWS.SSM();
const obj = require("./params.json");
const args = require('yargs/yargs')(process.argv.slice(2))
.option('n', {
	alias: 'name',
	describe: 'Names of configurations to deploy',
	type: 'array'
})
.option('s', {
	alias: 'stage',
	describe: 'stages of selected configurations to deploy',
	type: 'array'
}).argv;

const prepDeploy = (names, stages) => {
	let results = [];
	let params = filterObject(names, stages);
	params.forEach(x => {
		results.push(ssm.putParameter(x));
	});
	return results;
}

const filterObject = (names, stages) => {
	let tempArray = [];
	let returnArray = []
	// filter the names
	if(!names) {
		tempArray = obj
	} else {
		names.forEach(x => {
			const params = obj.filter(param => param.name === x);
			if(!params.length) {
				console.warn(`No names found by: ${x}`);
				return;
			};
			tempArray.push(params[0])
		});
	}
	if(!stages){
		// build array of params
		tempArray.forEach(y => {
			for (const key in y) {
				if(Array.isArray(y[key])) {
					returnArray = returnArray.concat(y[key]);
				}
			}
		}); 
		return returnArray;
	} else {
		//filter the stages
		stages.forEach(x => {
			tempArray.forEach(y => {
				if(y[x] === undefined || !y[x].length) {
					console.warn(`No stages found by: ${x}`)
					return;
				}
				returnArray = returnArray.concat(y[x]);
			})
		});
		return returnArray;
	}
	
}

async function doAllSequentually(arrFnPromiseList) {
	if(!arrFnPromiseList || !Array.isArray(arrFnPromiseList) || !arrFnPromiseList.length) { 
		spinner.fail();
		console.warn('Promise list doesnt exist or isnt an array. please check your json config file and ensure it is valid')
		return;
	}
	arrFnPromiseList.forEach(async (x)=> {await x.promise();});
}

doAllSequentually(prepDeploy(args.name, args.stage))
	.catch(console.warn)
	.then(() => spinner.succeed());

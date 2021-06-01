const ora = require('ora');
const spinner = ora('Loading Params').start();
const AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});
const ssm = new AWS.SSM();
const obj = require("./params.json");
const args = require('yargs/yargs')(process.argv.slice(2))
.array('name').array('stage').argv;

const prepDeploy = (names, stages) => {
	let results = [];
	let params = filterObject(names, stages);
	params.forEach(x => {
		results.push(ssm.putParameter(x));
	});
	return results;
}

const filterObject = (names, stages) => {
	let parent = [];
	if (!names) {parent = obj}
	// filter the names
	names.forEach(x => {
		const params = obj.filter(param => param.name === x);
		if(!params.length) {
			console.warn('No params found by name:', x);
			return;
		};
		parent.push(params[0])
	});
	let arr = []
	if(!stages){
		// build array of params
		parent.forEach(y => {
			for (const key in y) {
				if(Array.isArray(y[key])) {
					arr = arr.concat(y[key]);
				}
			}
		});
		return arr;
	}
	//filter the stages
	stages.forEach(x => {
		parent.forEach(y => {
			if(y[x] === undefined || !y[x].length) {
				console.warn('No prams found by stage: ', x)
				return;
			}
			arr = arr.concat(y[x]);
		})
	});
	return arr;
}

async function doAllSequentually(arrFnPromiseList) {
	if(!arrFnPromiseList || !Array.isArray(arrFnPromiseList)) { 
		spinner.fail();
		console.warn('Promise list doesnt exist or isnt an array.')
		return; 
	}
	arrFnPromiseList.forEach(async (x)=> {await x.promise();});
}

doAllSequentually(prepDeploy(args.name, args.stage)).catch(err => { console.warn(err)}).then(() => spinner.succeed());
const ora = require('ora');
const spinner = ora('Loading Params').start();
const AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-1'});
const ssm = new AWS.SSM();
const obj = require("./params.json");
const args = require('minimist')(process.argv.slice(2));

let names;
let stages;
let promises = [];

// no args deploy all
if(!args['name'] && !args['stage']) {
	// deploy all
	deployAll()
}

// has names but no stages
if(args['name'] && !args['stage']) {
	deploySomeName();
}

// has no name but has stages
if(!args['name'] && args['stage']) {
	deploySomeStage();
}

// has names and stages
if(args['name'] && args['stage']) {
	deploySome()
}

function deployAll() {
	for (let i = 0; i < obj.length; i++) {
		const el = obj[i];
		for (const key in el) {
			if(Array.isArray(el[key]) && el[key].length !== 0) {
				for (let j = 0; j < el[key].length; j++) {
					const child = el[key][j];
					promises.push(ssm.putParameter(child));
				}
			}
		}
	}
}

function deploySomeName() {
	names = args['name'];
	if(!args['name'].isArray) { names = [args['name']] }
	for (let i = 0; i < names.length; i++) {
		const el = names[i];
		const params = obj.filter(param => param.name === el);
		if(!params.length) return;
		for (const key in params[0]) {
			if(Array.isArray(params[0][key]) && params[0][key].length !== 0) {
				for (let j = 0; j < params[0][key].length; j++) {
					const child = params[0][key][j];
					promises.push(ssm.putParameter(child));
				}
			}
		}
	}
}

function deploySomeStage() {
	stages = args['stage'];
	if(!args['stage'].isArray) { stages = [args['stage']] }
	 
	for (let i = 0; i < obj.length; i++) {
		const el = obj[i];
		for (let j = 0; j < stages.length; j++) {
			const s = stages[j];
			const env = el[s];
			if(!env || !env.length) return;
			for (let k = 0; k < env.length; k++) {
				promises.push(ssm.putParameter(env[k]));		
			}
		}
	}
}

function deploySome() {
	names = args['name'];
	stages = args['stage'];
	if(!args['name'].isArray) { names = [args['name']] }
	if(!args['stage'].isArray) { stages = [args['stage']] }
	
	for (let i = 0; i < names.length; i++) {
		const el = names[i];
		const params = obj.filter(param => param.name === el);
		if(!params.length) return;
		for (let i = 0; i < stages.length; i++) {
			const el = stages[i];
			const env = params[0][el];
			if(!env || !env.length) return;
			for (let j = 0; j < env.length; j++) {
				promises.push(ssm.putParameter(env[j]));		
			}
		}
	}
}

async function doAllSequentually(fnPromiseArr) {
	for (let i=0; i < fnPromiseArr.length; i++) {
		const val = await fnPromiseArr[i].promise();
	}
}
doAllSequentually(promises).then(() => spinner.succeed());
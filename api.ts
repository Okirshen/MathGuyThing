// deno run --allow-net --allow-env --allow-read --unstable mod.ts
import 'https://deno.land/x/dotenv/load.ts';
import { Airtable } from 'https://deno.land/x/airtable/mod.ts';

const airtable = new Airtable({
	apiKey: Deno.env.get('API_KEY'),
	baseId: 'appw3fxRlHq9X5f8P',
	tableName: 'USERS',
});

type Fields = {
	['userID']: string;
	['Amount']: number;
	['IsActive']: boolean;
};

/**
 * returns the amount of users who sent more then {threshold} messages
 * @param threshold - minimum messages per week
 */
export const calc = async (threshold: number) => {
	let data = (await airtable.select<Fields>())?.records;

	console.log(`Calculating: ${data}`);

	data = data
		.filter(({ fields }) => fields.Amount >= threshold)
		.map(({ id, fields }) => {
			fields.IsActive = true;
			return { id, fields };
		});

	if (!data.length) return 0;

	airtable.update<Fields>(data);

	return data.length;
};

// console.log(await calc(10));

/**
 * clears all data in db
 */
export const clear = async () => {
	const data = (await airtable.select<Fields>())?.records;

	console.log(`deleting: ${data}`);

	if (!data.length) return;

	data.forEach(({ id }) => {
		airtable.delete(id);
	});
};

// clear();

/**
 * adds one message to message count
 * @param msgUserID - userID from the message author
 */
export const update = async (msgUserID: string) => {
	let data = (await airtable.select<Fields>())?.records;

	data = data
		.filter(({ fields: { userID } }) => userID === msgUserID)
		.map(({ id, fields }) => {
			fields.Amount++;
			return {
				id,
				fields,
			};
		});

	if (data.length) {
		airtable.update<Fields>(data);
	} else {
		airtable.create<Fields>({
			Amount: 1,
			IsActive: false,
			userID: msgUserID,
		});
	}
};

// update(123123);

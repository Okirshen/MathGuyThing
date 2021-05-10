import { weekly } from 'https://deno.land/x/deno_cron/cron.ts';
import { app } from 'https://deno.land/x/drex/mod.ts';
import 'https://deno.land/x/dotenv/load.ts';
import { clear, calc, update } from './api.ts';

weekly(clear);

// creates client with ~ prefixes
const client = app(['~']);

// runs on every message sent
client.hook((message) => {
	if (!message.author.bot) {
		update(message.author.id);
	}
});

client.command({
	name: 'count',
	aliases: ['c'],
	handler: async (msg) => {
		msg.reply(`${(await calc(10)).toString()} Users online`);
	},
});

client.listen(Deno.env.get('TOKEN'));

import {Inject, Container} from "ts-chassis";
import {MicrosoftAuthService} from "./MicrosoftAuthService";
import requestPromise = require("request-promise");
import {parseString} from "xml2js";
import {OptionsWithUri} from "request-promise";

export class TranslateService {
	@Inject private auth: MicrosoftAuthService;

	constructor() {
		this.auth = Container.get(MicrosoftAuthService);
	}

	private async sendRequest(options: OptionsWithUri) {
		let token = await this.auth.getToken();
		let authHeader = {
			Authorization: `Bearer ${token}`
		};
		if (options.headers) {
			options.headers = Object.assign(options.headers, authHeader);
		} else {
			options.headers = authHeader;
		}
		let response = await requestPromise(options);
		return new Promise<any>((resolve, reject) => {
			parseString(response, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	public async translate(text: string, from?: string, to?: string): Promise<string> {
		to = to || 'en';

		let result = await this.sendRequest({
			uri: 'http://api.microsofttranslator.com/v2/Http.svc/Translate',
			qs: {
				text: text,
				from: from,
				to: to,
			},
		});

		return result.string._;
	}

	public async detectLang(text: string): Promise<string> {
		let result = await this.sendRequest({
			uri: 'http://api.microsofttranslator.com/V2/Http.svc/Detect',
			qs: {
				text: text
			},
		});

		return result.string._;
	}
}
import {Inject, Container} from "ts-chassis";
import {MicrosoftAuthService} from "./MicrosoftAuthService";
import requestPromise = require("request-promise");
import {parseString} from "xml2js";
import {OptionsWithUri} from "request-promise";
import {Translation} from "../models/Translation";

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

	public async translate(texts: string[], from?: string, to?: string): Promise<Translation[]> {
		to = to || 'en';

		let result = await this.sendRequest({
			method: 'post',
			uri: 'http://api.microsofttranslator.com/V2/Http.svc/TranslateArray2',
			body: this.buildTranslateArrayXML(texts, from || '', to),
			headers: {
				"Content-Type": "application/xml",
			},
		});

		return TranslateService.transformToTranslations(texts, result);
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

	private buildTranslateArrayXML(texts: string[], from: string, to: string) {
		let textsXML = texts.map(x => `<string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${x}</string>`);
		return `
<TranslateArrayRequest>
  <AppId />
  <From>${from}</From>
  <Texts>
  ${textsXML}
  </Texts>
  <To>${to}</To>
</TranslateArrayRequest>
`;
	}

	private static transformToTranslations(texts: string[], object: any): Translation[] {
		let base = object.ArrayOfTranslateArray2Response;
		let ret: Translation[] = [];
		for (let i = 0; i < base.TranslateArray2Response.length; i++) {
			let translateResponse = base.TranslateArray2Response[i];
			let translation = new Translation();
			translation.alignment = translateResponse.Alignment[0];
			translation.originalText = texts[i];
			translation.machineTranslatedText = translateResponse.TranslatedText[0];
			ret.push(translation);
		}

		return ret;
	}
}

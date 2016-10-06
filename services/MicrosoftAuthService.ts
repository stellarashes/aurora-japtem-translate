import {Inject, Container} from "ts-chassis";
import {CacheService} from "ts-chassis";
import requestPromise = require("request-promise");

const key = 'microsoft.translate.token';

export class MicrosoftAuthService {
	@Inject cache: CacheService;

	constructor() {
		this.cache = Container.get(CacheService);
	}

    public async getToken() {
    	if (await this.cache.exists(key)) {
    		return this.cache.get(key);
	    }

	    let response = await requestPromise({
	    	method: 'post',
		    uri: 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
		    form: {
	    		grant_type: 'client_credentials',
			    client_id: process.env.TRANSLATE_CLIENT_ID,
			    client_secret: process.env.TRANSLATE_CLIENT_SECRET,
			    scope : 'http://api.microsofttranslator.com',
		    }
	    });

	    let tokenObj = JSON.parse(response);
	    let token = tokenObj.access_token;

	    this.cache.set(key, token).then(() => {
		    return this.cache.expire(key, parseInt(tokenObj.expires_in));
	    }); // not waiting before returning token
	    return token;
    }
}
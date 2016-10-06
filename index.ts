import {MicrosoftAuthService} from "./services/MicrosoftAuthService";
import {Container} from "ts-chassis";
import {Initializer} from "ts-chassis/bin/Initializer";
import {TranslateService} from "./services/TranslateService";

Initializer.run().then(() => {
	let service = Container.get(TranslateService);
	service.translate('魔人は踊る').then(console.log);
});

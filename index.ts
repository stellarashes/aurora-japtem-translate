import {Container} from "ts-chassis";
import {Initializer} from "ts-chassis/bin/Initializer";
import {TranslateService} from "./services/TranslateService";

Initializer.run().then(() => {
	let service = Container.get(TranslateService);
	service.translate(['皆様から色々なご指摘を頂き、全面的に加筆、修正を致しました。']).then(x => console.log(JSON.stringify(x))).catch(console.error);
});

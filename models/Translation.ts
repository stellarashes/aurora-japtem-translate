import {DataModel, Table, Column} from "ts-chassis";
import {DataTypes} from "sequelize";

@Table()
export class Translation extends DataModel {
	@Column({
		type: DataTypes.TEXT
	})
	originalText: string;

	@Column({
		type: DataTypes.TEXT
	})
	machineTranslatedText: string;

	@Column({
		type: DataTypes.TEXT
	})
	alignment: string;

}
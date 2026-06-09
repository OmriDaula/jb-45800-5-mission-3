import { AllowNull, AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import Meeting from "./Meeting";

// underscored: true maps TS camelCase fields to snake_case columns
// timestamps: false means there are NO created_at / updated_at columns
@Table({
    tableName: 'dev_teams',
    underscored: true,
    timestamps: false
})
export default class DevTeam extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    code: number

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string

    @HasMany(() => Meeting)
    meetings: Meeting[]

}

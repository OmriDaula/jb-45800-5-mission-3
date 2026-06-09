import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import DevTeam from "./DevTeam";

@Table({
    tableName: 'meetings',
    underscored: true,
    timestamps: false
})
export default class Meeting extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    code: number

    @ForeignKey(() => DevTeam)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    devTeamCode: number

    @AllowNull(false)
    @Column(DataType.DATE)
    startTime: Date

    @AllowNull(false)
    @Column(DataType.DATE)
    endTime: Date

    @AllowNull(false)
    @Column(DataType.TEXT)
    description: string

    @AllowNull(false)
    @Column(DataType.STRING)
    room: string

    @BelongsTo(() => DevTeam)
    devTeam: DevTeam

}

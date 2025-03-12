import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "role"
})
export class Roles extends Model{

    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;
}
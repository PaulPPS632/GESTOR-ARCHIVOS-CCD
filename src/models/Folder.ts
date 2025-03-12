import { AllowNull, BelongsTo, Column, DataType, ForeignKey, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./User";
@Table({
    tableName:'folder'
})
export class Folder extends Model{
    @IsUUID(4)
    @PrimaryKey
    @Column
    id!: string;

    @Column(DataType.STRING)
    name!: string;

    @Column(DataType.STRING)
    parentId!: string;

    @Column(DataType.STRING)
    path!: string;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.STRING)
    userId!: string;
    
    @BelongsTo(() => User)
    user!: User;

    @Column(DataType.BOOLEAN)
    isStarred!: boolean;

    @Column(DataType.BOOLEAN)
    isShared!: boolean;

}
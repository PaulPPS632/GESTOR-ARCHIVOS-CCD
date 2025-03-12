import { AllowNull, BelongsTo, Column, DataType, ForeignKey, IsUrl, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./User";
import { Folder } from "./Folder";
@Table({
    tableName:'file'
})
export class FileModel extends Model{
    @IsUUID(4)
    @PrimaryKey
    @Column
    id!: string;

    @Column(DataType.STRING)
    name!: string;

    @Column(DataType.STRING)
    type!: string;

    @IsUrl
    @Column(DataType.STRING)
    url!: string;

    @IsUrl
    @AllowNull(true)
    @Column(DataType.STRING)
    thumbnailUrl!: string;

    @Column(DataType.STRING)
    parentId!: string;

    @Column(DataType.STRING)
    path!: string;
 
    @ForeignKey(() => Folder)
    @Column(DataType.STRING)
    folderId!: string;

    @BelongsTo(() => Folder)
    folder!: User;

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
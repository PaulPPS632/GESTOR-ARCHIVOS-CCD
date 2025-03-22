import { AllowNull, BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, HasMany, IsEmail, Model, Table, Unique } from "sequelize-typescript";
import bcrypt from "bcryptjs";
import { Roles } from "./Roles";
import { SharedFolders } from "./SharedFolders";
@Table({
    tableName:'user'
})
export class User extends Model{
    @AllowNull(true)
    @Column(DataType.STRING)
    name!: string;

    @AllowNull(false)
    @Unique
    @IsEmail
    @Column(DataType.STRING)
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string;

    @AllowNull(false)
    @ForeignKey(() => Roles)
    @Column(DataType.INTEGER)
    rolId!: number;

    @BelongsTo(() => Roles)
    rol!: Roles;

    @HasMany(() => SharedFolders)
    sharedFolders!: SharedFolders[]

    @BeforeUpdate
    @BeforeCreate
    static async encryptpassword (instance: User) {
        if(instance.password != null){
            const salt = await bcrypt.genSalt(10);
            instance.password = await bcrypt.hash(instance.password,salt);
        }
    }

    static async comparePassword(password: string, hashPassword: string) {
        return await bcrypt.compare(password, hashPassword);
    }
}
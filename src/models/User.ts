import { AllowNull, BeforeCreate, BeforeUpdate, BelongsTo, Column, DataType, ForeignKey, IsEmail, IsUUID, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import bcrypt from "bcryptjs";
import { Roles } from "./Roles";
@Table({
    tableName:'user'
})
export class User extends Model{
    @IsUUID(4)
    @PrimaryKey
    @Column
    id!: string;

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


    @ForeignKey(() => Roles)
    @Column(DataType.INTEGER)
    rolId!: number;

    @BelongsTo(() => Roles)
    rol!: Roles;

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